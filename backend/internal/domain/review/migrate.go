package review

import (
	"context"
	"database/sql"
	"fmt"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	var duplicateGroups int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM (SELECT order_item_id FROM reviews GROUP BY order_item_id HAVING COUNT(*)>1) duplicates`).Scan(&duplicateGroups); err != nil {
		return err
	}
	if duplicateGroups > 0 {
		return fmt.Errorf("cannot enforce one review per order item: %d order items have duplicate reviews; resolve them before migration", duplicateGroups)
	}
	var uniqueExists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='reviews' AND index_name='uq_reviews_order_item' AND non_unique=0`).Scan(&uniqueExists); err != nil {
		return err
	}
	if uniqueExists == 0 {
		// Keep idx_reviews_order_item: InnoDB may rely on it for the foreign
		// key, so dropping it before creating the unique index fails with 1553.
		_, err := db.ExecContext(ctx, `CREATE UNIQUE INDEX uq_reviews_order_item ON reviews(order_item_id)`)
		return err
	}
	return nil
}
