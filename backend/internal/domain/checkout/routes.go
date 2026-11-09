package checkout

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	h := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/checkout/options", security.RequireRole("CLIENT", h.options))
	mux.Handle("POST /api/v1/checkout/quote", security.RequireRole("CLIENT", h.quote))
	mux.Handle("POST /api/v1/checkout/orders", security.RequireRole("CLIENT", h.createOrder))
	mux.Handle("POST /api/v1/vouchers/validate", security.RequireRole("CLIENT", h.validateVoucherRequest))
}
