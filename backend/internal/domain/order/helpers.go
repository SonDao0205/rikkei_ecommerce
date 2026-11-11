package order

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"net/url"
	"strings"

	"rikkei-ecommerce/internal/platform/httpx"
)

func writeJSON(w http.ResponseWriter, status int, value any) {
	httpx.WriteJSON(w, status, value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}

func serverError(w http.ResponseWriter, logger *log.Logger, err error) {
	httpx.ServerError(w, logger, err)
}

func parseListPage(values url.Values) (int, int, error) {
	return httpx.ParseListPage(values)
}

func statusLabel(status string) string {
	switch strings.ToUpper(strings.TrimSpace(status)) {
	case "PENDING":
		return "Chờ xác nhận"
	case "CONFIRMED":
		return "Đã xác nhận"
	case "PACKING":
		return "Đang chuẩn bị hàng"
	case "SHIPPING":
		return "Đang vận chuyển"
	case "COMPLETED":
		return "Hoàn thành"
	case "CANCELLED":
		return "Đã hủy"
	case "RETURNED":
		return "Đổi / Trả hàng"
	default:
		return status
	}
}

func deriveParentStatus(statuses []string) (string, string) {
	if len(statuses) == 0 {
		return "PENDING", statusLabel("PENDING")
	}

	total := len(statuses)
	var cancelledCount, returnedCount, completedCount, shippingCount, packingCount, confirmedCount, pendingCount int

	for _, s := range statuses {
		switch strings.ToUpper(s) {
		case "CANCELLED":
			cancelledCount++
		case "RETURNED":
			returnedCount++
		case "COMPLETED":
			completedCount++
		case "SHIPPING":
			shippingCount++
		case "PACKING":
			packingCount++
		case "CONFIRMED":
			confirmedCount++
		case "PENDING":
			pendingCount++
		}
	}

	if cancelledCount == total {
		return "CANCELLED", statusLabel("CANCELLED")
	}
	if returnedCount == total {
		return "RETURNED", statusLabel("RETURNED")
	}
	if (completedCount+returnedCount+cancelledCount) == total && completedCount > 0 {
		return "COMPLETED", statusLabel("COMPLETED")
	}
	if shippingCount > 0 {
		return "SHIPPING", statusLabel("SHIPPING")
	}
	if packingCount > 0 {
		return "PACKING", statusLabel("PACKING")
	}
	if confirmedCount > 0 {
		return "CONFIRMED", statusLabel("CONFIRMED")
	}
	if pendingCount > 0 {
		return "PENDING", statusLabel("PENDING")
	}

	return "PENDING", statusLabel("PENDING")
}

func activeSellerShop(ctx context.Context, db *sql.DB, userID string) (int64, string, error) {
	var shopID int64
	var shopName string
	err := db.QueryRowContext(ctx, `SELECT s.id, s.name FROM shops s 
		JOIN users u ON u.id = s.owner_id
		JOIN user_roles ur ON ur.user_id = u.id AND ur.role_code = 'SELLER'
		WHERE s.owner_id = ? AND s.status = 'ACTIVE' AND u.status = 'ACTIVE'`, userID).Scan(&shopID, &shopName)
	return shopID, shopName, err
}

func recordStatusHistory(ctx context.Context, tx *sql.Tx, shopOrderID int64, fromStatus, toStatus string, changedBy *int64, note string) error {
	var fromVal any
	if fromStatus != "" {
		fromVal = fromStatus
	}
	var noteVal any
	if strings.TrimSpace(note) != "" {
		noteVal = strings.TrimSpace(note)
	}

	_, err := tx.ExecContext(ctx,
		`INSERT INTO order_status_history (shop_order_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, ?, ?)`,
		shopOrderID, fromVal, toStatus, changedBy, noteVal,
	)
	return err
}
