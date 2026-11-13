package checkout

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS checkout_idempotency (
		user_id BIGINT UNSIGNED NOT NULL,
		idempotency_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		response_body MEDIUMBLOB NULL,
		http_status SMALLINT UNSIGNED NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, idempotency_key),
		KEY idx_checkout_idempotency_created_at (created_at),
		CONSTRAINT fk_checkout_idempotency_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	) ENGINE=InnoDB`)
	return err
}
