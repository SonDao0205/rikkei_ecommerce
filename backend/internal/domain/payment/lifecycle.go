package payment

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/domain/order"
)

const payOSPaymentWindowSeconds = 15 * 60
const payOSCreationLease = 45 * time.Second
const unpaidPayOSReason = "Đơn hàng chưa được thanh toán qua PayOS"

type payOSPayment struct {
	id, orderID, amount, expiresAt int64
	status                         string
	attemptID                      sql.NullInt64
	hasLink                        bool
}

func (p payOSPayment) expired() bool { return time.Now().Unix() >= p.expiresAt }

func (h *Handler) refreshPayOSPayment(ctx context.Context, p payOSPayment) error {
	if !p.attemptID.Valid {
		if p.status == "PENDING" && p.expired() {
			return h.applyPayOSStatus(ctx, p, "EXPIRED")
		}
		return nil
	}
	if h.cfg.PayOSClientID == "" {
		return nil
	}
	ctx, cancel := context.WithTimeout(ctx, 16*time.Second)
	defer cancel()
	code := strconv.FormatInt(p.id, 10)
	result, err := h.getPayOSLink(ctx, code)
	if errors.Is(err, errPayOSLinkNotFound) && !p.hasLink && p.status == "PENDING" && p.expired() {
		return h.applyPayOSStatus(ctx, p, "EXPIRED")
	}
	if err != nil {
		return err
	}
	if err := result.validatePayment(p); err != nil {
		return err
	}

	status := strings.ToUpper(strings.TrimSpace(result.Data.Status))
	if p.status == "PENDING" && p.expired() && status == "PENDING" {
		// Older links were created without an expiry. Close them at PayOS before releasing stock.
		result, err = h.payOSLinkRequest(ctx, code+"/cancel", []byte(`{"cancellationReason":"Payment deadline reached"}`))
		if err != nil {
			return err
		}
		if err := result.validatePayment(p); err != nil {
			return err
		}
		status = strings.ToUpper(strings.TrimSpace(result.Data.Status))
		if status == "CANCELLED" {
			status = "EXPIRED"
		}
	}
	switch status {
	case "PAID":
		return h.applyPayOSStatus(ctx, p, status)
	case "CANCELLED", "EXPIRED":
		if result.Data.AmountPaid > 0 && p.status == "PENDING" {
			h.logger.Printf("partial PayOS transfer requires reconciliation payment_id=%d amount_paid=%d", p.id, result.Data.AmountPaid)
		}
		return h.applyPayOSStatus(ctx, p, status)
	}
	return nil
}

func (r payOSLinkResponse) validatePayment(p payOSPayment) error {
	if r.Code != "00" {
		return fmt.Errorf("payOS status request rejected code=%s", r.Code)
	}
	if r.Data.OrderCode != p.id || r.Data.Amount != p.amount {
		return fmt.Errorf("payOS status response did not match local payment")
	}
	return nil
}

func (h *Handler) applyPayOSStatus(ctx context.Context, p payOSPayment, status string) error {
	tx, err := h.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	// Manual customer cancellation locks the parent order first as well.
	if err := tx.QueryRowContext(ctx, `SELECT id FROM orders WHERE id=? FOR UPDATE`, p.orderID).Scan(&p.orderID); err != nil {
		return err
	}
	var paymentStatus string
	if err := tx.QueryRowContext(ctx, `SELECT status FROM payments WHERE id=? FOR UPDATE`, p.id).Scan(&paymentStatus); err != nil {
		return err
	}
	if status == "PAID" {
		if err := h.recordPayOSPaid(ctx, tx, p.id, p.attemptID.Int64, paymentStatus, nil, nil); err != nil {
			return err
		}
		return tx.Commit()
	}
	if paymentStatus != "PENDING" {
		return nil
	}

	if p.attemptID.Valid {
		if _, err := tx.ExecContext(ctx, `UPDATE payment_attempts SET status=? WHERE id=?`, status, p.attemptID.Int64); err != nil {
			return err
		}
	} else {
		var attemptID int64
		err := tx.QueryRowContext(ctx, `SELECT id FROM payment_attempts WHERE payment_id=? FOR UPDATE`, p.id).Scan(&attemptID)
		if err == nil {
			return nil
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
	}
	if _, err := tx.ExecContext(ctx, `UPDATE payments SET status='FAILED',updated_at=UTC_TIMESTAMP() WHERE id=?`, p.id); err != nil {
		return err
	}
	reason := unpaidPayOSReason
	if status == "EXPIRED" {
		reason = "Đã hết thời hạn thanh toán qua PayOS"
	}
	if err := cancelUnpaidShopOrders(ctx, tx, p.orderID, reason); err != nil {
		return err
	}
	return tx.Commit()
}

func (h *Handler) recordPayOSPaid(ctx context.Context, tx *sql.Tx, paymentID, attemptID int64, status string, ref, payload any) error {
	if status == "REFUNDED" {
		return nil
	}
	if _, err := tx.ExecContext(ctx, `UPDATE payments SET status='PAID',paid_at=COALESCE(paid_at,UTC_TIMESTAMP()),
		transaction_ref=COALESCE(NULLIF(transaction_ref,''),?),provider_data=COALESCE(?,provider_data),updated_at=UTC_TIMESTAMP()
		WHERE id=?`, ref, payload, paymentID); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx, `UPDATE payment_attempts SET status='PAID',failure_code=NULL WHERE id=?`, attemptID); err != nil {
		return err
	}
	if status == "FAILED" {
		h.logger.Printf("late PayOS success requires reconciliation payment_id=%d", paymentID)
	}
	return nil
}

func cancelUnpaidShopOrders(ctx context.Context, tx *sql.Tx, orderID int64, reason string) error {
	rows, err := tx.QueryContext(ctx, `SELECT id,status FROM shop_orders WHERE order_id=? AND status IN ('PENDING','CONFIRMED','PACKING') ORDER BY id FOR UPDATE`, orderID)
	if err != nil {
		return err
	}
	defer rows.Close()
	type shopOrder struct {
		id     int64
		status string
	}
	var targets []shopOrder
	for rows.Next() {
		var target shopOrder
		if err := rows.Scan(&target.id, &target.status); err != nil {
			return err
		}
		targets = append(targets, target)
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for _, target := range targets {
		if _, err := tx.ExecContext(ctx, `UPDATE shop_orders SET status='CANCELLED',cancel_reason=?,cancelled_at=UTC_TIMESTAMP(),
			updated_at=UTC_TIMESTAMP() WHERE id=?`, reason, target.id); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `INSERT INTO order_status_history (shop_order_id,from_status,to_status,note)
			VALUES (?,?,'CANCELLED',?)`, target.id, target.status, reason); err != nil {
			return err
		}
		if err := order.RestoreShopOrderInventory(ctx, tx, target.id); err != nil {
			return err
		}
	}
	return nil
}

// RunPayOSReconciliation settles expired checkout orders even when the customer leaves PayOS.
func RunPayOSReconciliation(ctx context.Context, db *sql.DB, cfg auth.Config, logger *log.Logger) {
	h := newHandler(db, cfg, logger)
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for ctx.Err() == nil {
		h.reconcilePayOSOrders(ctx)
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (h *Handler) reconcilePayOSOrders(ctx context.Context) {
	for afterID := int64(0); ctx.Err() == nil; {
		batch, err := h.payOSReconciliationBatch(ctx, afterID)
		if err != nil {
			h.logger.Printf("PayOS reconciliation scan failed: %v", err)
			return
		}
		if len(batch) == 0 {
			return
		}
		for _, p := range batch {
			ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
			err := h.refreshPayOSPayment(ctx, p)
			cancel()
			if err != nil {
				h.logger.Printf("PayOS reconciliation deferred payment_id=%d: %v", p.id, err)
			}
		}
		afterID = batch[len(batch)-1].id
	}
}

func (h *Handler) payOSReconciliationBatch(ctx context.Context, afterID int64) ([]payOSPayment, error) {
	rows, err := h.db.QueryContext(ctx, `SELECT p.id,p.order_id,CAST(p.amount AS SIGNED),p.status,
		UNIX_TIMESTAMP(p.created_at)+?,a.id,a.provider_link_id IS NOT NULL
		FROM payments p JOIN payment_methods pm ON pm.id=p.payment_method_id
		LEFT JOIN payment_attempts a ON a.payment_id=p.id AND a.provider='PAYOS'
		WHERE p.id>? AND pm.code='BANK_TRANSFER' AND p.status='PENDING'
			AND p.created_at<=TIMESTAMPADD(SECOND,?,CURRENT_TIMESTAMP)
			AND (a.id IS NULL OR a.status<>'CREATING' OR a.updated_at<=TIMESTAMPADD(SECOND,?,CURRENT_TIMESTAMP))
		ORDER BY p.id LIMIT 50`, payOSPaymentWindowSeconds, afterID, -payOSPaymentWindowSeconds, -int(payOSCreationLease/time.Second))
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var batch []payOSPayment
	for rows.Next() {
		var p payOSPayment
		if err := rows.Scan(&p.id, &p.orderID, &p.amount, &p.status, &p.expiresAt, &p.attemptID, &p.hasLink); err != nil {
			return nil, err
		}
		batch = append(batch, p)
	}
	return batch, rows.Err()
}
