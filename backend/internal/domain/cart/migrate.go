package cart

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS cart_add_idempotency (
		user_id BIGINT UNSIGNED NOT NULL,
		idempotency_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, idempotency_key),
		KEY idx_cart_add_idempotency_created_at (created_at),
		CONSTRAINT fk_cart_add_idempotency_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	) ENGINE=InnoDB`)
	return err
}
