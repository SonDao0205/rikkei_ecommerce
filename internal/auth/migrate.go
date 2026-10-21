package auth

import (
	"context"
	"database/sql"
	"embed"
	"strings"
)

//go:embed migrations/001_security.sql
var migrationFS embed.FS

func Migrate(ctx context.Context, db *sql.DB) error {
	b, e := migrationFS.ReadFile("migrations/001_security.sql")
	if e != nil {
		return e
	}
	for _, s := range strings.Split(string(b), ";") {
		s = strings.TrimSpace(s)
		if s != "" {
			if _, e = db.ExecContext(ctx, s); e != nil {
				return e
			}
		}
	}
	var indexExists int
	e = db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='refresh_tokens' AND index_name='idx_refresh_tokens_expiry'`).Scan(&indexExists)
	if e != nil {
		return e
	}
	if indexExists == 0 {
		if _, e = db.ExecContext(ctx, `ALTER TABLE refresh_tokens ADD KEY idx_refresh_tokens_expiry (expires_at)`); e != nil {
			return e
		}
	}
	if _, e = db.ExecContext(ctx, `DELETE FROM refresh_tokens WHERE expires_at<=UTC_TIMESTAMP() OR (revoked=1 AND created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 30 DAY))`); e != nil {
		return e
	}
	_, e = db.ExecContext(ctx, `DELETE FROM password_reset_otps WHERE expires_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 30 DAY)`)
	return e
}
