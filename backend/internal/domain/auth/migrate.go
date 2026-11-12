package auth

import (
	"context"
	"database/sql"
	"embed"
	"strings"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

func Migrate(ctx context.Context, db *sql.DB) error {
	for _, file := range []string{"migrations/001_security.sql", "migrations/002_multi_role.sql"} {
		b, err := migrationFS.ReadFile(file)
		if err != nil {
			return err
		}
		for _, statement := range strings.Split(string(b), ";") {
			statement = strings.TrimSpace(statement)
			if statement != "" {
				if _, err = db.ExecContext(ctx, statement); err != nil {
					return err
				}
			}
		}
	}
	var indexExists int
	err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='refresh_tokens' AND index_name='idx_refresh_tokens_expiry'`).Scan(&indexExists)
	if err != nil {
		return err
	}
	if indexExists == 0 {
		if _, err = db.ExecContext(ctx, `ALTER TABLE refresh_tokens ADD KEY idx_refresh_tokens_expiry (expires_at)`); err != nil {
			return err
		}
	}
	var avatarColumnExists int
	if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='users' AND column_name='avatar_url'`).Scan(&avatarColumnExists); err != nil {
		return err
	}
	if avatarColumnExists == 0 {
		if _, err = db.ExecContext(ctx, `ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL AFTER full_name`); err != nil {
			return err
		}
	}
	for _, column := range []struct{ name, definition string }{{"lock_reason", "VARCHAR(500) NULL"}, {"locked_at", "DATETIME NULL"}} {
		var exists int
		if err = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='users' AND column_name=?`, column.name).Scan(&exists); err != nil {
			return err
		}
		if exists == 0 {
			if _, err = db.ExecContext(ctx, `ALTER TABLE users ADD COLUMN `+column.name+` `+column.definition); err != nil {
				return err
			}
		}
	}
	if _, err = db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE expires_at<=UTC_TIMESTAMP() OR (revoked=1 AND created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 30 DAY))`); err != nil {
		return err
	}
	_, err = db.ExecContext(ctx, `DELETE FROM password_reset_otps WHERE expires_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 30 DAY)`)
	return err
}
