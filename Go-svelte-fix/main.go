package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"go-svelte/internal/cache"
	"go-svelte/internal/config"
	"go-svelte/internal/database"
	"go-svelte/internal/handlers"
)

func main() {
	// Load .env file
	_ = godotenv.Load()

	// Setup logging
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("ENVIRONMENT") == "production" {
		log.Logger = log.Output(os.Stdout)
	} else {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// Load config
	cfg := config.Load()

	// Initialize database
	db, err := database.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to PostgreSQL")
	}
	defer db.Close()

	// Initialize Redis cache
	redisCache, err := cache.NewRedis(cfg.RedisURL)
	if err != nil {
		log.Warn().Err(err).Msg("Redis not available, caching disabled")
	}
	if redisCache != nil {
		defer redisCache.Close()
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ServerHeader:          "GO-Svelte-API",
		DisableStartupMessage: cfg.Environment == "production",
		ReadTimeout:           10 * time.Second,
		WriteTimeout:          10 * time.Second,
		IdleTimeout:           120 * time.Second,
		BodyLimit:             10 * 1024 * 1024, // 10MB
	})

	// Global middleware
	app.Use(recover.New())

	app.Use(logger.New(logger.Config{
		Format: "${time} ${status} ${method} ${path} ${latency}\n",
	}))

	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// CORS for SvelteKit frontend
	corsOrigins := cfg.CORSOrigin
	if corsOrigins == "" {
		corsOrigins = "*"
	}
	app.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: false,
		MaxAge:           3600,
	}))

	// Rate limiting
	app.Use(limiter.New(limiter.Config{
		Max:        1000,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
	}))

	// Initialize handlers
	h := handlers.New(db, redisCache, cfg)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"time":   time.Now().Unix(),
		})
	})

	// ========== PUBLIC API (for SvelteKit) ==========
	api := app.Group("/api/v1")

	// Products
	api.Get("/products", h.GetProducts)
	api.Get("/products/slug/:slug", h.GetProductBySlug)
	api.Get("/products/:id", h.GetProduct)
	api.Get("/products/:id/offers", h.GetProductOffers)

	// Categories
	api.Get("/categories", h.GetCategories)
	api.Get("/categories/tree", h.GetCategoriesTree)
	api.Get("/categories/flat", h.GetCategoriesFlat)
	api.Get("/categories/slug/:slug", h.GetCategoryBySlug)
	api.Get("/categories/:slug", h.GetCategoryWithProducts)

	// Search
	api.Get("/search", h.Search)
	api.Get("/autocomplete", h.Autocomplete)

	// Attributes & Filters (PUBLIC)
	api.Get("/attributes/stats", h.GetAttributeStats)
	api.Get("/filters", h.GetFilterSettings)
	api.Post("/filters", h.SaveFilterSettings)

	// ========== AUTH ROUTES (Public) ==========
	auth := api.Group("/auth")
	auth.Post("/login", h.VendorLogin)
	auth.Post("/register", h.VendorRegister)
	auth.Post("/logout", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"success": true, "message": "Odhlásený"})
	})
	auth.Get("/me", h.VendorMe)

	// ========== VENDOR PORTAL ROUTES (Authenticated) ==========
	vendor := api.Group("/vendor")
	
	// Dashboard
	vendor.Get("/dashboard", h.VendorDashboard)
	vendor.Get("/stats", h.VendorGetCPCStats)
	
	// Profile & Account
	vendor.Get("/profile", h.VendorGetProfile)
	vendor.Put("/profile", h.VendorUpdateProfile)
	vendor.Put("/billing", h.VendorUpdateBilling)
	vendor.Put("/password", h.VendorChangePassword)
	vendor.Get("/notifications", h.VendorGetNotifications)
	vendor.Put("/notifications", h.VendorUpdateNotifications)
	vendor.Get("/invoices", h.VendorGetInvoices)
	vendor.Get("/login-history", h.VendorGetLoginHistory)
	
	// Shop management
	vendor.Get("/shop", h.VendorGetShop)
	vendor.Put("/shop", h.VendorUpdateShop)
	vendor.Get("/sales-settings", h.VendorGetSalesSettings)
	vendor.Put("/sales-settings", h.VendorUpdateSalesSettings)
	vendor.Get("/shipping-methods", h.VendorGetShippingMethods)
	vendor.Post("/shipping-methods", h.VendorSaveShippingMethod)
	vendor.Delete("/shipping-methods/:id", h.VendorDeleteShippingMethod)
	
	// Multi-Shop Management (NEW)
	vendor.Get("/my-shops", h.VendorGetMyShops)
	vendor.Post("/switch-shop", h.VendorSwitchShop)
	vendor.Post("/shops", h.VendorCreateShopV2)
	vendor.Get("/ico-lookup", h.LookupICO)
	
	// Products/Offers
	vendor.Get("/products", h.VendorGetProducts)
	vendor.Get("/products/:id", h.VendorGetProduct)
	vendor.Post("/products/:id/connect", h.VendorConnectProduct)
	vendor.Put("/products/:id/offer", h.VendorUpdateOffer)
	vendor.Delete("/products/:id/offer", h.VendorDeleteOffer)
	
	// Feed management
	vendor.Get("/feeds", h.VendorGetFeeds)
	vendor.Post("/feeds", h.VendorCreateFeed)
	vendor.Put("/feeds/:id", h.VendorUpdateFeed)
	vendor.Delete("/feeds/:id", h.VendorDeleteFeed)
	vendor.Post("/feeds/:id/import", h.VendorStartImport)
	
	// Settings
	vendor.Get("/settings", h.VendorGetSettings)
	vendor.Put("/settings", h.VendorUpdateSettings)
	
	// CPC & Credit
	vendor.Get("/transactions", h.VendorGetTransactions)
	vendor.Post("/credit/topup", h.VendorRequestTopup)
	vendor.Put("/display-mode", h.VendorUpdateDisplayMode)
	vendor.Get("/statistics", h.VendorGetDetailedStats)
	vendor.Get("/recent-clicks", h.VendorGetRecentClicks)
	vendor.Get("/analytics", h.VendorGetAnalytics)

	// ========== CLICK TRACKING (Public) ==========
	api.Post("/track/click", h.TrackClick)
	api.Get("/track/conversion", h.TrackConversion)
	api.Get("/track/pageview", h.TrackConversion)

	// ========== ADMIN API ==========
	admin := api.Group("/admin")

	// Dashboard
	admin.Get("/dashboard", h.AdminDashboard)

	// Products
	admin.Get("/products", h.AdminGetProducts)
	admin.Get("/products/:id", h.AdminGetProduct)
	admin.Post("/products", h.AdminCreateProduct)
	admin.Put("/products/:id", h.AdminUpdateProduct)
	admin.Delete("/products/all", h.AdminDeleteAllProducts)
	admin.Delete("/products/:id", h.AdminDeleteProduct)
	admin.Post("/products/bulk", h.AdminBulkProducts)

	// Categories
	admin.Get("/categories", h.AdminGetCategories)
	admin.Get("/categories/:id", h.AdminGetCategory)
	admin.Post("/categories", h.AdminCreateCategory)
	admin.Put("/categories/:id", h.AdminUpdateCategory)
	admin.Post("/categories/:id/regenerate-image", h.AdminRegenerateCategoryImage)
	admin.Post("/categories/regenerate-all-images", h.AdminRegenerateAllCategoryImages)
	admin.Delete("/categories/all", h.AdminDeleteAllCategories)
	admin.Delete("/categories/:id", h.AdminDeleteCategory)

	// Vendors
	admin.Get("/vendors", h.AdminGetVendors)
	admin.Get("/vendors/:id", h.AdminGetVendor)
	admin.Post("/vendors", h.AdminCreateVendor)
	admin.Put("/vendors/:id", h.AdminUpdateVendor)
	admin.Delete("/vendors/:id", h.AdminDeleteVendor)
	admin.Post("/vendors/:id/approve", h.AdminApproveVendor)
	admin.Post("/vendors/:id/reject", h.AdminRejectVendor)
	admin.Post("/vendors/:id/credit", h.AdminAddVendorCredit)
	admin.Put("/vendors/:id/mode", h.AdminChangeVendorMode)
	admin.Get("/vendors/:id/transactions", h.AdminGetVendorTransactions)

	// Feeds
	admin.Get("/feeds", h.AdminGetFeeds)
	admin.Get("/feeds/:id", h.AdminGetFeed)
	admin.Post("/feeds", h.AdminCreateFeed)
	admin.Post("/feeds/preview", h.AdminPreviewFeed)
	admin.Put("/feeds/:id", h.AdminUpdateFeed)
	admin.Delete("/feeds/:id", h.AdminDeleteFeed)
	admin.Post("/feeds/:id/import", h.AdminStartFeedImport)
	admin.Get("/feeds/:id/progress", h.AdminGetFeedProgress)

	// Upload
	admin.Post("/upload", h.AdminUploadImage)

	// Shops & Vendor Offers
	admin.Get("/shops", h.AdminGetShops)
	admin.Post("/shops", h.AdminCreateShop)
	admin.Put("/shops/:id", h.AdminUpdateShop)
	admin.Post("/shops/:id/credit", h.AdminAddShopCredit)
	admin.Get("/pending-shops", h.AdminGetPendingShops)
	admin.Post("/shops/:id/approve", h.AdminApproveShop)
	admin.Post("/shops/:id/reject", h.AdminRejectShop)
	admin.Get("/vendor-offers", h.AdminGetVendorOffers)

	// Elasticsearch sync
	admin.Post("/sync-elasticsearch", h.AdminSyncElasticsearch)

	// ========== OFFER FEEDS (Marketplace/Vendor Offers) ==========
	offerFeeds := admin.Group("/offer-feeds")
	offerFeeds.Get("/", h.AdminGetOfferFeeds)
	offerFeeds.Get("/:id", h.AdminGetOfferFeed)
	offerFeeds.Post("/", h.AdminCreateOfferFeed)
	offerFeeds.Put("/:id", h.AdminUpdateOfferFeed)
	offerFeeds.Delete("/:id", h.AdminDeleteOfferFeed)
	offerFeeds.Post("/preview", h.AdminPreviewOfferFeed)
	offerFeeds.Post("/:id/import", h.AdminStartOfferImport)
	offerFeeds.Get("/:id/progress", h.AdminGetOfferProgress)
	offerFeeds.Post("/:id/stop", h.AdminStopOfferImport)
	offerFeeds.Get("/:id/history", h.AdminGetOfferHistory)
	offerFeeds.Get("/:id/mappings", h.AdminGetOfferMappings)
	offerFeeds.Post("/:id/mappings", h.AdminSaveOfferMappings)

	// AI categorization
	admin.Post("/ai/categorize", h.AdminAICategorize)

	// CPC Click tracking
	app.Get("/go/:offerID", h.TrackClick)

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		log.Info().Msg("Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		_ = app.ShutdownWithContext(ctx)
	}()

	// Start server
	addr := ":" + cfg.Port
	log.Info().
		Str("addr", addr).
		Str("env", cfg.Environment).
		Str("cors", cfg.CORSOrigin).
		Msg("Starting GO-Svelte API server")

	if err := app.Listen(addr); err != nil {
		log.Fatal().Err(err).Msg("Server error")
	}
}
