package media

import (
	"context"
	"database/sql"
	"errors"

	"github.com/go-sql-driver/mysql"
)

var (
	errUploadKeyReused  = errors.New("media upload key reused with different input")
	errUploadInProgress = errors.New("media upload request has no committed response")
)

type uploadReplay struct{ body []byte }

func beginMediaUpload(ctx context.Context, db *sql.DB, userID int64, key, purpose, requestHash, publicID string) (*sql.Tx, *uploadReplay, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return nil, nil, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO media_upload_idempotency (user_id,idempotency_key,purpose,request_hash,public_id) VALUES (?,?,?,?,?)`, userID, key, purpose, requestHash, publicID); err == nil {
		return tx, nil, nil
	}
	var mysqlErr *mysql.MySQLError
	if !errors.As(err, &mysqlErr) || mysqlErr.Number != 1062 {
		_ = tx.Rollback()
		return nil, nil, err
	}
	_ = tx.Rollback()
	var previousPurpose, previousHash string
	var response []byte
	err = db.QueryRowContext(ctx, `SELECT purpose,request_hash,response_body FROM media_upload_idempotency WHERE user_id=? AND idempotency_key=?`, userID, key).Scan(&previousPurpose, &previousHash, &response)
	if err != nil {
		return nil, nil, err
	}
	if previousPurpose != purpose || previousHash != requestHash {
		return nil, nil, errUploadKeyReused
	}
	if len(response) == 0 {
		return nil, nil, errUploadInProgress
	}
	return nil, &uploadReplay{body: response}, nil
}

func persistMediaUpload(ctx context.Context, tx *sql.Tx, userID int64, key string, response []byte) error {
	result, err := tx.ExecContext(ctx, `UPDATE media_upload_idempotency SET response_body=? WHERE user_id=? AND idempotency_key=?`, response, userID, key)
	if err != nil {
		return err
	}
	updated, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if updated != 1 {
		return errors.New("media upload reservation was not found")
	}
	return nil
}
