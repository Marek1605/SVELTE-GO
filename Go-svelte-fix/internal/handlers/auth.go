package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// VendorLogin handles vendor login
func (h *Handler) VendorLogin(c *fiber.Ctx) error {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Invalid request body"})
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find vendor
	var vendorID, passwordHash, companyName, status string
	var shopID *string
	err := h.db.Pool.QueryRow(ctx, `
		SELECT id, password_hash, company_name, status
		FROM vendors WHERE email = $1
	`, input.Email).Scan(&vendorID, &passwordHash, &companyName, &status)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Nesprávny email alebo heslo"})
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(input.Password)); err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Nesprávny email alebo heslo"})
	}

	// Get shop
	h.db.Pool.QueryRow(ctx, `SELECT id FROM shops WHERE vendor_id = $1`, vendorID).Scan(&shopID)

	// Generate token
	token := generateToken()

	// Store session
	h.db.Pool.Exec(ctx, `
		INSERT INTO vendor_sessions (id, vendor_id, token, expires_at)
		VALUES (gen_random_uuid(), $1, $2, NOW() + INTERVAL '30 days')
	`, vendorID, token)

	// Get shop details
	var shop fiber.Map
	if shopID != nil {
		var shopName, displayMode string
		var creditBalance float64
		h.db.Pool.QueryRow(ctx, `
			SELECT shop_name, COALESCE(display_mode, 'free'), COALESCE(credit_balance, 0)
			FROM shops WHERE id = $1
		`, *shopID).Scan(&shopName, &displayMode, &creditBalance)
		
		shop = fiber.Map{
			"id":             *shopID,
			"shop_name":      shopName,
			"display_mode":   displayMode,
			"credit_balance": creditBalance,
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"token": token,
			"vendor": fiber.Map{
				"id":           vendorID,
				"email":        input.Email,
				"company_name": companyName,
				"status":       status,
			},
			"shop": shop,
		},
	})
}

// VendorRegister handles vendor registration
func (h *Handler) VendorRegister(c *fiber.Ctx) error {
	var input struct {
		Email         string `json:"email"`
		Password      string `json:"password"`
		Name          string `json:"name"`           // Meno a priezvisko
		CompanyName   string `json:"company_name"`   // Názov firmy/obchodu
		ContactPerson string `json:"contact_person"` // Kontaktná osoba
		ShopName      string `json:"shop_name"`
		ShopURL       string `json:"shop_url"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Invalid request body"})
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	if input.Email == "" || input.Password == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Email a heslo sú povinné"})
	}

	// Default values
	if input.Name == "" && input.ContactPerson != "" {
		input.Name = input.ContactPerson
	}
	if input.CompanyName == "" && input.ShopName != "" {
		input.CompanyName = input.ShopName
	}
	if input.Name == "" {
		input.Name = input.CompanyName // Fallback
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if email exists
	var exists bool
	h.db.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM vendors WHERE email = $1)`, input.Email).Scan(&exists)
	if exists {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Email už existuje"})
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Chyba pri registrácii"})
	}

	// Create vendor - now with "name" field
	var vendorID string
	err = h.db.Pool.QueryRow(ctx, `
		INSERT INTO vendors (id, email, password_hash, name, company_name, contact_person, status, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'pending', NOW(), NOW())
		RETURNING id
	`, input.Email, string(hash), input.Name, input.CompanyName, input.ContactPerson).Scan(&vendorID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	// ALWAYS create shop - use shop_name, company_name, or email as fallback
	var shopID string
	shopName := input.ShopName
	if shopName == "" {
		shopName = input.CompanyName
	}
	if shopName == "" {
		// Extract name from email (before @)
		parts := strings.Split(input.Email, "@")
		shopName = parts[0]
	}
	shopSlug := strings.ToLower(strings.ReplaceAll(shopName, " ", "-"))
	shopURL := input.ShopURL
	if shopURL == "" {
		shopURL = "https://" + strings.ToLower(strings.ReplaceAll(shopName, " ", "")) + ".sk"
	}
	h.db.Pool.QueryRow(ctx, `
		INSERT INTO shops (id, vendor_id, shop_name, shop_slug, shop_url, shop_status, display_mode, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active', 'free', NOW(), NOW())
		RETURNING id
	`, vendorID, shopName, shopSlug, shopURL).Scan(&shopID)

	// Generate token
	token := generateToken()

	// Store session
	h.db.Pool.Exec(ctx, `
		INSERT INTO vendor_sessions (id, vendor_id, token, expires_at)
		VALUES (gen_random_uuid(), $1, $2, NOW() + INTERVAL '30 days')
	`, vendorID, token)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"token": token,
			"vendor": fiber.Map{
				"id":           vendorID,
				"email":        input.Email,
				"name":         input.Name,
				"company_name": input.CompanyName,
				"status":       "pending",
			},
			"shop": fiber.Map{
				"id":        shopID,
				"shop_name": shopName,
				"shop_url":  shopURL,
			},
		},
	})
}

// VendorMe returns authenticated vendor info
func (h *Handler) VendorMe(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find session
	var vendorID string
	err := h.db.Pool.QueryRow(ctx, `
		SELECT vendor_id FROM vendor_sessions 
		WHERE token = $1 AND expires_at > NOW()
	`, token).Scan(&vendorID)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Invalid or expired token"})
	}

	// Get vendor
	var email, companyName, status string
	err = h.db.Pool.QueryRow(ctx, `
		SELECT email, company_name, status FROM vendors WHERE id = $1
	`, vendorID).Scan(&email, &companyName, &status)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Vendor not found"})
	}

	// Get ALL shops for this vendor
	rows, qErr := h.db.Pool.Query(ctx, `
		SELECT id, shop_name, shop_slug, shop_url, shop_logo, shop_status, 
			   COALESCE(display_mode, 'free'), COALESCE(credit_balance, 0), created_at
		FROM shops WHERE vendor_id = $1 ORDER BY created_at ASC
	`, vendorID)

	var shops []fiber.Map
	var activeShop fiber.Map
	if qErr == nil {
		defer rows.Close()
		for rows.Next() {
			var sID, sName, sSlug, sStatus, sDisplayMode string
			var sURL, sLogo *string
			var sCreditBalance float64
			var sCreatedAt time.Time
			if rows.Scan(&sID, &sName, &sSlug, &sURL, &sLogo, &sStatus, &sDisplayMode, &sCreditBalance, &sCreatedAt) == nil {
				s := fiber.Map{
					"id":             sID,
					"shop_name":      sName,
					"shop_slug":      sSlug,
					"shop_url":       "",
					"shop_logo":      "",
					"shop_status":    sStatus,
					"display_mode":   sDisplayMode,
					"credit_balance": sCreditBalance,
					"created_at":     sCreatedAt,
				}
				if sURL != nil { s["shop_url"] = *sURL }
				if sLogo != nil { s["shop_logo"] = *sLogo }
				shops = append(shops, s)

				// First active shop or first shop overall as default
				if activeShop == nil && sStatus == "active" {
					activeShop = s
				}
			}
		}
	}

	// Fallback: use first shop if no active found
	if activeShop == nil && len(shops) > 0 {
		activeShop = shops[0]
	}

	// Get vendor credit balance (shared)
	var vendorCredit float64
	h.db.Pool.QueryRow(ctx, `SELECT COALESCE(credit_balance, 0) FROM vendors WHERE id = $1`, vendorID).Scan(&vendorCredit)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"vendor": fiber.Map{
				"id":             vendorID,
				"email":          email,
				"company_name":   companyName,
				"status":         status,
				"credit_balance": vendorCredit,
			},
			"shop":  activeShop,
			"shops": shops,
		},
	})
}

// VendorAuthMiddleware authenticates vendor requests
func (h *Handler) VendorAuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find session and get vendor + shop
	var vendorID string
	var shopID *string
	err := h.db.Pool.QueryRow(ctx, `
		SELECT vs.vendor_id, s.id
		FROM vendor_sessions vs
		LEFT JOIN shops s ON s.vendor_id = vs.vendor_id
		WHERE vs.token = $1 AND vs.expires_at > NOW()
	`, token).Scan(&vendorID, &shopID)

	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Invalid or expired token"})
	}

	// Set context values
	c.Locals("vendor_id", vendorID)
	if shopID != nil {
		c.Locals("shop_id", *shopID)
	}

	return c.Next()
}

// generateToken creates a random token
func generateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
