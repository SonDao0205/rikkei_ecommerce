package media

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS media_upload_idempotency (
		user_id BIGINT UNSIGNED NOT NULL,
		idempotency_key VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		purpose VARCHAR(32) NOT NULL,
		request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		public_id VARCHAR(255) NOT NULL,
		response_body MEDIUMBLOB NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, idempotency_key),
		KEY idx_media_upload_idempotency_created_at (created_at),
		CONSTRAINT fk_media_upload_idempotency_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
	) ENGINE=InnoDB`)
	return err
}
