package checkout

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/httpx"
)

type createOrderRequest struct {
	AddressID        int64             `json:"address_id"`
	ShippingMethodID int64             `json:"shipping_method_id"`
	PaymentMethodID  int64             `json:"payment_method_id"`
	CartItemIDs      []int64           `json:"cart_item_ids"`
	PlatformVoucher  string            `json:"platform_voucher,omitempty"`
	ShopVouchers     map[string]string `json:"shop_vouchers,omitempty"`
	Note             string            `json:"note,omitempty"`
}

type itemDetails struct {
	CartItemID  int64
	ProductID   int64
	VariantID   int64
	ProductName string
	VariantName sql.NullString
	SKU         string
	ImageURL    sql.NullString
	UnitPrice   float64
	Quantity    int64
	LineCents   int64
	ShopID      int64
	ShopName    string
}

type shopOrderPlan struct {
	ShopID                int64
	ShopName              string
	SubtotalCents         int64
	ShippingCents         int64
	ShopVoucherID         *int64
	ShopDiscountCents     int64
	PlatformDiscountCents int64
	TotalCents            int64
	Items                 []itemDetails
}

func (h *Handler) createOrder(w http.ResponseWriter, r *http.Request) {
	var req createOrderRequest
	if !httpx.Decode(w, r, &req) {
		return
	}

	uid, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || uid < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}

	req.Note = strings.TrimSpace(req.Note)
	if len(req.Note) > 500 {
		writeError(w, http.StatusBadRequest, "invalid_note", "Note must not exceed 500 characters")
		return
	}

	if req.AddressID < 1 || req.ShippingMethodID < 1 || req.PaymentMethodID < 1 || len(req.CartItemIDs) == 0 || len(req.CartItemIDs) > 100 {
		writeError(w, http.StatusBadRequest, "invalid_order_request", "address, shipping method, payment method and 1 to 100 cart item IDs are required")
		return
	}

	seenItems := make(map[int64]bool, len(req.CartItemIDs))
	for _, id := range req.CartItemIDs {
		if id < 1 || seenItems[id] {
			writeError(w, http.StatusBadRequest, "invalid_cart_item_ids", "Cart item IDs must be positive and unique")
			return
		}
		seenItems[id] = true
	}

	if len(req.ShopVouchers) > 100 {
		writeError(w, http.StatusBadRequest, "invalid_shop_vouchers", "Too many shop vouchers provided")
		return
	}

	// 1. Validate shipping address belonging to current user
	var recipient, phone, province, district, ward, street string
	err = h.db.QueryRowContext(r.Context(),
		`SELECT recipient_name, phone, province, district, ward, street_detail FROM addresses WHERE id=? AND user_id=?`,
		req.AddressID, uid,
	).Scan(&recipient, &phone, &province, &district, &ward, &street)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusUnprocessableEntity, "address_unavailable", "Choose an address that belongs to your account")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	formattedAddress := strings.Join([]string{street, ward, district, province}, ", ")

	// 2. Validate shipping method
	var ship method
	err = h.db.QueryRowContext(r.Context(),
		`SELECT id, code, name, base_fee, estimated_days FROM shipping_methods WHERE id=? AND is_active=1`,
		req.ShippingMethodID,
	).Scan(&ship.ID, &ship.Code, &ship.Name, &ship.Fee, &ship.EstimatedDays)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusUnprocessableEntity, "shipping_method_unavailable", "Selected shipping method is unavailable")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}

	// 3. Validate payment method (COD or BANK_TRANSFER, exclude MOCK_CARD)
	var pay method
	err = h.db.QueryRowContext(r.Context(),
		`SELECT id, code, name FROM payment_methods WHERE id=? AND is_active=1 AND code<>'MOCK_CARD'`,
		req.PaymentMethodID,
	).Scan(&pay.ID, &pay.Code, &pay.Name)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusUnprocessableEntity, "payment_method_unavailable", "Selected payment method is unavailable")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}

	// 4. Begin single database transaction for the entire order workflow
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()

	// 5. Query and verify cart items owned by this user
	cartPlaceholders := strings.TrimRight(strings.Repeat("?,", len(req.CartItemIDs)), ",")
	cartArgs := make([]any, 0, len(req.CartItemIDs)+1)
	cartArgs = append(cartArgs, uid)
	for _, id := range req.CartItemIDs {
		cartArgs = append(cartArgs, id)
	}

	cartRows, err := tx.QueryContext(r.Context(),
		`SELECT ci.id, ci.variant_id, ci.quantity FROM carts ca JOIN cart_items ci ON ci.cart_id=ca.id WHERE ca.user_id=? AND ci.id IN (`+cartPlaceholders+`)`,
		cartArgs...,
	)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer cartRows.Close()

	type cartItemMeta struct {
		variantID int64
		quantity  int64
	}
	cartItemMap := make(map[int64]cartItemMeta, len(req.CartItemIDs))
	variantIDs := make([]int64, 0, len(req.CartItemIDs))
	for cartRows.Next() {
		var cID, vID, qty int64
		if err = cartRows.Scan(&cID, &vID, &qty); err != nil {
			h.serverError(w, err)
			return
		}
		cartItemMap[cID] = cartItemMeta{variantID: vID, quantity: qty}
		variantIDs = append(variantIDs, vID)
	}
	if err = cartRows.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	cartRows.Close()

	if len(cartItemMap) != len(req.CartItemIDs) {
		writeError(w, http.StatusUnprocessableEntity, "cart_selection_changed", "Some selected cart items no longer belong to your cart")
		return
	}

	// 6. Lock product variants in ascending order to prevent deadlocks and oversell
	sort.Slice(variantIDs, func(i, j int) bool { return variantIDs[i] < variantIDs[j] })
	variantPlaceholders := strings.TrimRight(strings.Repeat("?,", len(variantIDs)), ",")
	varArgs := make([]any, len(variantIDs))
	for i, v := range variantIDs {
		varArgs[i] = v
	}

	variantRows, err := tx.QueryContext(r.Context(),
		`SELECT v.id, v.sku, v.name, v.price, v.stock, v.image_url,
		        p.id, p.name, p.thumbnail_url,
		        s.id, s.name,
		        (p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1 AND v.status='ACTIVE') AS purchasable
		 FROM product_variants v
		 JOIN products p ON p.id=v.product_id
		 JOIN shops s ON s.id=p.shop_id
		 JOIN categories c ON c.id=p.category_id
		 WHERE v.id IN (`+variantPlaceholders+`)
		 ORDER BY v.id ASC
		 FOR UPDATE`,
		varArgs...,
	)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer variantRows.Close()

	type variantSnapshot struct {
		id          int64
		sku         string
		name        sql.NullString
		price       float64
		stock       int64
		imageURL    sql.NullString
		productID   int64
		productName string
		thumbnail   sql.NullString
		shopID      int64
		shopName    string
		purchasable bool
	}
	variantsByID := make(map[int64]variantSnapshot, len(variantIDs))
	for variantRows.Next() {
		var snap variantSnapshot
		if err = variantRows.Scan(
			&snap.id, &snap.sku, &snap.name, &snap.price, &snap.stock, &snap.imageURL,
			&snap.productID, &snap.productName, &snap.thumbnail,
			&snap.shopID, &snap.shopName,
			&snap.purchasable,
		); err != nil {
			h.serverError(w, err)
			return
		}
		variantsByID[snap.id] = snap
	}
	if err = variantRows.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	variantRows.Close()

	// Reserve available flash-sale quantity in the same order transaction. A
	// campaign price is applied consistently to every variant of a product.
	productQuantities := make(map[int64]int64)
	for _, meta := range cartItemMap {
		if snap, ok := variantsByID[meta.variantID]; ok {
			productQuantities[snap.productID] += meta.quantity
		}
	}
	productIDs := make([]int64, 0, len(productQuantities))
	for productID := range productQuantities {
		productIDs = append(productIDs, productID)
	}
	sort.Slice(productIDs, func(i, j int) bool { return productIDs[i] < productIDs[j] })
	for _, productID := range productIDs {
		quantity := productQuantities[productID]
		var saleID int64
		var salePrice float64
		var remaining int64
		saleErr := tx.QueryRowContext(r.Context(), `SELECT id,sale_price,quantity_limit-quantity_sold FROM flash_sales WHERE product_id=? AND is_active=1 AND start_at<=UTC_TIMESTAMP() AND end_at>UTC_TIMESTAMP() AND quantity_sold<quantity_limit ORDER BY sale_price,id LIMIT 1 FOR UPDATE`, productID).Scan(&saleID, &salePrice, &remaining)
		if errors.Is(saleErr, sql.ErrNoRows) {
			continue
		}
		if saleErr != nil {
			h.serverError(w, saleErr)
			return
		}
		if quantity > remaining {
			continue
		}
		if _, saleErr = tx.ExecContext(r.Context(), `UPDATE flash_sales SET quantity_sold=quantity_sold+? WHERE id=? AND quantity_sold+?<=quantity_limit`, quantity, saleID, quantity); saleErr != nil {
			h.serverError(w, saleErr)
			return
		}
		for variantID, snap := range variantsByID {
			if snap.productID == productID {
				snap.price = salePrice
				variantsByID[variantID] = snap
			}
		}
	}

	// 7. Validate availability, calculate line totals, and group items by shop
	shopPlans := make(map[int64]*shopOrderPlan)
	var totalSubtotalCents int64
	orderedItems := make([]itemDetails, 0, len(req.CartItemIDs))

	for _, cartItemID := range req.CartItemIDs {
		meta := cartItemMap[cartItemID]
		snap, found := variantsByID[meta.variantID]
		if !found || !snap.purchasable || snap.stock < meta.quantity {
			writeError(w, http.StatusUnprocessableEntity, "cart_item_unavailable", "One or more selected products are unavailable or have insufficient stock")
			return
		}

		lineCents, ok := lineAmountCents(snap.price, meta.quantity)
		if !ok || totalSubtotalCents > maxAmountCents-lineCents {
			writeError(w, http.StatusUnprocessableEntity, "cart_total_exceeded", "Selected cart total exceeds the supported order amount")
			return
		}
		totalSubtotalCents += lineCents

		// Image resolution: variant image first, fallback to product thumbnail
		finalImage := snap.imageURL
		if (!finalImage.Valid || strings.TrimSpace(finalImage.String) == "") && snap.thumbnail.Valid {
			finalImage = snap.thumbnail
		}

		item := itemDetails{
			CartItemID:  cartItemID,
			ProductID:   snap.productID,
			VariantID:   snap.id,
			ProductName: snap.productName,
			VariantName: snap.name,
			SKU:         snap.sku,
			ImageURL:    finalImage,
			UnitPrice:   roundMoney(snap.price),
			Quantity:    meta.quantity,
			LineCents:   lineCents,
			ShopID:      snap.shopID,
			ShopName:    snap.shopName,
		}
		orderedItems = append(orderedItems, item)

		plan, exists := shopPlans[snap.shopID]
		if !exists {
			plan = &shopOrderPlan{
				ShopID:   snap.shopID,
				ShopName: snap.shopName,
				Items:    make([]itemDetails, 0),
			}
			shopPlans[snap.shopID] = plan
		}
		plan.SubtotalCents += lineCents
		plan.Items = append(plan.Items, item)
	}

	// 8. Deduct stock atomically with strict guard against oversell
	for _, item := range orderedItems {
		res, execErr := tx.ExecContext(r.Context(),
			`UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`,
			item.Quantity, item.VariantID, item.Quantity,
		)
		if execErr != nil {
			h.serverError(w, execErr)
			return
		}
		affected, affErr := res.RowsAffected()
		if affErr != nil || affected == 0 {
			writeError(w, http.StatusUnprocessableEntity, "cart_item_unavailable", "One or more selected products are unavailable or have insufficient stock")
			return
		}

		// Update product sold count
		if _, soldErr := tx.ExecContext(r.Context(),
			`UPDATE products SET sold_count = sold_count + ? WHERE id = ?`,
			item.Quantity, item.ProductID,
		); soldErr != nil {
			h.serverError(w, soldErr)
			return
		}
	}

	// 9. Process shop vouchers within transaction
	if len(req.ShopVouchers) > len(shopPlans) {
		writeError(w, http.StatusUnprocessableEntity, "voucher_shop_mismatch", "A shop voucher does not match the selected cart")
		return
	}

	shopIDs := make([]int64, 0, len(shopPlans))
	for sID := range shopPlans {
		shopIDs = append(shopIDs, sID)
	}
	sort.Slice(shopIDs, func(i, j int) bool { return shopIDs[i] < shopIDs[j] })

	var totalShopDiscountCents int64
	shopVouchersApplied := make(map[int64]voucherResult)

	for _, sID := range shopIDs {
		plan := shopPlans[sID]
		rawShopID := strconv.FormatInt(sID, 10)
		code, hasVoucher := req.ShopVouchers[rawShopID]
		if !hasVoucher || strings.TrimSpace(code) == "" {
			continue
		}
		code = strings.TrimSpace(code)

		vRes, discountCents, vErr := h.validateVoucherTx(r.Context(), tx, uid, code, "SHOP", &sID, plan.SubtotalCents)
		if vErr != "" {
			if vErr == "internal_error" {
				writeError(w, http.StatusInternalServerError, vErr, "Internal server error")
				return
			}
			writeError(w, http.StatusUnprocessableEntity, vErr, "A shop voucher is invalid, expired, exhausted, or does not meet its minimum order")
			return
		}

		// Atomically increment voucher used_count
		res, updErr := tx.ExecContext(r.Context(),
			`UPDATE vouchers SET used_count = used_count + 1 WHERE id = ? AND (usage_limit IS NULL OR used_count < usage_limit)`,
			vRes.ID,
		)
		if updErr != nil {
			h.serverError(w, updErr)
			return
		}
		aff, affErr := res.RowsAffected()
		if affErr != nil || aff == 0 {
			writeError(w, http.StatusUnprocessableEntity, "voucher_unavailable", "Shop voucher usage limit has been reached")
			return
		}

		plan.ShopVoucherID = &vRes.ID
		plan.ShopDiscountCents = discountCents
		totalShopDiscountCents += discountCents
		shopVouchersApplied[sID] = vRes
	}

	// 10. Process platform voucher within transaction
	var platformVoucherID *int64
	var platformDiscountCents int64
	var platformVoucherApplied *voucherResult

	if strings.TrimSpace(req.PlatformVoucher) != "" {
		code := strings.TrimSpace(req.PlatformVoucher)
		vRes, dCents, vErr := h.validateVoucherTx(r.Context(), tx, uid, code, "PLATFORM", nil, totalSubtotalCents)
		if vErr != "" {
			if vErr == "internal_error" {
				writeError(w, http.StatusInternalServerError, vErr, "Internal server error")
				return
			}
			writeError(w, http.StatusUnprocessableEntity, vErr, "Platform voucher is invalid, expired, exhausted, or does not meet its minimum order")
			return
		}

		// Cap platform discount to remaining merchandise subtotal
		if remaining := totalSubtotalCents - totalShopDiscountCents; dCents > remaining {
			dCents = remaining
		}
		if dCents < 0 {
			dCents = 0
		}

		// Increment voucher used_count
		res, updErr := tx.ExecContext(r.Context(),
			`UPDATE vouchers SET used_count = used_count + 1 WHERE id = ? AND (usage_limit IS NULL OR used_count < usage_limit)`,
			vRes.ID,
		)
		if updErr != nil {
			h.serverError(w, updErr)
			return
		}
		aff, affErr := res.RowsAffected()
		if affErr != nil || aff == 0 {
			writeError(w, http.StatusUnprocessableEntity, "voucher_unavailable", "Platform voucher usage limit has been reached")
			return
		}

		platformVoucherID = &vRes.ID
		platformDiscountCents = dCents
		vRes.Discount = float64(dCents) / 100
		platformVoucherApplied = &vRes
	}

	// 11. Calculate shipping fee and distribute discounts across shops
	totalShippingCents := int64(math.Round(ship.Fee * 100))
	if totalShippingCents < 0 || totalSubtotalCents > maxAmountCents-totalShippingCents {
		writeError(w, http.StatusUnprocessableEntity, "cart_total_exceeded", "Selected cart total exceeds the supported order amount")
		return
	}

	totalAmountCents := totalSubtotalCents + totalShippingCents - (totalShopDiscountCents + platformDiscountCents)
	if totalAmountCents < 0 {
		totalAmountCents = 0
	}

	var allocatedShipping int64
	var allocatedPlatformDiscount int64
	for i, sID := range shopIDs {
		plan := shopPlans[sID]
		isLast := i == len(shopIDs)-1

		if isLast {
			plan.ShippingCents = totalShippingCents - allocatedShipping
			plan.PlatformDiscountCents = platformDiscountCents - allocatedPlatformDiscount
		} else {
			plan.ShippingCents = int64(math.Round(float64(totalShippingCents) * float64(plan.SubtotalCents) / float64(totalSubtotalCents)))
			plan.PlatformDiscountCents = int64(math.Round(float64(platformDiscountCents) * float64(plan.SubtotalCents) / float64(totalSubtotalCents)))
			allocatedShipping += plan.ShippingCents
			allocatedPlatformDiscount += plan.PlatformDiscountCents
		}

		// Ensure platform discount on this shop does not exceed shop's remaining balance
		if remainingShop := plan.SubtotalCents - plan.ShopDiscountCents; plan.PlatformDiscountCents > remainingShop {
			plan.PlatformDiscountCents = remainingShop
		}
		if plan.PlatformDiscountCents < 0 {
			plan.PlatformDiscountCents = 0
		}

		plan.TotalCents = plan.SubtotalCents + plan.ShippingCents - plan.ShopDiscountCents - plan.PlatformDiscountCents
		if plan.TotalCents < 0 {
			plan.TotalCents = 0
		}
	}

	// 12. Generate unique order code
	orderCode, codeErr := generateOrderCode()
	if codeErr != nil {
		h.serverError(w, codeErr)
		return
	}

	// 13. Insert parent order into `orders`
	var noteParam *string
	if req.Note != "" {
		noteParam = &req.Note
	}

	orderInsertRes, err := tx.ExecContext(r.Context(),
		`INSERT INTO orders (
			order_code, user_id, recipient_name, recipient_phone, shipping_address,
			payment_method_id, shipping_method_id, platform_voucher_id,
			subtotal, shipping_fee, platform_discount, shop_discount_total, total_amount, note
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		orderCode, uid, recipient, phone, formattedAddress,
		pay.ID, ship.ID, platformVoucherID,
		float64(totalSubtotalCents)/100, float64(totalShippingCents)/100,
		float64(platformDiscountCents)/100, float64(totalShopDiscountCents)/100,
		float64(totalAmountCents)/100, noteParam,
	)
	if err != nil {
		h.serverError(w, err)
		return
	}

	parentOrderID, err := orderInsertRes.LastInsertId()
	if err != nil {
		h.serverError(w, err)
		return
	}

	// 14. Record voucher usages
	if platformVoucherID != nil && platformDiscountCents > 0 {
		if _, err = tx.ExecContext(r.Context(),
			`INSERT INTO voucher_usages (voucher_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)`,
			*platformVoucherID, uid, parentOrderID, float64(platformDiscountCents)/100,
		); err != nil {
			h.serverError(w, err)
			return
		}
	}

	for sID, vRes := range shopVouchersApplied {
		plan := shopPlans[sID]
		if plan.ShopDiscountCents > 0 {
			if _, err = tx.ExecContext(r.Context(),
				`INSERT INTO voucher_usages (voucher_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)`,
				vRes.ID, uid, parentOrderID, float64(plan.ShopDiscountCents)/100,
			); err != nil {
				h.serverError(w, err)
				return
			}
		}
	}

	// 15. Insert shop_orders, order_status_history, and order_items
	type createdShopOrderSummary struct {
		ID               int64   `json:"id"`
		ShopID           int64   `json:"shop_id"`
		ShopName         string  `json:"shop_name"`
		ShopOrderCode    string  `json:"shop_order_code"`
		Status           string  `json:"status"`
		Subtotal         float64 `json:"subtotal"`
		ShippingFee      float64 `json:"shipping_fee"`
		ShopDiscount     float64 `json:"shop_discount"`
		PlatformDiscount float64 `json:"platform_discount"`
		TotalAmount      float64 `json:"total_amount"`
		ItemCount        int     `json:"item_count"`
	}

	createdShopOrders := make([]createdShopOrderSummary, 0, len(shopIDs))

	for _, sID := range shopIDs {
		plan := shopPlans[sID]
		shopOrderCode := generateShopOrderCode(orderCode, sID)

		shopOrderRes, sErr := tx.ExecContext(r.Context(),
			`INSERT INTO shop_orders (
				order_id, shop_id, shop_order_code, status,
				subtotal, shipping_fee, shop_voucher_id, shop_discount,
				platform_discount, total_amount, commission_rate, commission_amount
			) VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, 0, 0)`,
			parentOrderID, plan.ShopID, shopOrderCode,
			float64(plan.SubtotalCents)/100, float64(plan.ShippingCents)/100,
			plan.ShopVoucherID, float64(plan.ShopDiscountCents)/100,
			float64(plan.PlatformDiscountCents)/100, float64(plan.TotalCents)/100,
		)
		if sErr != nil {
			h.serverError(w, sErr)
			return
		}

		shopOrderID, sErr := shopOrderRes.LastInsertId()
		if sErr != nil {
			h.serverError(w, sErr)
			return
		}

		// Initial status history log
		if _, hErr := tx.ExecContext(r.Context(),
			`INSERT INTO order_status_history (shop_order_id, from_status, to_status, changed_by, note) VALUES (?, NULL, 'PENDING', ?, 'Đơn hàng được khởi tạo thành công')`,
			shopOrderID, uid,
		); hErr != nil {
			h.serverError(w, hErr)
			return
		}

		// Insert order items for this shop
		for _, item := range plan.Items {
			var varName *string
			if item.VariantName.Valid && strings.TrimSpace(item.VariantName.String) != "" {
				s := item.VariantName.String
				varName = &s
			}
			var imgURL *string
			if item.ImageURL.Valid && strings.TrimSpace(item.ImageURL.String) != "" {
				s := item.ImageURL.String
				imgURL = &s
			}

			if _, itmErr := tx.ExecContext(r.Context(),
				`INSERT INTO order_items (
					shop_order_id, product_id, variant_id, product_name, variant_name,
					sku, image_url, unit_price, quantity, line_total
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				shopOrderID, item.ProductID, item.VariantID, item.ProductName, varName,
				item.SKU, imgURL, item.UnitPrice, item.Quantity, float64(item.LineCents)/100,
			); itmErr != nil {
				h.serverError(w, itmErr)
				return
			}
		}

		createdShopOrders = append(createdShopOrders, createdShopOrderSummary{
			ID:               shopOrderID,
			ShopID:           plan.ShopID,
			ShopName:         plan.ShopName,
			ShopOrderCode:    shopOrderCode,
			Status:           "PENDING",
			Subtotal:         float64(plan.SubtotalCents) / 100,
			ShippingFee:      float64(plan.ShippingCents) / 100,
			ShopDiscount:     float64(plan.ShopDiscountCents) / 100,
			PlatformDiscount: float64(plan.PlatformDiscountCents) / 100,
			TotalAmount:      float64(plan.TotalCents) / 100,
			ItemCount:        len(plan.Items),
		})
	}

	// 16. Record payment row in `payments`
	var txnRef string
	if pay.Code == "BANK_TRANSFER" {
		txnRef = orderCode // Order code used as payment memo for transfer reconciliation
	} else {
		txnRef = "COD-" + orderCode
	}

	paymentRes, err := tx.ExecContext(r.Context(),
		`INSERT INTO payments (order_id, payment_method_id, amount, status, transaction_ref) VALUES (?, ?, ?, 'PENDING', ?)`,
		parentOrderID, pay.ID, float64(totalAmountCents)/100, txnRef,
	)
	if err != nil {
		h.serverError(w, err)
		return
	}
	paymentID, err := paymentRes.LastInsertId()
	if err != nil {
		h.serverError(w, err)
		return
	}

	// 17. Delete purchased cart items for this user
	if _, err = tx.ExecContext(r.Context(),
		`DELETE ci FROM cart_items ci JOIN carts ca ON ci.cart_id=ca.id WHERE ca.user_id=? AND ci.id IN (`+cartPlaceholders+`)`,
		cartArgs...,
	); err != nil {
		h.serverError(w, err)
		return
	}

	// 18. Commit the entire transaction atomically
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}

	// 19. Build and return structured response
	responseData := map[string]any{
		"order_id":            parentOrderID,
		"order_code":          orderCode,
		"status":              "PENDING",
		"subtotal":            float64(totalSubtotalCents) / 100,
		"shipping_fee":        float64(totalShippingCents) / 100,
		"shop_discount_total": float64(totalShopDiscountCents) / 100,
		"platform_discount":   float64(platformDiscountCents) / 100,
		"total_amount":        float64(totalAmountCents) / 100,
		"recipient_name":      recipient,
		"recipient_phone":     phone,
		"shipping_address":    formattedAddress,
		"note":                req.Note,
		"payment_method": map[string]any{
			"id":   pay.ID,
			"code": pay.Code,
			"name": pay.Name,
		},
		"payment": map[string]any{
			"id":              paymentID,
			"status":          "PENDING",
			"amount":          float64(totalAmountCents) / 100,
			"transaction_ref": txnRef,
		},
		"platform_voucher": platformVoucherApplied,
		"shop_orders":      createdShopOrders,
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"success": true,
		"data":    responseData,
	})
}

func (h *Handler) validateVoucherTx(ctx context.Context, tx *sql.Tx, uid int64, code, scope string, shopID *int64, basis int64) (voucherResult, int64, string) {
	var v voucherResult
	var typ string
	var value, max, min float64
	var maxValid bool
	var limit sql.NullInt64
	var perUser uint32
	var used uint64
	var start, end string
	var active bool

	query := `SELECT id,code,title,scope,shop_id,discount_type,discount_value,max_discount_amount IS NOT NULL,COALESCE(max_discount_amount,0),min_order_value,usage_limit,usage_per_user,used_count,DATE_FORMAT(start_at,'%Y-%m-%d %H:%i:%s'),DATE_FORMAT(end_at,'%Y-%m-%d %H:%i:%s'),is_active FROM vouchers WHERE code=? FOR UPDATE`
	err := tx.QueryRowContext(ctx, query, strings.ToUpper(code)).Scan(&v.ID, &v.Code, &v.Title, &v.Scope, &v.ShopID, &typ, &value, &maxValid, &max, &min, &limit, &perUser, &used, &start, &end, &active)
	if errors.Is(err, sql.ErrNoRows) {
		return v, 0, "voucher_invalid"
	}
	if err != nil {
		h.logger.Printf("checkout order voucher lookup failed: %v", err)
		return v, 0, "internal_error"
	}
	if v.Scope != scope || (scope == "SHOP" && (v.ShopID == nil || shopID == nil || *v.ShopID != *shopID)) || !active {
		return v, 0, "voucher_invalid"
	}
	if min < 0 || perUser == 0 {
		return v, 0, "voucher_invalid"
	}
	var userUses int
	if err = tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM voucher_usages WHERE voucher_id=? AND user_id=?`, v.ID, uid).Scan(&userUses); err != nil {
		h.logger.Printf("checkout order voucher usage lookup failed: %v", err)
		return v, 0, "internal_error"
	}
	var now string
	if err = tx.QueryRowContext(ctx, `SELECT DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-%d %H:%i:%s')`).Scan(&now); err != nil {
		h.logger.Printf("checkout order clock lookup failed: %v", err)
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

func generateOrderCode() (string, error) {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return fmt.Sprintf("ORD%s-%X", time.Now().UTC().Format("060102150405"), b), nil
}

func generateShopOrderCode(orderCode string, shopID int64) string {
	return fmt.Sprintf("%s-S%d", orderCode, shopID)
}
