package checkout

import (
	"context"
	"database/sql"
	"errors"

	"github.com/go-sql-driver/mysql"
)

var (
	errIdempotencyKeyReused   = errors.New("idempotency key reused with a different request")
	errCheckoutRequestPending = errors.New("checkout request has no committed response")
)

type checkoutReplay struct {
	status int
	body   []byte
}

// beginIdempotentCheckout reserves a per-user key in the same transaction as checkout.
// A unique-key collision waits for a concurrent checkout transaction, then returns its
// committed response or a safe conflict if the request body differs.
func beginIdempotentCheckout(ctx context.Context, db *sql.DB, userID int64, key, requestHash string) (*sql.Tx, *checkoutReplay, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return nil, nil, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO checkout_idempotency (user_id,idempotency_key,request_hash) VALUES (?,?,?)`, userID, key, requestHash); err == nil {
		return tx, nil, nil
	}
	var mysqlErr *mysql.MySQLError
	if !errors.As(err, &mysqlErr) || mysqlErr.Number != 1062 {
		_ = tx.Rollback()
		return nil, nil, err
	}
	_ = tx.Rollback()

	var existingHash string
	var response []byte
	var status sql.NullInt64
	err = db.QueryRowContext(ctx, `SELECT request_hash,response_body,http_status FROM checkout_idempotency WHERE user_id=? AND idempotency_key=?`, userID, key).Scan(&existingHash, &response, &status)
	if err != nil {
		return nil, nil, err
	}
	if existingHash != requestHash {
		return nil, nil, errIdempotencyKeyReused
	}
	if !status.Valid || len(response) == 0 {
		return nil, nil, errCheckoutRequestPending
	}
	return nil, &checkoutReplay{status: int(status.Int64), body: response}, nil
}

func persistCheckoutResponse(ctx context.Context, tx *sql.Tx, userID int64, key string, body []byte, status int) error {
	result, err := tx.ExecContext(ctx, `UPDATE checkout_idempotency SET response_body=?,http_status=? WHERE user_id=? AND idempotency_key=?`, body, status, userID, key)
	if err != nil {
		return err
	}
	updated, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if updated != 1 {
		return errors.New("checkout idempotency reservation was not found")
	}
	return nil
}
