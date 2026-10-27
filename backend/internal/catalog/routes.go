package catalog

import (
	"database/sql"
	"net/http"
)

type adminAuthorizer func(http.HandlerFunc) http.HandlerFunc

// RegisterRoutes exposes read-only catalog endpoints and admin-only inventory
// operations over the existing commerce schema.
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, requireAdmin adminAuthorizer) {
	h := handler{db: db}
	mux.HandleFunc("GET /api/v1/categories", h.categories)
	mux.HandleFunc("GET /api/v1/products", h.products)
	mux.HandleFunc("GET /api/v1/admin/inventory-stats", requireAdmin(h.inventoryStats))
	mux.HandleFunc("GET /api/v1/admin/products", requireAdmin(h.adminProducts))
	mux.HandleFunc("PATCH /api/v1/admin/products/{id}/status", requireAdmin(h.updateProductStatus))
	mux.HandleFunc("DELETE /api/v1/admin/products/{id}", requireAdmin(h.deleteProduct))
	mux.HandleFunc("POST /api/v1/admin/products/bulk", requireAdmin(h.bulkProducts))
}
