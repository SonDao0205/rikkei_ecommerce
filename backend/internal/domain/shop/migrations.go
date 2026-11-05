package shop

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	var exists int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='shops' AND column_name='approval_notes'`).Scan(&exists); err != nil {
		return err
	}
	if exists == 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE shops ADD COLUMN approval_notes VARCHAR(500) NULL AFTER reject_reason`); err != nil {
			return err
		}
	}
	if _, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS shop_application_acceptances (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		shop_id BIGINT UNSIGNED NOT NULL,
		owner_id BIGINT UNSIGNED NOT NULL,
		terms_version VARCHAR(40) NOT NULL,
		service_policy_accepted TINYINT(1) NOT NULL,
		authenticity_accepted TINYINT(1) NOT NULL,
		anti_counterfeit_accepted TINYINT(1) NOT NULL,
		ip_address VARCHAR(45) NOT NULL DEFAULT '',
		user_agent VARCHAR(512) NOT NULL DEFAULT '',
		accepted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id),
		KEY idx_shop_acceptance_latest (shop_id,id),
		KEY idx_shop_acceptance_owner (owner_id,id),
		CONSTRAINT fk_shop_acceptance_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
		CONSTRAINT fk_shop_acceptance_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`); err != nil {
		return err
	}
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.check_constraints
		WHERE constraint_schema=DATABASE() AND constraint_name='chk_shops_status'
		AND LOCATE('DRAFT',check_clause)>0 AND LOCATE('NEEDS_INFO',check_clause)>0`).Scan(&exists); err != nil {
		return err
	}
	if exists > 0 {
		return nil
	}
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.table_constraints
		WHERE table_schema=DATABASE() AND table_name='shops' AND constraint_name='chk_shops_status'`).Scan(&exists); err != nil {
		return err
	}
	if exists > 0 {
		if _, err := db.ExecContext(ctx, `ALTER TABLE shops DROP CHECK chk_shops_status`); err != nil {
			return err
		}
	}
	_, err := db.ExecContext(ctx, `ALTER TABLE shops ADD CONSTRAINT chk_shops_status
		CHECK (status IN ('DRAFT','PENDING','NEEDS_INFO','ACTIVE','REJECTED','SUSPENDED'))`)
	return err
}
