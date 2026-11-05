package cart

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/cart", security.RequireRole("CLIENT", handler.getCart))
	mux.Handle("POST /api/v1/cart/items", security.RequireRole("CLIENT", handler.addItem))
	mux.Handle("PUT /api/v1/cart/items/{id}", security.RequireRole("CLIENT", handler.updateItem))
	mux.Handle("DELETE /api/v1/cart/items/{id}", security.RequireRole("CLIENT", handler.deleteItem))
	mux.Handle("DELETE /api/v1/cart/items", security.RequireRole("CLIENT", handler.clearCart))
}
