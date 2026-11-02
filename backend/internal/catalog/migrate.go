package catalog

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS category_attributes (
		category_id BIGINT UNSIGNED NOT NULL,
		attribute_id BIGINT UNSIGNED NOT NULL,
		is_required TINYINT(1) NOT NULL DEFAULT 0,
		sort_order INT NOT NULL DEFAULT 0,
		PRIMARY KEY (category_id, attribute_id),
		KEY idx_category_attributes_attribute (attribute_id),
		CONSTRAINT fk_category_attributes_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
		CONSTRAINT fk_category_attributes_attribute FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE CASCADE
	) ENGINE=InnoDB`)
	return err
}
