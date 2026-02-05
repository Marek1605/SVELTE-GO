package handlers

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ICOLookupResponse unified response
type ICOLookupResponse struct {
	Found       bool   `json:"found"`
	CompanyName string `json:"company_name"`
	Street      string `json:"street"`
	City        string `json:"city"`
	PostalCode  string `json:"postal_code"`
	Country     string `json:"country"`
	ICO         string `json:"ico"`
	DIC         string `json:"dic"`
	ICDPH       string `json:"ic_dph"`
	Source      string `json:"source"`
}

// ARES XML structures for Czech ICO
type AresResponse struct {
	XMLName xml.Name    `xml:"Ares_odpovedi"`
	Answer  AresAnswer  `xml:"Odpoved"`
}

type AresAnswer struct {
	Record AresRecord `xml:"Zaznam"`
}

type AresRecord struct {
	ICO         string      `xml:"ICO"`
	CompanyName string      `xml:"Obchodni_firma"`
	Address     AresAddress `xml:"Identifikace>Adresa_ARES"`
	DIC         string      `xml:"DIC,omitempty"`
}

type AresAddress struct {
	Street     string `xml:"Nazev_ulice"`
	HouseNum   string `xml:"Cislo_domovni"`
	Orient     string `xml:"Cislo_orientacni"`
	City       string `xml:"Nazev_obce"`
	PostalCode string `xml:"PSC"`
}

// FinStat-like response for SK (using RPO/ORSR)
type RPOResponse struct {
	ID              int    `json:"id"`
	Name            string `json:"name"`
	FormattedStreet string `json:"formatted_street"`
	City            string `json:"municipality"`
	PostalCode      string `json:"postal_code"`
}

// LookupICO handles ICO/IČO lookup for SK and CZ
func (h *Handler) LookupICO(c *fiber.Ctx) error {
	ico := c.Query("ico")
	country := strings.ToUpper(c.Query("country", "SK"))

	if ico == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "IČO je povinné"})
	}

	// Clean ICO - remove spaces
	ico = strings.TrimSpace(strings.ReplaceAll(ico, " ", ""))

	var result ICOLookupResponse

	switch country {
	case "CZ":
		result = lookupCzechARES(ico)
	default:
		result = lookupSlovakRPO(ico)
	}

	if !result.Found {
		return c.JSON(fiber.Map{"success": false, "error": "IČO nenájdené", "data": result})
	}

	return c.JSON(fiber.Map{"success": true, "data": result})
}

// lookupSlovakRPO looks up Slovak company by ICO via RPO (Register právnických osôb)
func lookupSlovakRPO(ico string) ICOLookupResponse {
	result := ICOLookupResponse{ICO: ico, Country: "SK", Source: "RPO"}

	client := &http.Client{Timeout: 10 * time.Second}

	// Try RPO API
	url := fmt.Sprintf("https://rpo.statistics.sk/rpo/json/search?ico=%s", ico)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		// Fallback - try data.gov.sk
		return lookupSlovakDataGov(ico)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "MegaShop-CPC/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return lookupSlovakDataGov(ico)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return lookupSlovakDataGov(ico)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return lookupSlovakDataGov(ico)
	}

	// Parse RPO response
	var rpoData map[string]interface{}
	if err := json.Unmarshal(body, &rpoData); err != nil {
		return lookupSlovakDataGov(ico)
	}

	// Extract data from RPO
	if items, ok := rpoData["items"].([]interface{}); ok && len(items) > 0 {
		if item, ok := items[0].(map[string]interface{}); ok {
			result.Found = true
			if name, ok := item["name"].(string); ok {
				result.CompanyName = name
			}
			if addr, ok := item["formatted_address"].(string); ok {
				parts := strings.Split(addr, ",")
				if len(parts) >= 1 {
					result.Street = strings.TrimSpace(parts[0])
				}
				if len(parts) >= 2 {
					cityZip := strings.TrimSpace(parts[len(parts)-1])
					// Try to split "01001 Žilina" format
					czParts := strings.SplitN(cityZip, " ", 2)
					if len(czParts) == 2 && len(czParts[0]) == 5 {
						result.PostalCode = czParts[0]
						result.City = czParts[1]
					} else {
						result.City = cityZip
					}
				}
			}
			// DIC is typically ICO prefixed with country code
			result.DIC = "SK" + ico
			return result
		}
	}

	return lookupSlovakDataGov(ico)
}

// lookupSlovakDataGov fallback lookup via data.gov.sk
func lookupSlovakDataGov(ico string) ICOLookupResponse {
	result := ICOLookupResponse{ICO: ico, Country: "SK", Source: "data.gov.sk"}

	client := &http.Client{Timeout: 10 * time.Second}

	// data.gov.sk API
	url := fmt.Sprintf("https://data.gov.sk/api/action/organization_show?id=%s", ico)
	resp, err := client.Get(url)
	if err != nil {
		return result
	}
	defer resp.Body.Close()

	// If this also fails, return empty but with ICO pre-filled
	result.DIC = ico
	return result
}

// lookupCzechARES looks up Czech company by ICO via ARES
func lookupCzechARES(ico string) ICOLookupResponse {
	result := ICOLookupResponse{ICO: ico, Country: "CZ", Source: "ARES"}

	client := &http.Client{Timeout: 10 * time.Second}

	// ARES REST API (new version)
	url := fmt.Sprintf("https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/%s", ico)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return result
	}
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return result
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return result
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return result
	}

	var aresData map[string]interface{}
	if err := json.Unmarshal(body, &aresData); err != nil {
		return result
	}

	result.Found = true

	// Extract company name
	if name, ok := aresData["obchodniJmeno"].(string); ok {
		result.CompanyName = name
	}

	// Extract ICO
	if icoStr, ok := aresData["ico"].(string); ok {
		result.ICO = icoStr
	}

	// Extract address
	if sidlo, ok := aresData["sidlo"].(map[string]interface{}); ok {
		if street, ok := sidlo["nazevUlice"].(string); ok {
			result.Street = street
			if cisloD, ok := sidlo["cisloDomovni"].(float64); ok {
				result.Street += fmt.Sprintf(" %d", int(cisloD))
			}
			if cisloO, ok := sidlo["cisloOrientacni"].(float64); ok {
				result.Street += fmt.Sprintf("/%d", int(cisloO))
			}
		}
		if city, ok := sidlo["nazevObce"].(string); ok {
			result.City = city
		}
		if psc, ok := sidlo["psc"].(float64); ok {
			result.PostalCode = fmt.Sprintf("%05d", int(psc))
		}
	}

	// Extract DIC
	if dic, ok := aresData["dic"].(string); ok {
		result.DIC = dic
	}

	return result
}

// VendorCreateShopV2 creates a new shop with billing info and pending status
func (h *Handler) VendorCreateShopV2(c *fiber.Ctx) error {
	vendorID, err := h.getVendorFromToken(c)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"success": false, "error": "Unauthorized"})
	}

	var input struct {
		ShopName            string `json:"shop_name"`
		ShopURL             string `json:"shop_url"`
		ShopLogo            string `json:"shop_logo"`
		BillingCompany      string `json:"billing_company"`
		BillingICO          string `json:"billing_ico"`
		BillingDIC          string `json:"billing_dic"`
		BillingICDPH        string `json:"billing_ic_dph"`
		BillingAddress      string `json:"billing_address"`
		BillingCity         string `json:"billing_city"`
		BillingZip          string `json:"billing_zip"`
		BillingCountry      string `json:"billing_country"`
		BillingContactPerson string `json:"billing_contact_person"`
		BillingPhone        string `json:"billing_phone"`
		BillingEmail        string `json:"billing_email"`
		CopyFromVendor      bool   `json:"copy_from_vendor"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Invalid request body"})
	}

	if input.ShopName == "" {
		return c.Status(400).JSON(fiber.Map{"success": false, "error": "Názov obchodu je povinný"})
	}

	ctx := context.Background()

	// If copy_from_vendor, get vendor billing info
	if input.CopyFromVendor {
		var companyName, ico, dic, icDph, address, city, zip, country, phone, email string
		err := h.db.Pool.QueryRow(ctx, `
			SELECT COALESCE(company_name,''), COALESCE(ico,''), COALESCE(dic,''), COALESCE(ic_dph,''),
				   COALESCE(billing_address, address, ''), COALESCE(billing_city, city, ''), 
				   COALESCE(billing_zip, postal_code, ''), COALESCE(billing_country, country, 'SK'),
				   COALESCE(phone,''), COALESCE(email,'')
			FROM vendors WHERE id = $1
		`, vendorID).Scan(&companyName, &ico, &dic, &icDph, &address, &city, &zip, &country, &phone, &email)
		if err == nil {
			if input.BillingCompany == "" { input.BillingCompany = companyName }
			if input.BillingICO == "" { input.BillingICO = ico }
			if input.BillingDIC == "" { input.BillingDIC = dic }
			if input.BillingICDPH == "" { input.BillingICDPH = icDph }
			if input.BillingAddress == "" { input.BillingAddress = address }
			if input.BillingCity == "" { input.BillingCity = city }
			if input.BillingZip == "" { input.BillingZip = zip }
			if input.BillingCountry == "" { input.BillingCountry = country }
			if input.BillingPhone == "" { input.BillingPhone = phone }
			if input.BillingEmail == "" { input.BillingEmail = email }
		}
	}

	if input.BillingCountry == "" {
		input.BillingCountry = "SK"
	}

	id := generateToken()[:36] // UUID-like
	slug := generateSlug(input.ShopName)

	// New shops start as PENDING
	_, err = h.db.Pool.Exec(ctx, `
		INSERT INTO shops (id, vendor_id, shop_name, shop_slug, shop_url, shop_logo, shop_status, display_mode,
			billing_company, billing_ico, billing_dic, billing_ic_dph, billing_address, billing_city, billing_zip, billing_country,
			billing_contact_person, billing_phone, billing_email,
			credit_balance, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'free',
			$7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
			0, NOW(), NOW())
	`, id, vendorID, input.ShopName, slug, input.ShopURL, input.ShopLogo,
		input.BillingCompany, input.BillingICO, input.BillingDIC, input.BillingICDPH,
		input.BillingAddress, input.BillingCity, input.BillingZip, input.BillingCountry,
		input.BillingContactPerson, input.BillingPhone, input.BillingEmail)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": "Chyba pri vytváraní obchodu: " + err.Error()})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Obchod bol vytvorený a čaká na schválenie administrátorom.",
		"data": fiber.Map{
			"id":          id,
			"shop_name":   input.ShopName,
			"shop_slug":   slug,
			"shop_status": "pending",
		},
	})
}

// AdminApproveShop approves a pending shop
func (h *Handler) AdminApproveShop(c *fiber.Ctx) error {
	shopID := c.Params("id")
	ctx := context.Background()

	_, err := h.db.Pool.Exec(ctx, `
		UPDATE shops SET shop_status = 'active', approved_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND shop_status = 'pending'
	`, shopID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Obchod schválený"})
}

// AdminRejectShop rejects a pending shop
func (h *Handler) AdminRejectShop(c *fiber.Ctx) error {
	shopID := c.Params("id")
	var input struct {
		Reason string `json:"reason"`
	}
	c.BodyParser(&input)

	ctx := context.Background()

	_, err := h.db.Pool.Exec(ctx, `
		UPDATE shops SET shop_status = 'rejected', rejection_reason = $2, updated_at = NOW()
		WHERE id = $1
	`, shopID, input.Reason)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}

	return c.JSON(fiber.Map{"success": true, "message": "Obchod zamietnutý"})
}

// AdminGetPendingShops returns shops waiting for approval
func (h *Handler) AdminGetPendingShops(c *fiber.Ctx) error {
	ctx := context.Background()

	rows, err := h.db.Pool.Query(ctx, `
		SELECT s.id, s.vendor_id, s.shop_name, s.shop_slug, s.shop_url, s.shop_status,
			   s.billing_company, s.billing_ico, s.billing_dic, s.billing_ic_dph,
			   s.billing_address, s.billing_city, s.billing_zip, s.billing_country,
			   s.billing_contact_person, s.billing_phone, s.billing_email,
			   s.created_at, v.email, v.company_name
		FROM shops s
		JOIN vendors v ON v.id = s.vendor_id
		WHERE s.shop_status = 'pending'
		ORDER BY s.created_at DESC
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "error": err.Error()})
	}
	defer rows.Close()

	shops := make([]fiber.Map, 0)
	for rows.Next() {
		var id, vendorID, shopName, shopSlug, shopStatus string
		var shopURL, billingCompany, billingICO, billingDIC, billingICDPH *string
		var billingAddress, billingCity, billingZip, billingCountry *string
		var billingContact, billingPhone, billingEmail *string
		var createdAt time.Time
		var vendorEmail, vendorCompany string

		err := rows.Scan(&id, &vendorID, &shopName, &shopSlug, &shopURL, &shopStatus,
			&billingCompany, &billingICO, &billingDIC, &billingICDPH,
			&billingAddress, &billingCity, &billingZip, &billingCountry,
			&billingContact, &billingPhone, &billingEmail,
			&createdAt, &vendorEmail, &vendorCompany)
		if err != nil {
			continue
		}

		shop := fiber.Map{
			"id":          id,
			"vendor_id":   vendorID,
			"shop_name":   shopName,
			"shop_slug":   shopSlug,
			"shop_url":    derefStr(shopURL),
			"shop_status": shopStatus,
			"billing": fiber.Map{
				"company":        derefStr(billingCompany),
				"ico":            derefStr(billingICO),
				"dic":            derefStr(billingDIC),
				"ic_dph":         derefStr(billingICDPH),
				"address":        derefStr(billingAddress),
				"city":           derefStr(billingCity),
				"zip":            derefStr(billingZip),
				"country":        derefStr(billingCountry),
				"contact_person": derefStr(billingContact),
				"phone":          derefStr(billingPhone),
				"email":          derefStr(billingEmail),
			},
			"created_at":     createdAt,
			"vendor_email":   vendorEmail,
			"vendor_company": vendorCompany,
		}
		shops = append(shops, shop)
	}

	return c.JSON(fiber.Map{"success": true, "data": shops})
}

func derefStr(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}
