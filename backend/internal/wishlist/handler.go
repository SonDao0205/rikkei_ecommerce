package wishlist

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/httpx"
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

type wishlistItem struct {
	ProductID      int64     `json:"product_id"`
	Name           string    `json:"name"`
	Slug           string    `json:"slug"`
	ThumbnailURL   *string   `json:"thumbnail_url"`
	Price          float64   `json:"price"`
	RatingAverage  float64   `json:"rating_average"`
	RatingCount    int64     `json:"rating_count"`
	ShopID         int64     `json:"shop_id"`
	ShopName       string    `json:"shop_name"`
	AvailableStock int64     `json:"available_stock"`
	IsAvailable    bool      `json:"is_available"`
	CreatedAt      time.Time `json:"created_at"`
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT p.id,p.name,p.slug,p.thumbnail_url,p.price,p.rating_avg,p.rating_count,
		s.id,s.name,
		COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id=p.id AND v.status='ACTIVE'),0),
		(p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1
			AND EXISTS(SELECT 1 FROM product_variants v WHERE v.product_id=p.id AND v.status='ACTIVE' AND v.stock>0)),
		w.created_at
		FROM wishlists w
		JOIN products p ON p.id=w.product_id
		JOIN shops s ON s.id=p.shop_id
		JOIN categories c ON c.id=p.category_id
		WHERE w.user_id=? ORDER BY w.created_at DESC,p.id DESC`, userID)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer rows.Close()
	items := make([]wishlistItem, 0)
	for rows.Next() {
		var item wishlistItem
		if err = rows.Scan(&item.ProductID, &item.Name, &item.Slug, &item.ThumbnailURL, &item.Price,
			&item.RatingAverage, &item.RatingCount, &item.ShopID, &item.ShopName, &item.AvailableStock,
			&item.IsAvailable, &item.CreatedAt); err != nil {
			h.serverError(w, err)
			return
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{
		"items": items, "total": len(items),
	}})
}

func (h *Handler) add(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	productID, ok := parseProductID(w, r)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		h.serverError(w, err)
		return
	}
	defer tx.Rollback()

	var purchasable bool
	err = tx.QueryRowContext(r.Context(), `SELECT p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1
		FROM products p JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id
		WHERE p.id=? FOR UPDATE`, productID).Scan(&purchasable)
	if errors.Is(err, sql.ErrNoRows) || err == nil && !purchasable {
		writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
		return
	}
	if err != nil {
		h.serverError(w, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `INSERT INTO wishlists(user_id,product_id) VALUES(?,?)
		ON DUPLICATE KEY UPDATE created_at=created_at`, userID, productID); err != nil {
		h.serverError(w, err)
		return
	}
	if err = tx.Commit(); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    map[string]any{"product_id": productID, "is_favorite": true},
	})
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	userID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	productID, ok := parseProductID(w, r)
	if !ok {
		return
	}
	if _, err := h.db.ExecContext(r.Context(), `DELETE FROM wishlists WHERE user_id=? AND product_id=?`, userID, productID); err != nil {
		h.serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"data":    map[string]int64{"product_id": productID},
	})
}

func authenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	userID, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || userID < 1 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return userID, true
}

func parseProductID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		writeError(w, http.StatusBadRequest, "invalid_product_id", "Product ID must be a positive integer")
		return 0, false
	}
	return id, true
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
