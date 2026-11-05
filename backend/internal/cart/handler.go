package cart

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"strconv"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/httpx"
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

type itemRequest struct {
	VariantID *int64 `json:"variant_id"`
	Quantity  *int64 `json:"quantity"`
}

type cartItem struct {
	ID               int64   `json:"id"`
	ProductID        int64   `json:"product_id"`
	ProductName      string  `json:"product_name"`
	ProductSlug      string  `json:"product_slug"`
	ProductThumbnail *string `json:"product_thumbnail_url"`
	ShopID           int64   `json:"shop_id"`
	ShopName         string  `json:"shop_name"`
	VariantID        int64   `json:"variant_id"`
	VariantSKU       string  `json:"variant_sku"`
	VariantName      *string `json:"variant_name"`
	UnitPrice        float64 `json:"unit_price"`
	Quantity         int64   `json:"quantity"`
	AvailableStock   int64   `json:"available_stock"`
	IsAvailable      bool    `json:"is_available"`
	LineTotal        float64 `json:"line_total"`
}

type cartResponse struct {
	Items              []cartItem `json:"items"`
	LineCount          int        `json:"line_count"`
	ItemCount          int64      `json:"item_count"`
	AvailableItemCount int64      `json:"available_item_count"`
	Subtotal           float64    `json:"subtotal"`
}

func (h *Handler) getCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	var cartID int64
	err := h.db.QueryRowContext(r.Context(), `SELECT id FROM carts WHERE user_id=?`, userID).Scan(&cartID)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": emptyCart()})
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	result, err := h.loadCart(r, cartID)
	if err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": result})
}

func (h *Handler) addItem(w http.ResponseWriter, r *http.Request) {
	var request itemRequest
	if !decode(w, r, &request) {
		return
	}
	if request.VariantID == nil || *request.VariantID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_variant_id", "variant_id must be a positive integer")
		return
	}
	if request.Quantity == nil || *request.Quantity < 1 {
		writeError(w, http.StatusBadRequest, "invalid_quantity", "quantity must be a positive integer")
		return
	}
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()
	cartID, err := h.lockOrCreateCart(r, tx, userID)
	if err != nil {
		h.serverError(w, err)
		return
	}
	stock, err := lockPurchasableVariant(r, tx, *request.VariantID)
	if err != nil {
		h.writeVariantError(w, err)
		return
	}

	var itemID, currentQuantity int64
	err = tx.QueryRowContext(r.Context(), `SELECT id,quantity FROM cart_items
		WHERE cart_id=? AND variant_id=? FOR UPDATE`, cartID, *request.VariantID).Scan(&itemID, &currentQuantity)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		h.serverError(w, err)
		return
	}
	status := http.StatusOK
	if errors.Is(err, sql.ErrNoRows) {
		if *request.Quantity > stock {
			writeError(w, http.StatusConflict, "insufficient_stock", "Requested quantity exceeds available stock")
			return
		}
		status = http.StatusCreated
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO cart_items(cart_id,variant_id,quantity) VALUES(?,?,?)`,
			cartID, *request.VariantID, *request.Quantity); err != nil {
			h.serverError(w, err)
			return
		}
	} else {
		if currentQuantity > stock-*request.Quantity {
			writeError(w, http.StatusConflict, "insufficient_stock", "Requested quantity exceeds available stock")
			return
		}
		if _, err = tx.ExecContext(r.Context(), `UPDATE cart_items SET quantity=quantity+? WHERE id=? AND cart_id=?`,
			*request.Quantity, itemID, cartID); err != nil {
			h.serverError(w, err)
			return
		}
	}
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}
	h.writeCart(w, r, cartID, status)
}

func (h *Handler) updateItem(w http.ResponseWriter, r *http.Request) {
	itemID, ok := parseItemID(w, r)
	if !ok {
		return
	}
	var request itemRequest
	if !decode(w, r, &request) {
		return
	}
	if request.VariantID != nil {
		writeError(w, http.StatusBadRequest, "unexpected_variant_id", "variant_id cannot be changed when updating a cart item")
		return
	}
	if request.Quantity == nil || *request.Quantity < 1 {
		writeError(w, http.StatusBadRequest, "invalid_quantity", "quantity must be a positive integer")
		return
	}
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()
	cartID, err := h.lockCart(r, tx, userID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "cart_item_not_found", "Cart item was not found")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	var variantID int64
	if err = tx.QueryRowContext(r.Context(), `SELECT variant_id FROM cart_items WHERE id=? AND cart_id=? FOR UPDATE`,
		itemID, cartID).Scan(&variantID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "cart_item_not_found", "Cart item was not found")
			return
		}
		h.serverError(w, err)
		return
	}
	stock, err := lockPurchasableVariant(r, tx, variantID)
	if err != nil {
		h.writeVariantError(w, err)
		return
	}
	if *request.Quantity > stock {
		writeError(w, http.StatusConflict, "insufficient_stock", "Requested quantity exceeds available stock")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE cart_items SET quantity=? WHERE id=? AND cart_id=?`,
		*request.Quantity, itemID, cartID); err != nil {
		h.serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}
	h.writeCart(w, r, cartID, http.StatusOK)
}

func (h *Handler) deleteItem(w http.ResponseWriter, r *http.Request) {
	itemID, ok := parseItemID(w, r)
	if !ok {
		return
	}
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()
	cartID, err := h.lockCart(r, tx, userID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "cart_item_not_found", "Cart item was not found")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	result, err := tx.ExecContext(r.Context(), `DELETE FROM cart_items WHERE id=? AND cart_id=?`, itemID, cartID)
	if err != nil {
		h.serverError(w, err)
		return
	}
	affected, err := result.RowsAffected()
	if err != nil {
		h.serverError(w, err)
		return
	}
	if affected == 0 {
		writeError(w, http.StatusNotFound, "cart_item_not_found", "Cart item was not found")
		return
	}
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}
	h.writeCart(w, r, cartID, http.StatusOK)
}

func (h *Handler) clearCart(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()
	cartID, err := h.lockCart(r, tx, userID)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": emptyCart()})
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `DELETE FROM cart_items WHERE cart_id=?`, cartID); err != nil {
		h.serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": emptyCart()})
}

type purchasableVariantError struct {
	code   string
	status int
}

func (e purchasableVariantError) Error() string { return e.code }

func lockPurchasableVariant(r *http.Request, tx *sql.Tx, variantID int64) (int64, error) {
	var productID int64
	if err := tx.QueryRowContext(r.Context(), `SELECT product_id FROM product_variants WHERE id=?`, variantID).Scan(&productID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, purchasableVariantError{code: "variant_not_found", status: http.StatusNotFound}
		}
		return 0, err
	}
	var productActive bool
	err := tx.QueryRowContext(r.Context(), `SELECT p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1
		FROM products p JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id
		WHERE p.id=? FOR UPDATE`, productID).Scan(&productActive)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, purchasableVariantError{code: "product_unavailable", status: http.StatusConflict}
	}
	if err != nil {
		return 0, err
	}
	if !productActive {
		return 0, purchasableVariantError{code: "product_unavailable", status: http.StatusConflict}
	}
	var stock int64
	var variantActive bool
	err = tx.QueryRowContext(r.Context(), `SELECT stock,status='ACTIVE' FROM product_variants
		WHERE id=? AND product_id=? FOR UPDATE`, variantID, productID).Scan(&stock, &variantActive)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, purchasableVariantError{code: "variant_not_found", status: http.StatusNotFound}
	}
	if err != nil {
		return 0, err
	}
	if !variantActive {
		return 0, purchasableVariantError{code: "variant_unavailable", status: http.StatusConflict}
	}
	if stock < 1 {
		return 0, purchasableVariantError{code: "out_of_stock", status: http.StatusConflict}
	}
	return stock, nil
}

func (h *Handler) writeVariantError(w http.ResponseWriter, err error) {
	var unavailable purchasableVariantError
	if errors.As(err, &unavailable) {
		message := "Product or variant is not available"
		if unavailable.code == "out_of_stock" {
			message = "Variant is out of stock"
		}
		writeError(w, unavailable.status, unavailable.code, message)
		return
	}
	h.serverError(w, err)
}

func (h *Handler) lockOrCreateCart(r *http.Request, tx *sql.Tx, userID int64) (int64, error) {
	if _, err := tx.ExecContext(r.Context(), `INSERT INTO carts(user_id) VALUES(?)
		ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`, userID); err != nil {
		return 0, err
	}
	return h.lockCart(r, tx, userID)
}

func (h *Handler) lockCart(r *http.Request, tx *sql.Tx, userID int64) (int64, error) {
	var cartID int64
	err := tx.QueryRowContext(r.Context(), `SELECT id FROM carts WHERE user_id=? FOR UPDATE`, userID).Scan(&cartID)
	return cartID, err
}

func (h *Handler) loadCart(r *http.Request, cartID int64) (cartResponse, error) {
	rows, err := h.db.QueryContext(r.Context(), `SELECT ci.id,p.id,p.name,p.slug,p.thumbnail_url,s.id,s.name,
		v.id,v.sku,v.name,v.price,ci.quantity,v.stock,
		(p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1
			AND v.status='ACTIVE' AND v.stock>=ci.quantity),
		CAST(v.price*ci.quantity AS DECIMAL(30,2))
		FROM cart_items ci
		JOIN carts ca ON ca.id=ci.cart_id
		JOIN product_variants v ON v.id=ci.variant_id
		JOIN products p ON p.id=v.product_id
		JOIN shops s ON s.id=p.shop_id
		JOIN categories c ON c.id=p.category_id
		WHERE ci.cart_id=? ORDER BY ci.created_at,ci.id`, cartID)
	if err != nil {
		return cartResponse{}, err
	}
	defer rows.Close()
	result := emptyCart()
	for rows.Next() {
		var item cartItem
		if err = rows.Scan(&item.ID, &item.ProductID, &item.ProductName, &item.ProductSlug, &item.ProductThumbnail,
			&item.ShopID, &item.ShopName, &item.VariantID, &item.VariantSKU, &item.VariantName, &item.UnitPrice,
			&item.Quantity, &item.AvailableStock, &item.IsAvailable, &item.LineTotal); err != nil {
			return cartResponse{}, err
		}
		result.Items = append(result.Items, item)
		result.ItemCount += item.Quantity
		if item.IsAvailable {
			result.AvailableItemCount += item.Quantity
			result.Subtotal += item.LineTotal
		}
	}
	if err = rows.Err(); err != nil {
		return cartResponse{}, err
	}
	result.LineCount = len(result.Items)
	return result, nil
}

func (h *Handler) writeCart(w http.ResponseWriter, r *http.Request, cartID int64, status int) {
	result, err := h.loadCart(r, cartID)
	if err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, status, map[string]any{"success": true, "data": result})
}

func emptyCart() cartResponse {
	return cartResponse{Items: []cartItem{}}
}

func authenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	userID, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || userID < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return userID, true
}

func parseItemID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "invalid_cart_item_id", "Cart item ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	return httpx.Decode(w, r, target)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	httpx.WriteJSON(w, status, value)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}

func (h *Handler) serverError(w http.ResponseWriter, err error) {
	httpx.ServerError(w, h.logger, err)
}
