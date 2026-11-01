package migrations

import (
	"context"
	"database/sql"
	"fmt"

	"rikkei-ecommerce/internal/address"
	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/shop"
)

func Run(ctx context.Context, db *sql.DB) error {
	migrations := []struct {
		name string
		run  func(context.Context, *sql.DB) error
	}{
		{name: "auth", run: auth.Migrate},
		{name: "address", run: address.Migrate},
		{name: "shop", run: shop.Migrate},
	}
	for _, migration := range migrations {
		if err := migration.run(ctx, db); err != nil {
			return fmt.Errorf("%s migration: %w", migration.name, err)
		}
	}
	return nil
}
