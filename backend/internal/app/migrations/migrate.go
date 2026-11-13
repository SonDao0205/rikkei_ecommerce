package migrations

import (
	"context"
	"database/sql"
	"fmt"

	"rikkei-ecommerce/internal/domain/address"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/domain/cart"
	"rikkei-ecommerce/internal/domain/catalog"
	"rikkei-ecommerce/internal/domain/checkout"
	"rikkei-ecommerce/internal/domain/media"
	"rikkei-ecommerce/internal/domain/promotion"
	"rikkei-ecommerce/internal/domain/review"
	"rikkei-ecommerce/internal/domain/seller"
	"rikkei-ecommerce/internal/domain/shop"
	"rikkei-ecommerce/internal/platform/auditlog"
)

func Run(ctx context.Context, db *sql.DB) error {
	migrations := []struct {
		name string
		run  func(context.Context, *sql.DB) error
	}{
		{name: "auth", run: auth.Migrate},
		{name: "address", run: address.Migrate},
		{name: "catalog", run: catalog.Migrate},
		{name: "cart", run: cart.Migrate},
		{name: "promotion", run: promotion.Migrate},
		{name: "checkout", run: checkout.Migrate},
		{name: "media", run: media.Migrate},
		{name: "seller", run: seller.Migrate},
		{name: "shop", run: shop.Migrate},
		{name: "review", run: review.Migrate},
		{name: "auditlog", run: auditlog.Migrate},
	}
	for _, migration := range migrations {
		if err := migration.run(ctx, db); err != nil {
			return fmt.Errorf("%s migration: %w", migration.name, err)
		}
	}
	return nil
}
