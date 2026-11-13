package review

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/go-sql-driver/mysql"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/auditlog"
	"rikkei-ecommerce/internal/platform/httpx"
)

type handler struct {
	db     *sql.DB
	logger *log.Logger
}

func (h handler) id(r *http.Request) (int64, bool) {
	n, e := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	return n, e == nil && n > 0
}
func (h handler) err(w http.ResponseWriter, s int, c, m string) { httpx.WriteError(w, s, c, m) }
func (h handler) json(w http.ResponseWriter, s int, d any) {
	httpx.WriteJSON(w, s, map[string]any{"success": true, "data": d})
}
func (h handler) internal(w http.ResponseWriter, e error) {
	if h.logger != nil {
		h.logger.Printf("review request failed: %v", e)
	}
	h.err(w, 500, "internal_error", "Internal server error")
}
func path(r *http.Request) (int64, bool) {
	n, e := strconv.ParseInt(r.PathValue("id"), 10, 64)
	return n, e == nil && n > 0
}

type reviewInput struct {
	OrderItemID int64    `json:"order_item_id"`
	Rating      int      `json:"rating"`
	Content     string   `json:"content"`
	Images      []string `json:"images"`
}

func (h handler) create(w http.ResponseWriter, r *http.Request) {
	uid, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	var x reviewInput
	if !httpx.Decode(w, r, &x) {
		return
	}
	x.Content = strings.TrimSpace(x.Content)
	if x.OrderItemID < 1 || x.Rating < 1 || x.Rating > 5 || len([]rune(x.Content)) > 3000 || len(x.Images) > 5 {
		h.err(w, 400, "invalid_review", "Order item, rating 1–5, content up to 3000 characters and at most 5 images are required")
		return
	}
	for _, raw := range x.Images {
		u, e := url.ParseRequestURI(raw)
		if e != nil || u.Scheme != "https" || u.Host == "" || len(raw) > 500 {
			h.err(w, 400, "invalid_review_image", "Review images must be HTTPS URLs")
			return
		}
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var productID, shopID int64
	var status string
	e = tx.QueryRowContext(r.Context(), `SELECT oi.product_id,so.shop_id,so.status FROM order_items oi JOIN shop_orders so ON so.id=oi.shop_order_id JOIN orders o ON o.id=so.order_id WHERE oi.id=? AND o.user_id=? FOR UPDATE`, x.OrderItemID, uid).Scan(&productID, &shopID, &status)
	if errors.Is(e, sql.ErrNoRows) {
		h.err(w, 404, "order_item_not_found", "Order item was not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	if status != "COMPLETED" {
		h.err(w, 409, "order_not_completed", "Only completed purchases can be reviewed")
		return
	}
	var exists int
	e = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM reviews WHERE order_item_id=?`, x.OrderItemID).Scan(&exists)
	if e != nil {
		h.internal(w, e)
		return
	}
	if exists > 0 {
		h.err(w, 409, "already_reviewed", "This order item already has a review")
		return
	}
	res, e := tx.ExecContext(r.Context(), `INSERT INTO reviews(order_item_id,product_id,shop_id,user_id,rating,content,status) VALUES(?,?,?,?,?,?,'VISIBLE')`, x.OrderItemID, productID, shopID, uid, x.Rating, nullText(x.Content))
	if e != nil {
		var mysqlErr *mysql.MySQLError
		if errors.As(e, &mysqlErr) && mysqlErr.Number == 1062 {
			h.err(w, 409, "already_reviewed", "This order item already has a review")
			return
		}
		h.internal(w, e)
		return
	}
	id, e := res.LastInsertId()
	if e != nil {
		h.internal(w, e)
		return
	}
	for _, image := range x.Images {
		if _, e = tx.ExecContext(r.Context(), `INSERT INTO review_images(review_id,url) VALUES(?,?)`, id, image); e != nil {
			h.internal(w, e)
			return
		}
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "REVIEW_CREATED", "REVIEW", id, nil, map[string]any{"product_id": productID, "rating": x.Rating}); e != nil {
		h.internal(w, e)
		return
	}
	if _, e = tx.ExecContext(r.Context(), `UPDATE products SET rating_avg=(SELECT COALESCE(AVG(rating),0) FROM reviews WHERE product_id=? AND status='VISIBLE'), rating_count=(SELECT COUNT(*) FROM reviews WHERE product_id=? AND status='VISIBLE') WHERE id=?`, productID, productID, productID); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.json(w, 201, map[string]any{"id": id, "status": "VISIBLE"})
}

func (h handler) eligible(w http.ResponseWriter, r *http.Request) {
	uid, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT oi.id,oi.product_id,p.name,so.shop_order_code,so.updated_at
		FROM order_items oi JOIN shop_orders so ON so.id=oi.shop_order_id
		JOIN orders o ON o.id=so.order_id JOIN products p ON p.id=oi.product_id
		LEFT JOIN reviews r ON r.order_item_id=oi.id
		WHERE o.user_id=? AND so.status='COMPLETED' AND r.id IS NULL
		ORDER BY so.updated_at DESC,oi.id DESC LIMIT 100`, uid)
	if err != nil {
		h.internal(w, err)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var itemID, productID int64
		var productName, orderCode string
		var completedAt sql.NullTime
		if err = rows.Scan(&itemID, &productID, &productName, &orderCode, &completedAt); err != nil {
			h.internal(w, err)
			return
		}
		out = append(out, map[string]any{"order_item_id": itemID, "product_id": productID, "product_name": productName, "order_code": orderCode, "completed_at": completedAt})
	}
	if err = rows.Err(); err != nil {
		h.internal(w, err)
		return
	}
	h.json(w, 200, out)
}
func nullText(s string) any {
	if s == "" {
		return nil
	}
	return s
}
func (h handler) list(w http.ResponseWriter, r *http.Request, where string, args ...any) {
	q := `SELECT r.id,r.order_item_id,r.product_id,r.shop_id,r.user_id,r.rating,r.content,r.status,r.shop_reply,r.shop_replied_at,r.created_at,u.full_name,
		COALESCE((SELECT JSON_ARRAYAGG(ri.url) FROM review_images ri WHERE ri.review_id=r.id),JSON_ARRAY())
		FROM reviews r JOIN users u ON u.id=r.user_id WHERE ` + where + ` ORDER BY r.created_at DESC LIMIT 100`
	rows, e := h.db.QueryContext(r.Context(), q, args...)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, item, pid, sid, uid int64
		var rating int
		var content, reply sql.NullString
		var imagesJSON []byte
		var status, name string
		var replied, created sql.NullTime
		if e = rows.Scan(&id, &item, &pid, &sid, &uid, &rating, &content, &status, &reply, &replied, &created, &name, &imagesJSON); e != nil {
			h.internal(w, e)
			return
		}
		images := []string{}
		if len(imagesJSON) > 0 {
			if e = json.Unmarshal(imagesJSON, &images); e != nil {
				h.internal(w, e)
				return
			}
		}
		var contentValue, replyValue, repliedValue any
		if content.Valid {
			contentValue = content.String
		}
		if reply.Valid {
			replyValue = reply.String
		}
		if replied.Valid {
			repliedValue = replied.Time
		}
		out = append(out, map[string]any{"id": id, "order_item_id": item, "product_id": pid, "shop_id": sid, "customer_name": name, "rating": rating, "content": contentValue, "images": images, "status": status, "shop_reply": replyValue, "shop_replied_at": repliedValue, "created_at": created.Time})
	}
	if e = rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.json(w, 200, out)
}
func (h handler) publicList(w http.ResponseWriter, r *http.Request) {
	id, ok := path(r)
	if !ok {
		h.err(w, 400, "invalid_id", "Product ID must be positive")
		return
	}
	h.list(w, r, `r.product_id=? AND r.status='VISIBLE'`, id)
}
func (h handler) mine(w http.ResponseWriter, r *http.Request) {
	id, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	h.list(w, r, `r.user_id=?`, id)
}
func (h handler) sellerList(w http.ResponseWriter, r *http.Request) {
	uid, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	var sid int64
	e := h.db.QueryRowContext(r.Context(), `SELECT id FROM shops WHERE owner_id=? AND status='ACTIVE' LIMIT 1`, uid).Scan(&sid)
	if errors.Is(e, sql.ErrNoRows) {
		h.err(w, 403, "active_shop_required", "An active shop is required")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	h.list(w, r, `r.shop_id=?`, sid)
}
func (h handler) adminList(w http.ResponseWriter, r *http.Request) {
	status := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("status")))
	if status != "" && status != "VISIBLE" && status != "HIDDEN" {
		h.err(w, 400, "invalid_status", "Status must be VISIBLE or HIDDEN")
		return
	}
	if status == "" {
		status = "VISIBLE"
	}
	h.list(w, r, `r.status=?`, status)
}
func (h handler) reply(w http.ResponseWriter, r *http.Request) {
	id, ok := path(r)
	if !ok {
		h.err(w, 400, "invalid_id", "Review ID must be positive")
		return
	}
	uid, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	var x struct {
		Reply string `json:"reply"`
	}
	if !httpx.Decode(w, r, &x) {
		return
	}
	x.Reply = strings.TrimSpace(x.Reply)
	if len([]rune(x.Reply)) < 1 || len([]rune(x.Reply)) > 2000 {
		h.err(w, 400, "invalid_reply", "Reply must contain 1 to 2000 characters")
		return
	}
	var sid int64
	e := h.db.QueryRowContext(r.Context(), `SELECT s.id FROM shops s WHERE s.owner_id=? AND s.status='ACTIVE' LIMIT 1`, uid).Scan(&sid)
	if errors.Is(e, sql.ErrNoRows) {
		h.err(w, 403, "active_shop_required", "An active shop is required")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	res, e := tx.ExecContext(r.Context(), `UPDATE reviews SET shop_reply=?,shop_replied_at=UTC_TIMESTAMP() WHERE id=? AND shop_id=? AND status='VISIBLE'`, x.Reply, id, sid)
	if e != nil {
		h.internal(w, e)
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		h.err(w, 404, "review_not_found", "Visible review was not found for your shop")
		return
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "REVIEW_REPLIED", "REVIEW", id, nil, map[string]any{"shop_id": sid}); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.json(w, 200, map[string]any{"id": id, "shop_reply": x.Reply})
}
func (h handler) moderate(w http.ResponseWriter, r *http.Request) {
	id, ok := path(r)
	if !ok {
		h.err(w, 400, "invalid_id", "Review ID must be positive")
		return
	}
	uid, ok := h.id(r)
	if !ok {
		h.err(w, 401, "unauthorized", "Invalid user")
		return
	}
	var x struct {
		Status string `json:"status"`
		Reason string `json:"reason"`
	}
	if !httpx.Decode(w, r, &x) {
		return
	}
	x.Status = strings.ToUpper(strings.TrimSpace(x.Status))
	x.Reason = strings.TrimSpace(x.Reason)
	if (x.Status != "VISIBLE" && x.Status != "HIDDEN") || len(x.Reason) > 500 || (x.Status == "HIDDEN" && x.Reason == "") {
		h.err(w, 400, "invalid_moderation", "Use VISIBLE or HIDDEN; hiding requires a reason")
		return
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var old string
	e = tx.QueryRowContext(r.Context(), `SELECT status FROM reviews WHERE id=? FOR UPDATE`, id).Scan(&old)
	if errors.Is(e, sql.ErrNoRows) {
		h.err(w, 404, "review_not_found", "Review not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	_, e = tx.ExecContext(r.Context(), `UPDATE reviews SET status=? WHERE id=?`, x.Status, id)
	if e != nil {
		h.internal(w, e)
		return
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "REVIEW_MODERATED", "REVIEW", id, map[string]any{"status": old}, map[string]any{"status": x.Status, "reason": x.Reason}); e != nil {
		h.internal(w, e)
		return
	}
	if _, e = tx.ExecContext(r.Context(), `UPDATE products p JOIN reviews r ON r.product_id=p.id SET p.rating_avg=(SELECT COALESCE(AVG(r2.rating),0) FROM reviews r2 WHERE r2.product_id=p.id AND r2.status='VISIBLE'),p.rating_count=(SELECT COUNT(*) FROM reviews r3 WHERE r3.product_id=p.id AND r3.status='VISIBLE') WHERE r.id=?`, id); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.json(w, 200, map[string]any{"id": id, "status": x.Status})
}
func (h handler) auditLogs(w http.ResponseWriter, r *http.Request) {
	limit := 100
	if s := r.URL.Query().Get("limit"); s != "" {
		v, e := strconv.Atoi(s)
		if e != nil || v < 1 || v > 200 {
			h.err(w, 400, "invalid_limit", "Limit must be 1 to 200")
			return
		}
		limit = v
	}
	rows, e := h.db.QueryContext(r.Context(), `SELECT id,user_id,action,entity_type,entity_id,old_value,new_value,request_id,created_at FROM audit_logs ORDER BY created_at DESC,id DESC LIMIT ?`, limit)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var uid, eid sql.NullInt64
		var action, entity string
		var oldv, newv, request sql.NullString
		var created sql.NullTime
		if e = rows.Scan(&id, &uid, &action, &entity, &eid, &oldv, &newv, &request, &created); e != nil {
			h.internal(w, e)
			return
		}
		var userID, entityID, oldValue, newValue, requestID, createdAt any
		if uid.Valid {
			userID = uid.Int64
		}
		if eid.Valid {
			entityID = eid.Int64
		}
		if oldv.Valid {
			oldValue = oldv.String
		}
		if newv.Valid {
			newValue = newv.String
		}
		if request.Valid {
			requestID = request.String
		}
		if created.Valid {
			createdAt = created.Time
		}
		out = append(out, map[string]any{"id": id, "user_id": userID, "action": action, "entity_type": entity, "entity_id": entityID, "old_value": oldValue, "new_value": newValue, "request_id": requestID, "created_at": createdAt})
	}
	if e = rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.json(w, 200, out)
}
