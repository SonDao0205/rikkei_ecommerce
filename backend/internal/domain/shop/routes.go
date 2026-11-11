package shop

import (
	"database/sql"
	"log"
	"net/http"
	"rikkei-ecommerce/internal/domain/auth"
)

func NewHandler(db *sql.DB, logger *log.Logger) *Handler {
	return &Handler{db: db, logger: logger}
}

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := NewHandler(db, logger)

	mux.Handle("POST /api/v1/shops", security.RequireRole("CLIENT", handler.createShopDraft))
	mux.Handle("POST /api/v1/me/shop", security.RequireRole("CLIENT", handler.createShopDraft))
	mux.Handle("GET /api/v1/me/shop", security.RequireAuth(handler.myShop))
	mux.Handle("PUT /api/v1/me/shop", security.RequireAuth(handler.updateMyShop))
	mux.Handle("POST /api/v1/me/shop/submit", security.RequireRole("CLIENT", handler.submitShop))
	mux.Handle("GET /api/v1/admin/shops", security.RequireRole("ADMIN", handler.listAdminShops))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/status", security.RequireRole("ADMIN", handler.updateShopStatus))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/approve", security.RequireRole("ADMIN", handler.approveShop))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/reject", security.RequireRole("ADMIN", handler.rejectShop))
	mux.Handle("PATCH /api/v1/admin/shops/{id}/lock", security.RequireRole("ADMIN", handler.lockShop))
}
