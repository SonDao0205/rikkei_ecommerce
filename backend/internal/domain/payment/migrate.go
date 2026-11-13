package payment

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS payment_attempts (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		payment_id BIGINT UNSIGNED NOT NULL,
		provider VARCHAR(30) NOT NULL,
		provider_order_code BIGINT UNSIGNED NOT NULL,
		provider_link_id VARCHAR(100) NULL,
		checkout_url VARCHAR(1000) NULL,
		qr_code TEXT NULL,
		status VARCHAR(20) NOT NULL DEFAULT 'CREATING',
		expires_at DATETIME NULL,
		failure_code VARCHAR(100) NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		PRIMARY KEY (id), UNIQUE KEY uq_payment_attempt_payment (payment_id),
		UNIQUE KEY uq_payment_attempt_order_code (provider, provider_order_code),
		CONSTRAINT fk_payment_attempt_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
		CONSTRAINT chk_payment_attempt_status CHECK (status IN ('CREATING','PENDING','PAID','FAILED','CANCELLED','EXPIRED'))
	) ENGINE=InnoDB`)
	if err != nil {
		return err
	}
	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS payment_webhook_events (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		provider VARCHAR(30) NOT NULL,
		event_key VARCHAR(150) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
		payment_attempt_id BIGINT UNSIGNED NOT NULL,
		payload JSON NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id), UNIQUE KEY uq_payment_webhook_event (provider,event_key),
		KEY idx_payment_webhook_attempt (payment_attempt_id),
		CONSTRAINT fk_payment_webhook_attempt FOREIGN KEY (payment_attempt_id) REFERENCES payment_attempts(id)
	) ENGINE=InnoDB`)
	return err
}
