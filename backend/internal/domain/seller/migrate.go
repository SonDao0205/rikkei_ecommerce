package seller

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	var exists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='products' AND column_name='video_url'`).Scan(&exists); err != nil {
		return err
	}
	if exists == 0 {
		_, err := db.ExecContext(ctx, `ALTER TABLE products ADD COLUMN video_url VARCHAR(500) NULL AFTER thumbnail_url`)
		return err
	}
	return nil
}
