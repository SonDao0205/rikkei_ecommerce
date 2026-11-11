package order

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/auth"
)

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	customerHandler := &CustomerHandler{db: db, logger: logger}
	sellerHandler := &SellerHandler{db: db, logger: logger}

	// Customer Order APIs (Role CLIENT)
	mux.Handle("GET /api/v1/orders", security.RequireRole("CLIENT", customerHandler.listCustomerOrders))
	mux.Handle("GET /api/v1/orders/{id}", security.RequireRole("CLIENT", customerHandler.getCustomerOrderDetail))
	mux.Handle("POST /api/v1/orders/{id}/cancel", security.RequireRole("CLIENT", customerHandler.cancelCustomerOrder))
	mux.Handle("POST /api/v1/orders/{id}/received", security.RequireRole("CLIENT", customerHandler.confirmCustomerReceived))
	mux.Handle("POST /api/v1/orders/{id}/returns", security.RequireRole("CLIENT", customerHandler.createCustomerReturnRequest))

	// Seller Order Management APIs (Role SELLER)
	mux.Handle("GET /api/v1/seller/orders", security.RequireRole("SELLER", sellerHandler.listSellerOrders))
	mux.Handle("GET /api/v1/seller/orders/{id}", security.RequireRole("SELLER", sellerHandler.getSellerOrderDetail))
	mux.Handle("PATCH /api/v1/seller/orders/{id}/confirm", security.RequireRole("SELLER", sellerHandler.confirmSellerOrder))
	mux.Handle("POST /api/v1/seller/orders/bulk-confirm", security.RequireRole("SELLER", sellerHandler.bulkConfirmSellerOrders))
	mux.Handle("PATCH /api/v1/seller/orders/{id}/pack", security.RequireRole("SELLER", sellerHandler.packSellerOrder))
	mux.Handle("PATCH /api/v1/seller/orders/{id}/ship", security.RequireRole("SELLER", sellerHandler.shipSellerOrder))
	mux.Handle("PATCH /api/v1/seller/orders/{id}/complete", security.RequireRole("SELLER", sellerHandler.completeSellerOrder))
	mux.Handle("PATCH /api/v1/seller/orders/{id}/cancel", security.RequireRole("SELLER", sellerHandler.cancelSellerOrder))
	mux.Handle("GET /api/v1/seller/returns", security.RequireRole("SELLER", sellerHandler.listSellerReturns))
	mux.Handle("PATCH /api/v1/seller/returns/{id}/approve", security.RequireRole("SELLER", sellerHandler.approveSellerReturn))
	mux.Handle("PATCH /api/v1/seller/returns/{id}/reject", security.RequireRole("SELLER", sellerHandler.rejectSellerReturn))
}
