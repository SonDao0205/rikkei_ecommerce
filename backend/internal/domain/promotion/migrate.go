package promotion

import (
	"context"
	"database/sql"
)

func Migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS promotion_banners (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		title VARCHAR(160) NOT NULL,
		image_url VARCHAR(500) NOT NULL,
		target_url VARCHAR(500) NULL,
		position VARCHAR(20) NOT NULL,
		start_at DATETIME NOT NULL,
		end_at DATETIME NOT NULL,
		sort_order INT NOT NULL DEFAULT 0,
		is_active TINYINT(1) NOT NULL DEFAULT 1,
		created_by BIGINT UNSIGNED NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		PRIMARY KEY(id), KEY idx_promotion_banner_live(is_active,position,start_at,end_at,sort_order),
		CONSTRAINT fk_promotion_banner_creator FOREIGN KEY(created_by) REFERENCES users(id),
		CONSTRAINT chk_promotion_banner_position CHECK(position IN ('HOME_HERO','HOME_MIDDLE','SHOP')),
		CONSTRAINT chk_promotion_banner_period CHECK(end_at>start_at)
	) ENGINE=InnoDB`)
	if err != nil {
		return err
	}
	_, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS flash_sales (
		id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
		product_id BIGINT UNSIGNED NOT NULL,
		sale_price DECIMAL(15,2) NOT NULL,
		quantity_limit INT UNSIGNED NOT NULL,
		quantity_sold INT UNSIGNED NOT NULL DEFAULT 0,
		start_at DATETIME NOT NULL,
		end_at DATETIME NOT NULL,
		is_active TINYINT(1) NOT NULL DEFAULT 1,
		created_by BIGINT UNSIGNED NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
		PRIMARY KEY(id), KEY idx_flash_sale_live(is_active,start_at,end_at,product_id),
		CONSTRAINT fk_flash_sale_product FOREIGN KEY(product_id) REFERENCES products(id),
		CONSTRAINT fk_flash_sale_creator FOREIGN KEY(created_by) REFERENCES users(id),
		CONSTRAINT chk_flash_sale_price CHECK(sale_price>0),
		CONSTRAINT chk_flash_sale_quantity CHECK(quantity_limit>0 AND quantity_sold<=quantity_limit),
		CONSTRAINT chk_flash_sale_period CHECK(end_at>start_at)
	) ENGINE=InnoDB`)
	return err
}
