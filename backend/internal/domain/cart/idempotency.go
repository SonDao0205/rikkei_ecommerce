package cart

import (
	"context"
	"database/sql"
	"errors"

	"github.com/go-sql-driver/mysql"
)

var errCartAddKeyReused = errors.New("cart add idempotency key reused with different input")

func beginCartAdd(ctx context.Context, db *sql.DB, userID int64, key, requestHash string) (*sql.Tx, bool, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return nil, false, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO cart_add_idempotency (user_id,idempotency_key,request_hash) VALUES (?,?,?)`, userID, key, requestHash); err == nil {
		return tx, false, nil
	}
	var mysqlErr *mysql.MySQLError
	if !errors.As(err, &mysqlErr) || mysqlErr.Number != 1062 {
		_ = tx.Rollback()
		return nil, false, err
	}
	_ = tx.Rollback()
	var previousHash string
	if err = db.QueryRowContext(ctx, `SELECT request_hash FROM cart_add_idempotency WHERE user_id=? AND idempotency_key=?`, userID, key).Scan(&previousHash); err != nil {
		return nil, false, err
	}
	if previousHash != requestHash {
		return nil, false, errCartAddKeyReused
	}
	return nil, true, nil
}
