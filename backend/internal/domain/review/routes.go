package review

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	h := handler{db: db, logger: logger}
	mux.HandleFunc("GET /api/v1/products/{id}/reviews", h.publicList)
	mux.Handle("POST /api/v1/reviews", security.RequireRole("CLIENT", h.create))
	mux.Handle("GET /api/v1/me/reviews", security.RequireRole("CLIENT", h.mine))
	mux.Handle("GET /api/v1/seller/reviews", security.RequireRole("SELLER", h.sellerList))
	mux.Handle("POST /api/v1/seller/reviews/{id}/reply", security.RequireRole("SELLER", h.reply))
	mux.Handle("GET /api/v1/admin/reviews", security.RequireRole("ADMIN", h.adminList))
	mux.Handle("PATCH /api/v1/admin/reviews/{id}/status", security.RequireRole("ADMIN", h.moderate))
	mux.Handle("GET /api/v1/admin/audit-logs", security.RequireRole("ADMIN", h.auditLogs))
}
