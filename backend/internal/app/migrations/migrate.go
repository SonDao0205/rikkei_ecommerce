package migrations

import (
	"context"
	"database/sql"
	"fmt"

	"rikkei-ecommerce/internal/domain/address"
	"rikkei-ecommerce/internal/platform/auditlog"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/domain/catalog"
	"rikkei-ecommerce/internal/domain/shop"
)

func Run(ctx context.Context, db *sql.DB) error {
	migrations := []struct {
		name string
		run  func(context.Context, *sql.DB) error
	}{
		{name: "auth", run: auth.Migrate},
		{name: "address", run: address.Migrate},
		{name: "catalog", run: catalog.Migrate},
		{name: "shop", run: shop.Migrate},
		{name: "auditlog", run: auditlog.Migrate},
	}
	for _, migration := range migrations {
		if err := migration.run(ctx, db); err != nil {
			return fmt.Errorf("%s migration: %w", migration.name, err)
		}
	}
	return nil
}
