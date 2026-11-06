package checkout

import (
	"database/sql"
	"errors"
	"log"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/httpx"
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

const maxAmountCents int64 = 999_999_999_999_999 // DECIMAL(15,2) maximum used by order totals.
type method struct {
	ID            int64   `json:"id"`
	Code          string  `json:"code"`
	Name          string  `json:"name"`
	Fee           float64 `json:"base_fee,omitempty"`
	EstimatedDays *string `json:"estimated_days,omitempty"`
}
type quoteRequest struct {
	AddressID        int64             `json:"address_id"`
	ShippingMethodID int64             `json:"shipping_method_id"`
	PaymentMethodID  int64             `json:"payment_method_id"`
	CartItemIDs      []int64           `json:"cart_item_ids"`
	PlatformVoucher  string            `json:"platform_voucher,omitempty"`
	ShopVouchers     map[string]string `json:"shop_vouchers,omitempty"`
}
type voucherRequest struct {
	Code        string  `json:"code"`
	Scope       string  `json:"scope"`
	ShopID      int64   `json:"shop_id,omitempty"`
	CartItemIDs []int64 `json:"cart_item_ids"`
}
type quoteLine struct {
	CartItemID  int64   `json:"cart_item_id"`
	ShopID      int64   `json:"shop_id"`
	ShopName    string  `json:"shop_name"`
	ProductName string  `json:"product_name"`
	VariantID   int64   `json:"variant_id"`
	Quantity    int64   `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	LineTotal   float64 `json:"line_total"`
}
type voucherResult struct {
	ID       int64   `json:"id"`
	Code     string  `json:"code"`
	Title    string  `json:"title"`
	Discount float64 `json:"discount_amount"`
	Scope    string  `json:"scope"`
	ShopID   *int64  `json:"shop_id,omitempty"`
}

func (h *Handler) options(w http.ResponseWriter, r *http.Request) {
	shipping, err := h.db.QueryContext(r.Context(), `SELECT id,code,name,base_fee,estimated_days FROM shipping_methods WHERE is_active=1 ORDER BY base_fee,id`)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer shipping.Close()
	ships := make([]method, 0)
	for shipping.Next() {
		var m method
		if err = shipping.Scan(&m.ID, &m.Code, &m.Name, &m.Fee, &m.EstimatedDays); err != nil {
			h.serverError(w, err)
			return
		}
		ships = append(ships, m)
	}
	if err = shipping.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	if err = shipping.Close(); err != nil {
		h.serverError(w, err)
		return
	}
	payments, err := h.db.QueryContext(r.Context(), `SELECT id,code,name FROM payment_methods WHERE is_active=1 AND code<>'MOCK_CARD' ORDER BY sort_order,id`)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer payments.Close()
	pays := make([]method, 0)
	for payments.Next() {
		var m method
		if err = payments.Scan(&m.ID, &m.Code, &m.Name); err != nil {
			h.serverError(w, err)
			return
		}
		pays = append(pays, m)
	}
	if err = payments.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"shipping_methods": ships, "payment_methods": pays}})
}

func (h *Handler) quote(w http.ResponseWriter, r *http.Request) {
	var req quoteRequest
	if !httpx.Decode(w, r, &req) {
		return
	}
	uid, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, 401, "unauthorized", "Authenticated user is invalid")
		return
	}
	if req.AddressID < 1 || req.ShippingMethodID < 1 || req.PaymentMethodID < 1 || len(req.CartItemIDs) == 0 || len(req.CartItemIDs) > 100 {
		writeError(w, 400, "invalid_quote_request", "address, shipping method, payment method and 1 to 100 cart item IDs are required")
		return
	}
	seen := map[int64]bool{}
	for _, id := range req.CartItemIDs {
		if id < 1 || seen[id] {
			writeError(w, 400, "invalid_cart_item_ids", "Cart item IDs must be positive and unique")
			return
		}
		seen[id] = true
	}
	var recipient, phone, province, district, ward, street string
	err = h.db.QueryRowContext(r.Context(), `SELECT recipient_name,phone,province,district,ward,street_detail FROM addresses WHERE id=? AND user_id=?`, req.AddressID, uid).Scan(&recipient, &phone, &province, &district, &ward, &street)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, 422, "address_unavailable", "Choose an address that belongs to your account")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	var ship method
	err = h.db.QueryRowContext(r.Context(), `SELECT id,code,name,base_fee,estimated_days FROM shipping_methods WHERE id=? AND is_active=1`, req.ShippingMethodID).Scan(&ship.ID, &ship.Code, &ship.Name, &ship.Fee, &ship.EstimatedDays)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, 422, "shipping_method_unavailable", "Selected shipping method is unavailable")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	var pay method
	err = h.db.QueryRowContext(r.Context(), `SELECT id,code,name FROM payment_methods WHERE id=? AND is_active=1 AND code<>'MOCK_CARD'`, req.PaymentMethodID).Scan(&pay.ID, &pay.Code, &pay.Name)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, 422, "payment_method_unavailable", "Selected payment method is unavailable")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	placeholders := strings.TrimRight(strings.Repeat("?,", len(req.CartItemIDs)), ",")
	args := []any{uid}
	for _, id := range req.CartItemIDs {
		args = append(args, id)
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT ci.id,p.id,p.name,v.id,s.id,s.name,ci.quantity,v.price,v.stock,
		(p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1 AND v.status='ACTIVE')
		FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id JOIN product_variants v ON v.id=ci.variant_id
		JOIN products p ON p.id=v.product_id JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id
		WHERE ca.user_id=? AND ci.id IN (`+placeholders+`) ORDER BY ci.id`, args...)
	if err != nil {
		h.serverError(w, err)
		return
	}
	lines := make([]quoteLine, 0, len(req.CartItemIDs))
	shops := map[int64]int64{}
	var subtotal int64
	for rows.Next() {
		var line quoteLine
		var productID int64
		var price float64
		var stock int64
		var purchasable bool
		if err = rows.Scan(&line.CartItemID, &productID, &line.ProductName, &line.VariantID, &line.ShopID, &line.ShopName, &line.Quantity, &price, &stock, &purchasable); err != nil {
			rows.Close()
			h.serverError(w, err)
			return
		}
		if !purchasable || stock < line.Quantity {
			rows.Close()
			writeError(w, 422, "cart_item_unavailable", "One or more selected products are unavailable or have insufficient stock")
			return
		}
		line.UnitPrice = roundMoney(price)
		lineCents, ok := lineAmountCents(price, line.Quantity)
		if !ok || subtotal > maxAmountCents-lineCents {
			rows.Close()
			writeError(w, 422, "cart_total_exceeded", "Selected cart total exceeds the supported order amount")
			return
		}
		line.LineTotal = float64(lineCents) / 100
		subtotal += lineCents
		shops[line.ShopID] += lineCents
		lines = append(lines, line)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		h.serverError(w, err)
		return
	}
	rows.Close()
	if len(lines) != len(req.CartItemIDs) {
		writeError(w, 422, "cart_selection_changed", "Some selected cart items no longer belong to your cart")
		return
	}
	shopVouchers := make([]voucherResult, 0, len(req.ShopVouchers))
	var shopDiscount int64
	if len(req.ShopVouchers) > len(shops) {
		writeError(w, 422, "voucher_shop_mismatch", "A shop voucher does not match the selected cart")
		return
	}
	shopVoucherShopIDs := make([]string, 0, len(req.ShopVouchers))
	for rawID := range req.ShopVouchers {
		shopVoucherShopIDs = append(shopVoucherShopIDs, rawID)
	}
	sort.Strings(shopVoucherShopIDs)
	for _, rawID := range shopVoucherShopIDs {
		code := req.ShopVouchers[rawID]
		shopID, parseErr := strconv.ParseInt(rawID, 10, 64)
		if parseErr != nil || shops[shopID] == 0 {
			writeError(w, 422, "voucher_shop_mismatch", "A shop voucher does not match the selected cart")
			return
		}
		v, d, ve := h.validateVoucher(r, uid, strings.TrimSpace(code), "SHOP", &shopID, shops[shopID])
		if ve != "" {
			if ve == "internal_error" {
				writeError(w, http.StatusInternalServerError, ve, "Internal server error")
				return
			}
			writeError(w, 422, ve, "A shop voucher is invalid, expired, exhausted, or does not meet its minimum order")
			return
		}
		shopDiscount += d
		v.Discount = float64(d) / 100
		shopVouchers = append(shopVouchers, v)
	}
	var platform *voucherResult
	var platformDiscount int64
	if strings.TrimSpace(req.PlatformVoucher) != "" {
		v, d, ve := h.validateVoucher(r, uid, strings.TrimSpace(req.PlatformVoucher), "PLATFORM", nil, subtotal)
		if ve != "" {
			if ve == "internal_error" {
				writeError(w, http.StatusInternalServerError, ve, "Internal server error")
				return
			}
			writeError(w, 422, ve, "Platform voucher is invalid, expired, exhausted, or does not meet its minimum order")
			return
		}
		platform = &v
		platformDiscount = d
		if remaining := subtotal - shopDiscount; platformDiscount > remaining {
			platformDiscount = remaining
		}
		if platformDiscount < 0 {
			platformDiscount = 0
		}
		v.Discount = float64(platformDiscount) / 100
		platform = &v
	}
	shippingCents := int64(math.Round(ship.Fee * 100)) // base_fee is charged once for the entire multi-shop cart.
	if shippingCents < 0 || subtotal > maxAmountCents-shippingCents {
		writeError(w, 422, "cart_total_exceeded", "Selected cart total exceeds the supported order amount")
		return
	}
	discounts := shopDiscount + platformDiscount
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]any{"address": map[string]string{"recipient_name": recipient, "phone": phone, "formatted": strings.Join([]string{street, ward, district, province}, ", ")}, "shipping_method": ship, "payment_method": pay, "items": lines, "subtotal": float64(subtotal) / 100, "shipping_fee": float64(shippingCents) / 100, "shop_vouchers": shopVouchers, "shop_discount": float64(shopDiscount) / 100, "platform_voucher": platform, "platform_discount": float64(platformDiscount) / 100, "total": float64(subtotal+shippingCents-discounts) / 100}})
}

func (h *Handler) validateVoucherRequest(w http.ResponseWriter, r *http.Request) {
	var req voucherRequest
	if !httpx.Decode(w, r, &req) {
		return
	}
	uid, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, 401, "unauthorized", "Authenticated user is invalid")
		return
	}
	req.Code = strings.TrimSpace(req.Code)
	req.Scope = strings.ToUpper(strings.TrimSpace(req.Scope))
	if req.Code == "" || (req.Scope != "PLATFORM" && req.Scope != "SHOP") || (req.Scope == "SHOP" && req.ShopID < 1) || len(req.CartItemIDs) == 0 || len(req.CartItemIDs) > 100 {
		writeError(w, 400, "invalid_voucher_request", "code, scope, cart item IDs and a shop ID for shop vouchers are required")
		return
	}
	ids := map[int64]bool{}
	args := []any{uid}
	for _, id := range req.CartItemIDs {
		if id < 1 || ids[id] {
			writeError(w, 400, "invalid_cart_item_ids", "Cart item IDs must be positive and unique")
			return
		}
		ids[id] = true
		args = append(args, id)
	}
	ph := strings.TrimRight(strings.Repeat("?,", len(req.CartItemIDs)), ",")
	rows, err := h.db.QueryContext(r.Context(), `SELECT s.id,ci.quantity,v.price,v.stock,(p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1 AND v.status='ACTIVE') FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id JOIN product_variants v ON v.id=ci.variant_id JOIN products p ON p.id=v.product_id JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id WHERE ca.user_id=? AND ci.id IN (`+ph+`)`, args...)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer rows.Close()
	var basis int64
	found := 0
	shopBasis := int64(0)
	for rows.Next() {
		var shopID, qty, stock int64
		var price float64
		var active bool
		if err = rows.Scan(&shopID, &qty, &price, &stock, &active); err != nil {
			h.serverError(w, err)
			return
		}
		if !active || qty > stock {
			writeError(w, 422, "cart_item_unavailable", "One or more selected products are unavailable or have insufficient stock")
			return
		}
		cents, ok := lineAmountCents(price, qty)
		if !ok || basis > maxAmountCents-cents {
			writeError(w, 422, "cart_total_exceeded", "Selected cart total exceeds the supported order amount")
			return
		}
		basis += cents
		if req.ShopID == shopID {
			shopBasis += cents
		}
		found++
	}
	if err = rows.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	if err = rows.Close(); err != nil {
		h.serverError(w, err)
		return
	}
	if found != len(req.CartItemIDs) {
		writeError(w, 422, "cart_selection_changed", "Some selected cart items no longer belong to your cart")
		return
	}
	var scopeShop *int64
	calcBasis := basis
	if req.Scope == "SHOP" {
		scopeShop = &req.ShopID
		calcBasis = shopBasis
		if shopBasis == 0 {
			writeError(w, 422, "voucher_shop_mismatch", "Voucher shop has no selected items")
			return
		}
	}
	v, discount, code := h.validateVoucher(r, uid, req.Code, req.Scope, scopeShop, calcBasis)
	if code != "" {
		if code == "internal_error" {
			writeError(w, 500, code, "Internal server error")
			return
		}
		writeError(w, 422, code, "Voucher is invalid, expired, exhausted, or does not meet its minimum order")
		return
	}
	var minimum float64
	if err = h.db.QueryRowContext(r.Context(), `SELECT min_order_value FROM vouchers WHERE id=?`, v.ID).Scan(&minimum); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{"success": true, "data": map[string]any{"id": v.ID, "code": v.Code, "title": v.Title, "scope": v.Scope, "shop_id": v.ShopID, "discount_amount": float64(discount) / 100, "min_order_amount": minimum, "is_applied": true}})
}

func (h *Handler) validateVoucher(r *http.Request, uid int64, code, scope string, shopID *int64, basis int64) (voucherResult, int64, string) {
	var v voucherResult
	var typ string
	var value, max, min float64
	var maxValid bool
	var limit sql.NullInt64
	var perUser uint32
	var used uint64
	var start, end string
	var active bool
	query := `SELECT id,code,title,scope,shop_id,discount_type,discount_value,max_discount_amount IS NOT NULL,COALESCE(max_discount_amount,0),min_order_value,usage_limit,usage_per_user,used_count,DATE_FORMAT(start_at,'%Y-%m-%d %H:%i:%s'),DATE_FORMAT(end_at,'%Y-%m-%d %H:%i:%s'),is_active FROM vouchers WHERE code=?`
	err := h.db.QueryRowContext(r.Context(), query, strings.ToUpper(code)).Scan(&v.ID, &v.Code, &v.Title, &v.Scope, &v.ShopID, &typ, &value, &maxValid, &max, &min, &limit, &perUser, &used, &start, &end, &active)
	if errors.Is(err, sql.ErrNoRows) {
		return v, 0, "voucher_invalid"
	}
	if err != nil {
		h.logger.Printf("checkout voucher lookup failed: %v", err)
		return v, 0, "internal_error"
	}
	if v.Scope != scope || (scope == "SHOP" && (v.ShopID == nil || shopID == nil || *v.ShopID != *shopID)) || !active {
		return v, 0, "voucher_invalid"
	}
	if min < 0 || perUser == 0 {
		return v, 0, "voucher_invalid"
	}
	var userUses int
	if err = h.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM voucher_usages WHERE voucher_id=? AND user_id=?`, v.ID, uid).Scan(&userUses); err != nil {
		h.logger.Printf("checkout voucher usage lookup failed: %v", err)
		return v, 0, "internal_error"
	}
	var now string
	if err = h.db.QueryRowContext(r.Context(), `SELECT DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-%d %H:%i:%s')`).Scan(&now); err != nil {
		h.logger.Printf("checkout clock lookup failed: %v", err)
		return v, 0, "internal_error"
	}
	if now < start || now >= end || (limit.Valid && uint64(limit.Int64) <= used) || uint64(userUses) >= uint64(perUser) {
		return v, 0, "voucher_unavailable"
	}
	if float64(basis)/100 < min {
		return v, 0, "voucher_minimum_not_met"
	}
	discount, ok := calculateDiscount(typ, value, max, maxValid, basis)
	if !ok {
		return v, 0, "voucher_invalid"
	}
	return v, discount, ""
}

func calculateDiscount(typ string, value, max float64, maxValid bool, basis int64) (int64, bool) {
	if basis < 0 || value <= 0 || basis > maxAmountCents {
		return 0, false
	}
	discount := int64(math.Round(value * 100))
	switch typ {
	case "PERCENT":
		if value > 100 || (maxValid && max <= 0) {
			return 0, false
		}
		discount = int64(math.Round(float64(basis) * value / 100))
		if maxValid && discount > int64(math.Round(max*100)) {
			discount = int64(math.Round(max * 100))
		}
	case "FIXED":
	default:
		return 0, false
	}
	if discount > basis {
		discount = basis
	}
	return discount, true
}

func lineAmountCents(price float64, quantity int64) (int64, bool) {
	if price <= 0 || quantity <= 0 || math.IsNaN(price) || math.IsInf(price, 0) {
		return 0, false
	}
	cents := math.Round(price * float64(quantity) * 100)
	if math.IsInf(cents, 0) || cents < 1 || cents > float64(maxAmountCents) {
		return 0, false
	}
	return int64(cents), true
}

func roundMoney(v float64) float64 { return math.Round(v*100) / 100 }
func (h *Handler) serverError(w http.ResponseWriter, err error) {
	if h.logger != nil {
		h.logger.Printf("checkout request failed: %v", err)
	}
	writeError(w, 500, "internal_error", "Internal server error")
}
func writeJSON(w http.ResponseWriter, status int, v any) { httpx.WriteJSON(w, status, v) }
func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}
