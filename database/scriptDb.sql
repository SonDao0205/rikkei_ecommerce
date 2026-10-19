DROP DATABASE IF EXISTS rikkei_ecommerce;
CREATE DATABASE IF NOT EXISTS rikkei_ecommerce;
USE rikkei_ecommerce;

-- ---------------------------------------------------------------------
-- 1. TÀI KHOẢN & PHÂN QUYỀN
-- ---------------------------------------------------------------------

CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email          VARCHAR(150) null NULL,
  phone          VARCHAR(20)  NOT NULL,
  password_hash  VARCHAR(100) NOT NULL,
  full_name      VARCHAR(120) NOT NULL,
  avatar_url     VARCHAR(500) NULL,
  email_verified TINYINT(1)   NOT NULL DEFAULT 0,
  status         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  role VARCHAR(100) ,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  CONSTRAINT chk_users_status   CHECK (status IN ('ACTIVE','LOCKED')),
  CONSTRAINT chk_users_role check (role in ('client', 'seller', 'admin'))
);

CREATE TABLE refresh_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(100) NOT NULL,
  expires_at DATETIME     NOT NULL,
  revoked    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ;

CREATE TABLE addresses (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED NOT NULL,
  recipient_name VARCHAR(120) NOT NULL,
  phone          VARCHAR(20)  NOT NULL,
  province       VARCHAR(100) NOT NULL,
  district       VARCHAR(100) NOT NULL,
  ward           VARCHAR(100) NOT NULL,
  street_detail  VARCHAR(255) NOT NULL,
  is_default     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 2. SHOP (SELLER)
-- ---------------------------------------------------------------------

CREATE TABLE shops (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_id       BIGINT UNSIGNED NOT NULL,
  name           VARCHAR(150) NOT NULL,
  description    TEXT         NULL,
  logo_url       VARCHAR(500) NULL,
  banner_url     VARCHAR(500) NULL,
  phone          VARCHAR(20)  NULL,
  warehouse_address VARCHAR(500) NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  reject_reason  VARCHAR(500) NULL,
  follower_count INT UNSIGNED NOT NULL DEFAULT 0,
  approved_at    DATETIME     NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shops_owner (owner_id),
  UNIQUE KEY uq_shops_name (name),
  KEY idx_shops_status (status),
  CONSTRAINT fk_shops_owner    FOREIGN KEY (owner_id)    REFERENCES users (id),
  CONSTRAINT chk_shops_status CHECK (status IN ('PENDING','ACTIVE','REJECTED','SUSPENDED'))
);

CREATE TABLE shop_followers (
  shop_id    BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (shop_id, user_id),
  KEY idx_shop_followers_user (user_id),
  CONSTRAINT fk_shop_followers_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
  CONSTRAINT fk_shop_followers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ;

-- ---------------------------------------------------------------------
-- 3. DANH MỤC, THƯƠNG HIỆU, THUỘC TÍNH
-- ---------------------------------------------------------------------

CREATE TABLE categories (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id  BIGINT UNSIGNED NULL ,
  name       VARCHAR(120) NOT NULL,
  slug       VARCHAR(150) NOT NULL,
  image_url  VARCHAR(500) NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent (parent_id),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
) ;

CREATE TABLE brands (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name      VARCHAR(120) NOT NULL,
  slug      VARCHAR(150) NOT NULL,
  logo_url  VARCHAR(500) NULL,
  is_active TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brands_name (name),
  UNIQUE KEY uq_brands_slug (slug)
);

-- Thuộc tính dùng chung (vd: Màu sắc, Kích cỡ) để tạo biến thể
CREATE TABLE attributes (
  id   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attributes_name (name)
);

CREATE TABLE attribute_values (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  attribute_id BIGINT UNSIGNED NOT NULL,
  value        VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attribute_values (attribute_id, value),
  CONSTRAINT fk_attribute_values_attr FOREIGN KEY (attribute_id) REFERENCES attributes (id) ON DELETE CASCADE
) ;

-- ---------------------------------------------------------------------
-- 4. SẢN PHẨM, BIẾN THỂ (SKU), TỒN KHO
-- ---------------------------------------------------------------------

CREATE TABLE products (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  shop_id       BIGINT UNSIGNED NOT NULL,
  category_id   BIGINT UNSIGNED NOT NULL,
  brand_id      BIGINT UNSIGNED NULL,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(300) NOT NULL,
  description   MEDIUMTEXT   NULL,
  thumbnail_url VARCHAR(500) NULL,
  price     	DECIMAL(15,2) NOT NULL DEFAULT 0,
  sold_count    INT UNSIGNED NOT NULL DEFAULT 0,
  rating_avg    DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count  INT UNSIGNED NOT NULL DEFAULT 0,
  status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  reject_reason VARCHAR(500) NULL,
  is_deleted    TINYINT(1)   NOT NULL DEFAULT 0 ,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  KEY idx_products_shop (shop_id),
  KEY idx_products_category (category_id, status, is_deleted),
  KEY idx_products_brand (brand_id),
  KEY idx_products_price (price),
  KEY idx_products_sold (sold_count),
  FULLTEXT KEY ft_products_name (name),
  CONSTRAINT fk_products_shop     FOREIGN KEY (shop_id)     REFERENCES shops (id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_products_brand    FOREIGN KEY (brand_id)    REFERENCES brands (id),
  CONSTRAINT chk_products_status CHECK (status IN ('DRAFT','PENDING','ACTIVE','HIDDEN','REJECTED'))
);

CREATE TABLE product_images (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_primary TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ;

CREATE TABLE product_variants (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id       BIGINT UNSIGNED NOT NULL,
  sku              VARCHAR(80)  NOT NULL,
  name             VARCHAR(200) NULL,
  price            DECIMAL(15,2) NOT NULL,
  stock            INT          NOT NULL DEFAULT 0,
  image_url        VARCHAR(500) NULL,
  status           VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_variants_sku (sku),
  KEY idx_variants_product (product_id),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT chk_variants_stock  CHECK (stock >= 0),
  CONSTRAINT chk_variants_price  CHECK (price >= 0),
  CONSTRAINT chk_variants_status CHECK (status IN ('ACTIVE','INACTIVE'))
) ;

CREATE TABLE variant_attribute_values (
  variant_id         BIGINT UNSIGNED NOT NULL,
  attribute_value_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (variant_id, attribute_value_id),
  CONSTRAINT fk_vav_variant FOREIGN KEY (variant_id)         REFERENCES product_variants (id) ON DELETE CASCADE,
  CONSTRAINT fk_vav_value   FOREIGN KEY (attribute_value_id) REFERENCES attribute_values (id)
) ;

-- Log biến động kho
CREATE TABLE stock_movements (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  variant_id   BIGINT UNSIGNED NOT NULL,
  change_qty   INT          NOT NULL ,
  stock_after  INT          NOT NULL,
  reason       VARCHAR(20)  NOT NULL,
  reference_id BIGINT UNSIGNED NULL ,
  created_by   BIGINT UNSIGNED NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_stock_movements_variant (variant_id, created_at),
  CONSTRAINT fk_stock_movements_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id),
  CONSTRAINT chk_stock_movements_reason CHECK (reason IN ('ORDER','CANCEL','RESTOCK','ADJUST','RETURN'))
);

-- ---------------------------------------------------------------------
-- 5. GIỎ HÀNG, WISHLIST
-- ---------------------------------------------------------------------

CREATE TABLE carts (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_carts_user (user_id),
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ;

CREATE TABLE cart_items (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id    BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NOT NULL,
  quantity   INT      NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_items (cart_id, variant_id),
  KEY idx_cart_items_variant (variant_id),
  CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
  CONSTRAINT chk_cart_items_qty CHECK (quantity > 0)
);

CREATE TABLE wishlists (
  user_id    BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  KEY idx_wishlists_product (product_id),
  CONSTRAINT fk_wishlists_user    FOREIGN KEY (user_id)    REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ;

-- ---------------------------------------------------------------------
-- 6. CẤU HÌNH VẬN CHUYỂN & THANH TOÁN
-- ---------------------------------------------------------------------

CREATE TABLE shipping_methods (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code           VARCHAR(30)  NOT NULL,
  name           VARCHAR(100) NOT NULL,
  base_fee       DECIMAL(15,2) NOT NULL DEFAULT 0,
  estimated_days VARCHAR(30)  NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shipping_methods_code (code)
);

CREATE TABLE payment_methods (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(30)  NOT NULL,
  name       VARCHAR(100) NOT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_methods_code (code)
);

-- ---------------------------------------------------------------------
-- 7. VOUCHER
-- ---------------------------------------------------------------------

CREATE TABLE vouchers (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code                VARCHAR(50)  NOT NULL,
  scope               VARCHAR(10)  NOT NULL COMMENT 'PLATFORM: của sàn | SHOP: của shop',
  shop_id             BIGINT UNSIGNED NULL COMMENT 'NULL nếu voucher của sàn',
  title               VARCHAR(200) NOT NULL,
  description         VARCHAR(500) NULL,
  discount_type       VARCHAR(10)  NOT NULL,
  discount_value      DECIMAL(15,2) NOT NULL,
  max_discount_amount DECIMAL(15,2) NULL COMMENT 'Giới hạn giảm khi discount_type = PERCENT',
  min_order_value     DECIMAL(15,2) NOT NULL DEFAULT 0,
  usage_limit         INT UNSIGNED NULL COMMENT 'Tổng lượt dùng; NULL = không giới hạn',
  usage_per_user      INT UNSIGNED NOT NULL DEFAULT 1,
  used_count          INT UNSIGNED NOT NULL DEFAULT 0,
  start_at            DATETIME     NOT NULL,
  end_at              DATETIME     NOT NULL,
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_by          BIGINT UNSIGNED NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vouchers_code (code),
  KEY idx_vouchers_shop (shop_id),
  KEY idx_vouchers_period (is_active, start_at, end_at),
  CONSTRAINT fk_vouchers_shop FOREIGN KEY (shop_id) REFERENCES shops (id),
  CONSTRAINT chk_vouchers_scope CHECK (scope IN ('PLATFORM','SHOP')),
  CONSTRAINT chk_vouchers_scope_shop CHECK (
    (scope = 'SHOP' AND shop_id IS NOT NULL) OR (scope = 'PLATFORM' AND shop_id IS NULL)
  ),
  CONSTRAINT chk_vouchers_type CHECK (discount_type IN ('PERCENT','FIXED')),
  CONSTRAINT chk_vouchers_value CHECK (discount_value > 0),
  CONSTRAINT chk_vouchers_period CHECK (end_at > start_at)
);

-- ---------------------------------------------------------------------
-- 8. ĐƠN HÀNG
--    orders      : đơn tổng khách đặt một lần (có thể nhiều shop)
--    shop_orders : đơn con theo từng shop, mang trạng thái xử lý
--    Không có cột status ở orders; trạng thái tổng hợp suy ra từ shop_orders để tránh phải đồng bộ hai nơi.
-- ---------------------------------------------------------------------

CREATE TABLE orders (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_code          VARCHAR(30)  NOT NULL,
  user_id             BIGINT UNSIGNED NOT NULL,
  recipient_name      VARCHAR(120) NOT NULL,
  recipient_phone     VARCHAR(20)  NOT NULL,
  shipping_address    VARCHAR(600) NOT NULL COMMENT 'Snapshot địa chỉ lúc đặt',
  payment_method_id   BIGINT UNSIGNED NOT NULL,
  shipping_method_id  BIGINT UNSIGNED NOT NULL,
  platform_voucher_id BIGINT UNSIGNED NULL,
  subtotal            DECIMAL(15,2) NOT NULL COMMENT 'Tổng tiền hàng',
  shipping_fee        DECIMAL(15,2) NOT NULL DEFAULT 0,
  platform_discount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  shop_discount_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount        DECIMAL(15,2) NOT NULL COMMENT 'Số tiền khách phải trả',
  note                VARCHAR(500) NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_code (order_code),
  KEY idx_orders_user (user_id, created_at),
  CONSTRAINT fk_orders_user     FOREIGN KEY (user_id)             REFERENCES users (id),
  CONSTRAINT fk_orders_payment  FOREIGN KEY (payment_method_id)   REFERENCES payment_methods (id),
  CONSTRAINT fk_orders_shipping FOREIGN KEY (shipping_method_id)  REFERENCES shipping_methods (id),
  CONSTRAINT fk_orders_voucher  FOREIGN KEY (platform_voucher_id) REFERENCES vouchers (id),
  CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
);

CREATE TABLE shop_orders (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id          BIGINT UNSIGNED NOT NULL,
  shop_id           BIGINT UNSIGNED NOT NULL,
  shop_order_code   VARCHAR(40)  NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  subtotal          DECIMAL(15,2) NOT NULL,
  shipping_fee      DECIMAL(15,2) NOT NULL DEFAULT 0,
  shop_voucher_id   BIGINT UNSIGNED NULL,
  shop_discount     DECIMAL(15,2) NOT NULL DEFAULT 0,
  platform_discount DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Phần voucher sàn phân bổ cho đơn con này',
  total_amount      DECIMAL(15,2) NOT NULL,
  commission_rate   DECIMAL(5,2)  NOT NULL DEFAULT 0 COMMENT 'Snapshot % hoa hồng lúc đặt',
  commission_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  carrier           VARCHAR(50)  NULL,
  tracking_code     VARCHAR(80)  NULL,
  cancel_reason     VARCHAR(500) NULL,
  confirmed_at      DATETIME     NULL,
  packed_at         DATETIME     NULL,
  shipped_at        DATETIME     NULL,
  completed_at      DATETIME     NULL,
  cancelled_at      DATETIME     NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_shop_orders_code (shop_order_code),
  KEY idx_shop_orders_order (order_id),
  KEY idx_shop_orders_shop (shop_id, status, created_at),
  KEY idx_shop_orders_status (status, created_at),
  CONSTRAINT fk_shop_orders_order   FOREIGN KEY (order_id)        REFERENCES orders (id),
  CONSTRAINT fk_shop_orders_shop    FOREIGN KEY (shop_id)         REFERENCES shops (id),
  CONSTRAINT fk_shop_orders_voucher FOREIGN KEY (shop_voucher_id) REFERENCES vouchers (id),
  CONSTRAINT chk_shop_orders_status CHECK (status IN
    ('PENDING','CONFIRMED','PACKING','SHIPPING','COMPLETED','CANCELLED','RETURNED'))
);

CREATE TABLE order_items (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  shop_order_id BIGINT UNSIGNED NOT NULL,
  product_id   BIGINT UNSIGNED NOT NULL,
  variant_id   BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(200) NULL,
  sku          VARCHAR(80)  NOT NULL,
  image_url    VARCHAR(500) NULL,
  unit_price   DECIMAL(15,2) NOT NULL,
  quantity     INT          NOT NULL,
  line_total   DECIMAL(15,2) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_shop_order (shop_order_id),
  KEY idx_order_items_variant (variant_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_shop_order FOREIGN KEY (shop_order_id) REFERENCES shop_orders (id),
  CONSTRAINT fk_order_items_product    FOREIGN KEY (product_id)    REFERENCES products (id),
  CONSTRAINT fk_order_items_variant    FOREIGN KEY (variant_id)    REFERENCES product_variants (id),
  CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
);

-- Log chuyển trạng thái
CREATE TABLE order_status_history (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  shop_order_id BIGINT UNSIGNED NOT NULL,
  from_status   VARCHAR(20) NULL,
  to_status     VARCHAR(20) NOT NULL,
  changed_by    BIGINT UNSIGNED NULL,
  note          VARCHAR(500) NULL,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_status_history_order (shop_order_id, created_at),
  CONSTRAINT fk_osh_shop_order FOREIGN KEY (shop_order_id) REFERENCES shop_orders (id),
  CONSTRAINT fk_osh_user       FOREIGN KEY (changed_by)    REFERENCES users (id)
);

CREATE TABLE voucher_usages (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  voucher_id      BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  order_id        BIGINT UNSIGNED NOT NULL,
  discount_amount DECIMAL(15,2) NOT NULL,
  used_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voucher_usages (voucher_id, order_id),
  KEY idx_voucher_usages_user (voucher_id, user_id),
  CONSTRAINT fk_voucher_usages_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers (id),
  CONSTRAINT fk_voucher_usages_user    FOREIGN KEY (user_id)    REFERENCES users (id),
  CONSTRAINT fk_voucher_usages_order   FOREIGN KEY (order_id)   REFERENCES orders (id)
);

CREATE TABLE payments (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id        BIGINT UNSIGNED NOT NULL,
  payment_method_id BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(15,2) NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  transaction_ref VARCHAR(100) NULL COMMENT 'Mã giao dịch của cổng thanh toán',
  provider_data   JSON         NULL COMMENT 'Payload callback/IPN gốc để đối soát',
  paid_at         DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_order (order_id),
  KEY idx_payments_txn (transaction_ref),
  CONSTRAINT fk_payments_order  FOREIGN KEY (order_id)          REFERENCES orders (id),
  CONSTRAINT fk_payments_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id),
  CONSTRAINT chk_payments_status CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED'))
);

CREATE TABLE return_requests (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  shop_order_id BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  type          VARCHAR(10)  NOT NULL,
  reason        VARCHAR(1000) NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'REQUESTED',
  refund_amount DECIMAL(15,2) NULL,
  handled_by    BIGINT UNSIGNED NULL,
  handled_note  VARCHAR(500) NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_return_requests_shop_order (shop_order_id),
  KEY idx_return_requests_status (status),
  CONSTRAINT fk_return_requests_shop_order FOREIGN KEY (shop_order_id) REFERENCES shop_orders (id),
  CONSTRAINT fk_return_requests_user       FOREIGN KEY (user_id)       REFERENCES users (id),
  CONSTRAINT fk_return_requests_handler    FOREIGN KEY (handled_by)    REFERENCES users (id),
  CONSTRAINT chk_return_requests_type   CHECK (type IN ('RETURN','EXCHANGE','REFUND')),
  CONSTRAINT chk_return_requests_status CHECK (status IN ('REQUESTED','APPROVED','REJECTED','COMPLETED'))
);

-- ---------------------------------------------------------------------
-- 9. ĐÁNH GIÁ & BÁO CÁO VI PHẠM
-- ---------------------------------------------------------------------

CREATE TABLE reviews (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_item_id  BIGINT UNSIGNED NOT NULL,
  product_id     BIGINT UNSIGNED NOT NULL,
  shop_id        BIGINT UNSIGNED NOT NULL,
  user_id        BIGINT UNSIGNED NOT NULL,
  rating         TINYINT UNSIGNED NOT NULL,
  content        TEXT         NULL,
  status         VARCHAR(10)  NOT NULL DEFAULT 'VISIBLE',
  shop_reply     TEXT         NULL,
  shop_replied_at DATETIME    NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reviews_product (product_id, status, created_at),
  KEY idx_reviews_shop (shop_id),
  KEY idx_reviews_user (user_id),
  CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items (id),
  CONSTRAINT fk_reviews_product    FOREIGN KEY (product_id)    REFERENCES products (id),
  CONSTRAINT fk_reviews_shop       FOREIGN KEY (shop_id)       REFERENCES shops (id),
  CONSTRAINT fk_reviews_user       FOREIGN KEY (user_id)       REFERENCES users (id),
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT chk_reviews_status CHECK (status IN ('VISIBLE','HIDDEN'))
);

CREATE TABLE review_images (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  review_id BIGINT UNSIGNED NOT NULL,
  url       VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_review_images_review (review_id),
  CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES reviews (id) ON DELETE CASCADE
) ;

-- ---------------------------------------------------------------------
-- 10. THÔNG BÁO
-- ---------------------------------------------------------------------

CREATE TABLE notifications (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       VARCHAR(30)  NOT NULL COMMENT 'Vd: ORDER_STATUS, PROMOTION, SYSTEM',
  title      VARCHAR(200) NOT NULL,
  content    VARCHAR(1000) NULL,
  link_url   VARCHAR(500) NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 11. CẤU HÌNH HỆ THỐNG
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(50)  NOT NULL COMMENT 'Vd: SHOP_APPROVED, USER_LOCKED, PRODUCT_DELETED',
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   BIGINT UNSIGNED NULL,
  old_value   JSON         NULL,
  new_value   JSON         NULL,
  ip_address  VARCHAR(45)  NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_user (user_id, created_at),
  KEY idx_audit_logs_entity (entity_type, entity_id),
  KEY idx_audit_logs_created (created_at)
);