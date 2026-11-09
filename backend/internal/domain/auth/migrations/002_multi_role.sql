CREATE TABLE IF NOT EXISTS roles (
  code VARCHAR(16) NOT NULL,
  name VARCHAR(32) NOT NULL,
  PRIMARY KEY (code),
  CONSTRAINT chk_roles_code CHECK (code IN ('CLIENT','SELLER','ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (code,name) VALUES
  ('CLIENT','Client'),
  ('SELLER','Seller'),
  ('ADMIN','Administrator')
ON DUPLICATE KEY UPDATE name=VALUES(name);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_code VARCHAR(16) NOT NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id,role_code),
  KEY idx_user_roles_role (role_code,user_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_code) REFERENCES roles(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT id,'CLIENT' FROM users;

INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT id,'ADMIN' FROM users
WHERE LOWER(COALESCE(role,''))='admin';

INSERT IGNORE INTO user_roles (user_id,role_code)
SELECT u.id,'SELLER' FROM users u
JOIN shops s ON s.owner_id=u.id AND s.status IN ('ACTIVE','SUSPENDED')
WHERE LOWER(COALESCE(u.role,''))='seller';
