package catalog

import (
	"database/sql"
	"net/http"
)

type routeAuthorizer func(http.HandlerFunc) http.HandlerFunc

// RegisterRoutes exposes public catalog, client shop-follow, and admin inventory routes.
func RegisterRoutes(mux *http.ServeMux, db *sql.DB, requireAdmin, requireClient routeAuthorizer, userID func(*http.Request) string) {
	h := handler{db: db, userID: userID}
	mux.HandleFunc("GET /api/v1/categories", h.categories)
	mux.HandleFunc("GET /api/v1/products", h.products)
	mux.HandleFunc("GET /api/v1/products/{id}", h.productDetail)
	mux.HandleFunc("GET /api/v1/shops/{id}", h.shopDetail)
	mux.HandleFunc("GET /api/v1/shops/{id}/products", h.shopProducts)
	mux.Handle("GET /api/v1/shops/{id}/follow", requireClient(h.shopFollowState))
	mux.Handle("POST /api/v1/shops/{id}/follow", requireClient(h.followShopHandler))
	mux.Handle("DELETE /api/v1/shops/{id}/follow", requireClient(h.unfollowShopHandler))
	mux.HandleFunc("GET /api/v1/admin/inventory-stats", requireAdmin(h.inventoryStats))
	mux.HandleFunc("GET /api/v1/admin/products", requireAdmin(h.adminProducts))
	mux.HandleFunc("PATCH /api/v1/admin/products/{id}/status", requireAdmin(h.updateProductStatus))
	mux.HandleFunc("DELETE /api/v1/admin/products/{id}", requireAdmin(h.deleteProduct))
	mux.HandleFunc("POST /api/v1/admin/products/bulk", requireAdmin(h.bulkProducts))
}
