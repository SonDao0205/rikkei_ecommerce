package promotion

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/auditlog"
	"rikkei-ecommerce/internal/platform/httpx"
)

type handler struct {
	db     *sql.DB
	logger *log.Logger
}
type voucherInput struct {
	Code          string   `json:"code"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	DiscountType  string   `json:"discount_type"`
	DiscountValue float64  `json:"discount_value"`
	MaxDiscount   *float64 `json:"max_discount_amount"`
	Minimum       float64  `json:"min_order_value"`
	UsageLimit    *int     `json:"usage_limit"`
	PerUser       int      `json:"usage_per_user"`
	StartAt       string   `json:"start_at"`
	EndAt         string   `json:"end_at"`
}

func (h handler) actor(r *http.Request) (int64, bool) {
	id, e := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	return id, e == nil && id > 0
}
func (h handler) fail(w http.ResponseWriter, status int, code, msg string) {
	httpx.WriteError(w, status, code, msg)
}
func (h handler) ok(w http.ResponseWriter, status int, data any) {
	httpx.WriteJSON(w, status, map[string]any{"success": true, "data": data})
}
func (h handler) internal(w http.ResponseWriter, err error) {
	if h.logger != nil {
		h.logger.Printf("promotion request failed: %v", err)
	}
	h.fail(w, 500, "internal_error", "Internal server error")
}
func (h handler) adminVouchers(w http.ResponseWriter, r *http.Request) { h.listVouchers(w, r, nil) }
func (h handler) publicVouchers(w http.ResponseWriter, r *http.Request) {
	shopID := strings.TrimSpace(r.URL.Query().Get("shop_id"))
	scope := strings.ToUpper(strings.TrimSpace(r.URL.Query().Get("scope")))
	if scope != "" && scope != "PLATFORM" && scope != "SHOP" {
		h.fail(w, 400, "invalid_scope", "Scope must be PLATFORM or SHOP")
		return
	}
	query := `SELECT id,code,scope,shop_id,title,description,discount_type,discount_value,max_discount_amount,min_order_value,usage_limit,usage_per_user,used_count,start_at,end_at,is_active FROM vouchers WHERE is_active=1 AND start_at<=UTC_TIMESTAMP() AND end_at>UTC_TIMESTAMP()`
	args := []any{}
	if scope != "" {
		query += ` AND scope=?`
		args = append(args, scope)
	}
	if shopID != "" {
		id, e := strconv.ParseInt(shopID, 10, 64)
		if e != nil || id < 1 {
			h.fail(w, 400, "invalid_shop_id", "Shop ID must be positive")
			return
		}
		query += ` AND shop_id=?`
		args = append(args, id)
	}
	query += ` ORDER BY end_at,id LIMIT 200`
	rows, e := h.db.QueryContext(r.Context(), query, args...)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	h.writeVoucherRows(w, rows)
}
func (h handler) sellerVouchers(w http.ResponseWriter, r *http.Request) {
	id, ok := h.actor(r)
	if !ok {
		h.fail(w, 401, "unauthorized", "Invalid user")
		return
	}
	shopID, e := h.activeShop(r, id)
	if e != nil {
		h.internal(w, e)
		return
	}
	if shopID == 0 {
		h.fail(w, 403, "active_shop_required", "An active shop is required")
		return
	}
	h.listVouchers(w, r, &shopID)
}
func (h handler) listVouchers(w http.ResponseWriter, r *http.Request, shopID *int64) {
	q := `SELECT id,code,scope,shop_id,title,description,discount_type,discount_value,max_discount_amount,min_order_value,usage_limit,usage_per_user,used_count,start_at,end_at,is_active FROM vouchers`
	args := []any{}
	if shopID != nil {
		q += ` WHERE shop_id=?`
		args = append(args, *shopID)
	}
	q += ` ORDER BY created_at DESC LIMIT 200`
	rows, e := h.db.QueryContext(r.Context(), q, args...)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	h.writeVoucherRows(w, rows)
}
func (h handler) writeVoucherRows(w http.ResponseWriter, rows *sql.Rows) {
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var code, scope, title, typ string
		var sid sql.NullInt64
		var desc sql.NullString
		var value, max, min float64
		var maxN, limit sql.NullInt64
		var per, used int
		var start, end time.Time
		var active bool
		if e := rows.Scan(&id, &code, &scope, &sid, &title, &desc, &typ, &value, &maxN, &min, &limit, &per, &used, &start, &end, &active); e != nil {
			h.internal(w, e)
			return
		}
		var mx any
		if maxN.Valid {
			mx = max
		}
		var lim any
		if limit.Valid {
			lim = limit.Int64
		}
		var s any
		if sid.Valid {
			s = sid.Int64
		}
		out = append(out, map[string]any{"id": id, "code": code, "scope": scope, "shop_id": s, "title": title, "description": desc, "discount_type": typ, "discount_value": value, "max_discount_amount": mx, "min_order_value": min, "usage_limit": lim, "usage_per_user": per, "used_count": used, "start_at": start, "end_at": end, "is_active": active})
	}
	if e := rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, out)
}
func (h handler) createPlatformVoucher(w http.ResponseWriter, r *http.Request) {
	h.createVoucher(w, r, nil, "PLATFORM")
}
func (h handler) createShopVoucher(w http.ResponseWriter, r *http.Request) {
	uid, ok := h.actor(r)
	if !ok {
		h.fail(w, 401, "unauthorized", "Invalid user")
		return
	}
	sid, e := h.activeShop(r, uid)
	if e != nil {
		h.internal(w, e)
		return
	}
	if sid == 0 {
		h.fail(w, 403, "active_shop_required", "An active shop is required")
		return
	}
	h.createVoucher(w, r, &sid, "SHOP")
}
func (h handler) createVoucher(w http.ResponseWriter, r *http.Request, shopID *int64, scope string) {
	uid, ok := h.actor(r)
	if !ok {
		h.fail(w, 401, "unauthorized", "Invalid user")
		return
	}
	var in voucherInput
	if !httpx.Decode(w, r, &in) {
		return
	}
	in.Code = strings.ToUpper(strings.TrimSpace(in.Code))
	in.Title = strings.TrimSpace(in.Title)
	in.DiscountType = strings.ToUpper(strings.TrimSpace(in.DiscountType))
	start, e1 := time.Parse(time.RFC3339, in.StartAt)
	end, e2 := time.Parse(time.RFC3339, in.EndAt)
	if len(in.Code) < 4 || len(in.Code) > 50 || !codeAllowed(in.Code) || len(in.Title) < 2 || len(in.Title) > 200 || len(in.Description) > 500 || in.Minimum < 0 || in.Minimum > 9_999_999_999_999.99 || in.PerUser < 1 || in.PerUser > 100 || e1 != nil || e2 != nil || !end.After(start) || in.DiscountValue <= 0 || in.DiscountValue > 9_999_999_999_999.99 || (in.DiscountType != "PERCENT" && in.DiscountType != "FIXED") || (in.DiscountType == "PERCENT" && in.DiscountValue > 100) || (in.MaxDiscount != nil && (*in.MaxDiscount <= 0 || *in.MaxDiscount > 9_999_999_999_999.99)) || (in.UsageLimit != nil && (*in.UsageLimit < 1 || *in.UsageLimit > 1_000_000_000)) {
		h.fail(w, 400, "invalid_voucher", "Voucher fields or date range are invalid")
		return
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	res, e := tx.ExecContext(r.Context(), `INSERT INTO vouchers(code,scope,shop_id,title,description,discount_type,discount_value,max_discount_amount,min_order_value,usage_limit,usage_per_user,start_at,end_at,is_active,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,1,?)`, in.Code, scope, shopID, in.Title, nullString(in.Description), in.DiscountType, in.DiscountValue, in.MaxDiscount, in.Minimum, in.UsageLimit, in.PerUser, start.UTC(), end.UTC(), uid)
	if e != nil {
		if strings.Contains(strings.ToLower(e.Error()), "duplicate") {
			h.fail(w, 409, "voucher_code_exists", "Voucher code already exists")
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
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "VOUCHER_CREATED", "VOUCHER", id, nil, map[string]any{"code": in.Code, "scope": scope, "shop_id": shopID}); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 201, map[string]any{"id": id, "code": in.Code, "scope": scope, "shop_id": shopID, "is_active": true})
}
func codeAllowed(s string) bool {
	for _, c := range s {
		if !(c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c == '-' || c == '_') {
			return false
		}
	}
	return true
}
func nullString(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return strings.TrimSpace(s)
}
func (h handler) activeShop(r *http.Request, uid int64) (int64, error) {
	var id int64
	e := h.db.QueryRowContext(r.Context(), `SELECT id FROM shops WHERE owner_id=? AND status='ACTIVE' ORDER BY id DESC LIMIT 1`, uid).Scan(&id)
	if errors.Is(e, sql.ErrNoRows) {
		return 0, nil
	}
	return id, e
}
func pathID(r *http.Request) (int64, bool) {
	id, e := strconv.ParseInt(r.PathValue("id"), 10, 64)
	return id, e == nil && id > 0
}
func (h handler) voucherStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r)
	if !ok {
		h.fail(w, 400, "invalid_id", "ID must be positive")
		return
	}
	uid, ok := h.actor(r)
	if !ok {
		h.fail(w, 401, "unauthorized", "Invalid user")
		return
	}
	identity := auth.CurrentUser(r)
	isAdmin := containsRole(identity.Roles, "ADMIN")
	isSeller := containsRole(identity.Roles, "SELLER")
	if !isAdmin && !isSeller {
		h.fail(w, 403, "forbidden", "Insufficient permissions")
		return
	}
	var req struct {
		Active *bool `json:"is_active"`
	}
	if !httpx.Decode(w, r, &req) {
		return
	}
	if req.Active == nil {
		h.fail(w, 400, "invalid_status", "is_active is required")
		return
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var scope string
	var sid sql.NullInt64
	var active bool
	e = tx.QueryRowContext(r.Context(), `SELECT scope,shop_id,is_active FROM vouchers WHERE id=? FOR UPDATE`, id).Scan(&scope, &sid, &active)
	if errors.Is(e, sql.ErrNoRows) {
		h.fail(w, 404, "voucher_not_found", "Voucher not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	if scope == "SHOP" {
		if !isAdmin {
			if !isSeller {
				h.fail(w, 403, "forbidden", "Insufficient permissions")
				return
			}
			shopID, e := h.activeShop(r, uid)
			if e != nil {
				h.internal(w, e)
				return
			}
			if !sid.Valid || shopID != sid.Int64 {
				h.fail(w, 403, "forbidden", "Voucher belongs to another shop")
				return
			}
		}
	} else if !isAdmin {
		h.fail(w, 403, "forbidden", "Only administrators can manage platform vouchers")
		return
	}
	_, e = tx.ExecContext(r.Context(), `UPDATE vouchers SET is_active=? WHERE id=?`, *req.Active, id)
	if e != nil {
		h.internal(w, e)
		return
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "VOUCHER_STATUS_CHANGED", "VOUCHER", id, map[string]any{"is_active": active}, map[string]any{"is_active": *req.Active}); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, map[string]any{"id": id, "is_active": *req.Active})
}

func containsRole(roles []string, target string) bool {
	for _, role := range roles {
		if role == target {
			return true
		}
	}
	return false
}

type bannerInput struct {
	Title     string `json:"title"`
	ImageURL  string `json:"image_url"`
	TargetURL string `json:"target_url"`
	Position  string `json:"position"`
	StartAt   string `json:"start_at"`
	EndAt     string `json:"end_at"`
	SortOrder int    `json:"sort_order"`
}

func safeURL(raw string) bool {
	u, e := url.ParseRequestURI(strings.TrimSpace(raw))
	return e == nil && u.Scheme == "https" && u.Host != ""
}
func (h handler) createBanner(w http.ResponseWriter, r *http.Request) {
	var x bannerInput
	if !httpx.Decode(w, r, &x) {
		return
	}
	x.Title = strings.TrimSpace(x.Title)
	x.Position = strings.ToUpper(strings.TrimSpace(x.Position))
	a, e1 := time.Parse(time.RFC3339, x.StartAt)
	b, e2 := time.Parse(time.RFC3339, x.EndAt)
	if len(x.Title) < 2 || len(x.Title) > 160 || !safeURL(x.ImageURL) || (x.TargetURL != "" && !safeURL(x.TargetURL)) || !oneOf(x.Position, "HOME_HERO", "HOME_MIDDLE", "SHOP") || e1 != nil || e2 != nil || !b.After(a) || x.SortOrder < 0 || x.SortOrder > 10000 {
		h.fail(w, 400, "invalid_banner", "Banner fields are invalid")
		return
	}
	uid, _ := h.actor(r)
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	res, e := tx.ExecContext(r.Context(), `INSERT INTO promotion_banners(title,image_url,target_url,position,start_at,end_at,sort_order,is_active,created_by) VALUES(?,?,?,?,?,?,?,1,?)`, x.Title, x.ImageURL, nullString(x.TargetURL), x.Position, a.UTC(), b.UTC(), x.SortOrder, uid)
	if e != nil {
		h.internal(w, e)
		return
	}
	id, _ := res.LastInsertId()
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "BANNER_CREATED", "PROMOTION_BANNER", id, nil, x); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 201, map[string]any{"id": id, "is_active": true})
}
func oneOf(x string, allowed ...string) bool {
	for _, a := range allowed {
		if x == a {
			return true
		}
	}
	return false
}
func (h handler) updateBanner(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r)
	if !ok {
		h.fail(w, 400, "invalid_id", "ID must be positive")
		return
	}
	var x bannerInput
	if !httpx.Decode(w, r, &x) {
		return
	}
	x.Title = strings.TrimSpace(x.Title)
	x.Position = strings.ToUpper(strings.TrimSpace(x.Position))
	a, e1 := time.Parse(time.RFC3339, x.StartAt)
	b, e2 := time.Parse(time.RFC3339, x.EndAt)
	if len(x.Title) < 2 || len(x.Title) > 160 || !safeURL(x.ImageURL) || (x.TargetURL != "" && !safeURL(x.TargetURL)) || !oneOf(x.Position, "HOME_HERO", "HOME_MIDDLE", "SHOP") || e1 != nil || e2 != nil || !b.After(a) || x.SortOrder < 0 || x.SortOrder > 10000 {
		h.fail(w, 400, "invalid_banner", "Banner fields are invalid")
		return
	}
	uid, _ := h.actor(r)
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var old map[string]any = map[string]any{}
	var oldTitle, oldImage, oldPosition string
	var oldTarget sql.NullString
	var oldStart, oldEnd time.Time
	var oldSort int
	e = tx.QueryRowContext(r.Context(), `SELECT title,image_url,target_url,position,start_at,end_at,sort_order FROM promotion_banners WHERE id=? FOR UPDATE`, id).Scan(&oldTitle, &oldImage, &oldTarget, &oldPosition, &oldStart, &oldEnd, &oldSort)
	if errors.Is(e, sql.ErrNoRows) {
		h.fail(w, 404, "banner_not_found", "Banner not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	old = map[string]any{"title": oldTitle, "image_url": oldImage, "target_url": oldTarget, "position": oldPosition, "start_at": oldStart, "end_at": oldEnd, "sort_order": oldSort}
	_, e = tx.ExecContext(r.Context(), `UPDATE promotion_banners SET title=?,image_url=?,target_url=?,position=?,start_at=?,end_at=?,sort_order=? WHERE id=?`, x.Title, x.ImageURL, nullString(x.TargetURL), x.Position, a.UTC(), b.UTC(), x.SortOrder, id)
	if e != nil {
		h.internal(w, e)
		return
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "BANNER_UPDATED", "PROMOTION_BANNER", id, old, x); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, map[string]any{"id": id, "updated": true})
}
func (h handler) bannerStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r)
	if !ok {
		h.fail(w, 400, "invalid_id", "ID must be positive")
		return
	}
	h.setActive(w, r, "promotion_banners", "PROMOTION_BANNER", id)
}
func (h handler) setActive(w http.ResponseWriter, r *http.Request, table, entity string, id int64) {
	uid, _ := h.actor(r)
	var req struct {
		Active *bool `json:"is_active"`
	}
	if !httpx.Decode(w, r, &req) {
		return
	}
	if req.Active == nil {
		h.fail(w, 400, "invalid_status", "is_active is required")
		return
	}
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var old bool
	e = tx.QueryRowContext(r.Context(), `SELECT is_active FROM `+table+` WHERE id=? FOR UPDATE`, id).Scan(&old)
	if errors.Is(e, sql.ErrNoRows) {
		h.fail(w, 404, "not_found", "Record not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	_, e = tx.ExecContext(r.Context(), `UPDATE `+table+` SET is_active=? WHERE id=?`, *req.Active, id)
	if e != nil {
		h.internal(w, e)
		return
	}
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "PROMOTION_STATUS_CHANGED", entity, id, map[string]any{"is_active": old}, map[string]any{"is_active": *req.Active}); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, map[string]any{"id": id, "is_active": *req.Active})
}
func (h handler) publicBanners(w http.ResponseWriter, r *http.Request) {
	rows, e := h.db.QueryContext(r.Context(), `SELECT id,title,image_url,target_url,position,start_at,end_at,sort_order,is_active FROM promotion_banners WHERE is_active=1 AND start_at<=UTC_TIMESTAMP() AND end_at>UTC_TIMESTAMP() ORDER BY sort_order,id LIMIT 30`)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	h.writeBanners(w, rows)
}
func (h handler) adminBanners(w http.ResponseWriter, r *http.Request) {
	rows, e := h.db.QueryContext(r.Context(), `SELECT id,title,image_url,target_url,position,start_at,end_at,sort_order,is_active FROM promotion_banners ORDER BY created_at DESC LIMIT 200`)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	h.writeBanners(w, rows)
}
func (h handler) writeBanners(w http.ResponseWriter, rows *sql.Rows) {
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var title, image, pos string
		var target sql.NullString
		var a, b time.Time
		var sort int
		var active bool
		if e := rows.Scan(&id, &title, &image, &target, &pos, &a, &b, &sort, &active); e != nil {
			h.internal(w, e)
			return
		}
		out = append(out, map[string]any{"id": id, "title": title, "image_url": image, "target_url": target, "position": pos, "start_at": a, "end_at": b, "sort_order": sort, "is_active": active})
	}
	if e := rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, out)
}

type flashInput struct {
	ProductID     int64   `json:"product_id"`
	SalePrice     float64 `json:"sale_price"`
	StartAt       string  `json:"start_at"`
	EndAt         string  `json:"end_at"`
	QuantityLimit int     `json:"quantity_limit"`
}

func (h handler) createFlashSale(w http.ResponseWriter, r *http.Request) {
	var x flashInput
	if !httpx.Decode(w, r, &x) {
		return
	}
	a, e1 := time.Parse(time.RFC3339, x.StartAt)
	b, e2 := time.Parse(time.RFC3339, x.EndAt)
	if x.ProductID < 1 || x.SalePrice <= 0 || x.QuantityLimit < 1 || x.QuantityLimit > 1000000 || e1 != nil || e2 != nil || !b.After(a) {
		h.fail(w, 400, "invalid_flash_sale", "Flash sale fields are invalid")
		return
	}
	uid, _ := h.actor(r)
	tx, e := h.db.BeginTx(r.Context(), nil)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer tx.Rollback()
	var minPrice sql.NullFloat64
	var status string
	e = tx.QueryRowContext(r.Context(), `SELECT p.status,(SELECT MIN(v.price) FROM product_variants v WHERE v.product_id=p.id AND v.status='ACTIVE') FROM products p JOIN shops s ON s.id=p.shop_id WHERE p.id=? AND p.is_deleted=0 AND s.status='ACTIVE' FOR UPDATE`, x.ProductID).Scan(&status, &minPrice)
	if errors.Is(e, sql.ErrNoRows) {
		h.fail(w, 404, "product_not_found", "Product not found")
		return
	}
	if e != nil {
		h.internal(w, e)
		return
	}
	if status != "ACTIVE" || !minPrice.Valid || x.SalePrice >= minPrice.Float64 {
		h.fail(w, 422, "invalid_sale_price", "Sale price must be below every active variant price of an active product")
		return
	}
	var overlap int
	if e = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM flash_sales WHERE product_id=? AND is_active=1 AND start_at<? AND end_at>?`, x.ProductID, b.UTC(), a.UTC()).Scan(&overlap); e != nil {
		h.internal(w, e)
		return
	}
	if overlap > 0 {
		h.fail(w, 409, "flash_sale_overlap", "This product already has an overlapping active flash sale")
		return
	}
	res, e := tx.ExecContext(r.Context(), `INSERT INTO flash_sales(product_id,sale_price,quantity_limit,quantity_sold,start_at,end_at,is_active,created_by) VALUES(?,?,?,0,?,?,1,?)`, x.ProductID, x.SalePrice, x.QuantityLimit, a.UTC(), b.UTC(), uid)
	if e != nil {
		h.internal(w, e)
		return
	}
	id, _ := res.LastInsertId()
	if e = auditlog.Record(r.Context(), tx, strconv.FormatInt(uid, 10), "FLASH_SALE_CREATED", "FLASH_SALE", id, nil, x); e != nil {
		h.internal(w, e)
		return
	}
	if e = tx.Commit(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 201, map[string]any{"id": id, "product_id": x.ProductID, "is_active": true})
}
func (h handler) flashSales(w http.ResponseWriter, r *http.Request) {
	rows, e := h.db.QueryContext(r.Context(), `SELECT id,product_id,sale_price,quantity_limit,quantity_sold,start_at,end_at,is_active FROM flash_sales ORDER BY created_at DESC LIMIT 200`)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, pid int64
		var price float64
		var limit, sold int
		var a, b time.Time
		var active bool
		if e = rows.Scan(&id, &pid, &price, &limit, &sold, &a, &b, &active); e != nil {
			h.internal(w, e)
			return
		}
		out = append(out, map[string]any{"id": id, "product_id": pid, "sale_price": price, "quantity_limit": limit, "quantity_sold": sold, "start_at": a, "end_at": b, "is_active": active})
	}
	if e = rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, out)
}
func (h handler) publicFlashSales(w http.ResponseWriter, r *http.Request) {
	rows, e := h.db.QueryContext(r.Context(), `SELECT fs.id,fs.product_id,fs.sale_price,fs.quantity_limit,fs.quantity_sold,fs.start_at,fs.end_at FROM flash_sales fs JOIN products p ON p.id=fs.product_id JOIN shops s ON s.id=p.shop_id WHERE fs.is_active=1 AND fs.start_at<=UTC_TIMESTAMP() AND fs.end_at>UTC_TIMESTAMP() AND fs.quantity_sold<fs.quantity_limit AND p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' ORDER BY fs.end_at,fs.id LIMIT 100`)
	if e != nil {
		h.internal(w, e)
		return
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id, pid int64
		var price float64
		var limit, sold int
		var start, end time.Time
		if e = rows.Scan(&id, &pid, &price, &limit, &sold, &start, &end); e != nil {
			h.internal(w, e)
			return
		}
		out = append(out, map[string]any{"id": id, "product_id": pid, "sale_price": price, "quantity_limit": limit, "quantity_sold": sold, "remaining": limit - sold, "start_at": start, "end_at": end})
	}
	if e = rows.Err(); e != nil {
		h.internal(w, e)
		return
	}
	h.ok(w, 200, out)
}
func (h handler) flashSaleStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r)
	if !ok {
		h.fail(w, 400, "invalid_id", "ID must be positive")
		return
	}
	h.setActive(w, r, "flash_sales", "FLASH_SALE", id)
}
