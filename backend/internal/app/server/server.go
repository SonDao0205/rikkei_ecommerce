package server

import (
	"database/sql"
	"log"
	"net/http"

	"rikkei-ecommerce/internal/domain/address"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/domain/cart"
	"rikkei-ecommerce/internal/domain/catalog"
	"rikkei-ecommerce/internal/domain/checkout"
	"rikkei-ecommerce/internal/domain/seller"
	"rikkei-ecommerce/internal/domain/shop"
	"rikkei-ecommerce/internal/domain/wishlist"
)

func NewHandler(config auth.Config, db *sql.DB, logger *log.Logger) http.Handler {
	security := auth.NewApp(config, db, logger)
	mux := security.Mux()

	shop.RegisterRoutes(mux, security, db, logger)
	seller.RegisterRoutes(mux, security, db, logger)
	address.RegisterRoutes(mux, security, db, logger)
	cart.RegisterRoutes(mux, security, db, logger)
	checkout.RegisterRoutes(mux, security, db, logger)
	wishlist.RegisterRoutes(mux, security, db, logger)
	catalog.RegisterRoutes(
		mux,
		db,
		func(next http.HandlerFunc) http.HandlerFunc { return security.RequireRole("ADMIN", next) },
		func(next http.HandlerFunc) http.HandlerFunc { return security.RequireRole("CLIENT", next) },
		func(r *http.Request) string { return auth.CurrentUser(r).ID },
	)
	return security.Handler()
}
