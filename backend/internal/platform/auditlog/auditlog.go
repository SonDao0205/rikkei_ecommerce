package auditlog

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"

	"rikkei-ecommerce/internal/platform/observability"
)

type Execer interface {
	ExecContext(context.Context, string, ...any) (sql.Result, error)
}

// Record writes a business audit event using the caller's transaction where
// available. Only explicitly supplied, non-secret state should be recorded.
func Record(ctx context.Context, execer Execer, actorID, action, entityType string, entityID int64, oldValue, newValue any) error {
	var actor any
	if parsed, err := strconv.ParseInt(actorID, 10, 64); err == nil && parsed > 0 {
		actor = parsed
	}
	oldJSON, err := marshalOptional(oldValue)
	if err != nil {
		return fmt.Errorf("marshal audit old value: %w", err)
	}
	newJSON, err := marshalOptional(newValue)
	if err != nil {
		return fmt.Errorf("marshal audit new value: %w", err)
	}
	var entity any
	if entityID > 0 {
		entity = entityID
	}
	_, err = execer.ExecContext(ctx, `INSERT INTO audit_logs
		(user_id,action,entity_type,entity_id,old_value,new_value,request_id)
		VALUES(?,?,?,?,?,?,?)`, actor, action, entityType, entity, oldJSON, newJSON, observability.RequestID(ctx))
	if err != nil {
		return fmt.Errorf("insert audit log: %w", err)
	}
	return nil
}

func marshalOptional(value any) (any, error) {
	if value == nil {
		return nil, nil
	}
	encoded, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}
	return string(encoded), nil
}

// Migrate adds request correlation to existing installations without relying
// on MySQL-version-specific ALTER TABLE IF NOT EXISTS syntax.
func Migrate(ctx context.Context, db *sql.DB) error {
	var count int
	err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema=DATABASE() AND table_name='audit_logs' AND column_name='request_id'`).Scan(&count)
	if err != nil {
		return err
	}
	if count != 0 {
		return nil
	}
	_, err = db.ExecContext(ctx, `ALTER TABLE audit_logs ADD COLUMN request_id VARCHAR(128) NULL,
		ADD KEY idx_audit_logs_request (request_id)`)
	return err
}
