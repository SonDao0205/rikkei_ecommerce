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
	if err != nil {
		return err
	}
	var columnExists int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='order_items' AND column_name='flash_sale_id'`).Scan(&columnExists); err != nil {
		return err
	}
	if columnExists == 0 {
		if _, err = db.ExecContext(ctx, `ALTER TABLE order_items ADD COLUMN flash_sale_id BIGINT UNSIGNED NULL AFTER variant_id`); err != nil {
			return err
		}
	}
	var fkExists int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema=DATABASE() AND table_name='order_items' AND constraint_name='fk_order_items_flash_sale' AND constraint_type='FOREIGN KEY'`).Scan(&fkExists); err != nil {
		return err
	}
	if fkExists == 0 {
		_, err = db.ExecContext(ctx, `ALTER TABLE order_items ADD CONSTRAINT fk_order_items_flash_sale FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id)`)
	}
	return err
}
