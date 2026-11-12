package promotion

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	h := handler{db: db, logger: logger}
	mux.HandleFunc("GET /api/v1/vouchers", h.publicVouchers)
	mux.Handle("GET /api/v1/admin/vouchers", security.RequireRole("ADMIN", h.adminVouchers))
	mux.Handle("POST /api/v1/admin/vouchers", security.RequireRole("ADMIN", h.createPlatformVoucher))
	mux.Handle("PATCH /api/v1/admin/vouchers/{id}/status", security.RequireRole("ADMIN", h.voucherStatus))
	mux.Handle("GET /api/v1/seller/vouchers", security.RequireRole("SELLER", h.sellerVouchers))
	mux.Handle("POST /api/v1/seller/vouchers", security.RequireRole("SELLER", h.createShopVoucher))
	mux.Handle("PATCH /api/v1/seller/vouchers/{id}/status", security.RequireRole("SELLER", h.voucherStatus))
	mux.HandleFunc("GET /api/v1/promotions/banners", h.publicBanners)
	mux.Handle("GET /api/v1/admin/promotions/banners", security.RequireRole("ADMIN", h.adminBanners))
	mux.Handle("POST /api/v1/admin/promotions/banners", security.RequireRole("ADMIN", h.createBanner))
	mux.Handle("PUT /api/v1/admin/promotions/banners/{id}", security.RequireRole("ADMIN", h.updateBanner))
	mux.Handle("PATCH /api/v1/admin/promotions/banners/{id}/status", security.RequireRole("ADMIN", h.bannerStatus))
	mux.Handle("GET /api/v1/admin/promotions/flash-sales", security.RequireRole("ADMIN", h.flashSales))
	mux.HandleFunc("GET /api/v1/promotions/flash-sales", h.publicFlashSales)
	mux.Handle("POST /api/v1/admin/promotions/flash-sales", security.RequireRole("ADMIN", h.createFlashSale))
	mux.Handle("PATCH /api/v1/admin/promotions/flash-sales/{id}/status", security.RequireRole("ADMIN", h.flashSaleStatus))
}
