package seller

import (
	"database/sql"
	"log"
	"net/http"
	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/seller/products", security.RequireRole("SELLER", handler.listSellerProducts))
	mux.Handle("POST /api/v1/seller/products", security.RequireRole("SELLER", handler.createSellerProduct))
	mux.Handle("GET /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.getSellerProduct))
	mux.Handle("PUT /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.updateSellerProduct))
	mux.Handle("DELETE /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.deleteSellerProduct))
}
