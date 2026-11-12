package review

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE INDEX idx_reviews_order_item ON reviews(order_item_id)`)
	if err != nil {
		// Existing deployments may already have added this index manually.
		var exists int
		if checkErr := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='reviews' AND index_name='idx_reviews_order_item'`).Scan(&exists); checkErr != nil {
			return checkErr
		}
		if exists == 0 {
			return err
		}
	}
	return nil
}
