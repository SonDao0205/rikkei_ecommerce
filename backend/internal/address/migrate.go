package address

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	var columnExists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='addresses' AND column_name='address_type'`).Scan(&columnExists); err != nil {
		return err
	}
	if columnExists == 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE addresses ADD COLUMN address_type VARCHAR(10) NOT NULL DEFAULT 'HOME' AFTER street_detail`); err != nil {
			return err
		}
	}

	var constraintExists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.table_constraints
		WHERE table_schema=DATABASE() AND table_name='addresses' AND constraint_name='chk_addresses_type'`).Scan(&constraintExists); err != nil {
		return err
	}
	if constraintExists == 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE addresses ADD CONSTRAINT chk_addresses_type
			CHECK (address_type IN ('HOME','OFFICE','OTHER'))`); err != nil {
			return err
		}
	}
	return nil
}
