package wishlist

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/wishlist", security.RequireRole("CLIENT", handler.list))
	mux.Handle("POST /api/v1/wishlist/products/{id}", security.RequireRole("CLIENT", handler.add))
	mux.Handle("DELETE /api/v1/wishlist/products/{id}", security.RequireRole("CLIENT", handler.remove))
}
