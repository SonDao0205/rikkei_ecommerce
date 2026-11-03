package catalog

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"
)

type publicShop struct {
	ID            int64   `json:"id"`
	Name          string  `json:"name"`
	Description   *string `json:"description"`
	LogoURL       *string `json:"logo_url"`
	BannerURL     *string `json:"banner_url"`
	Phone         *string `json:"phone"`
	FollowerCount int64   `json:"follower_count"`
	ApprovedAt    *string `json:"approved_at"`
}

type productImage struct {
	ID        int64  `json:"id"`
	URL       string `json:"url"`
	SortOrder int    `json:"sort_order"`
	IsPrimary bool   `json:"is_primary"`
}

type variantAttribute struct {
	AttributeID int64  `json:"attribute_id"`
	Name        string `json:"name"`
	ValueID     int64  `json:"value_id"`
	Value       string `json:"value"`
}

type productVariant struct {
	ID         int64              `json:"id"`
	SKU        string             `json:"sku"`
	Name       *string            `json:"name"`
	Price      float64            `json:"price"`
	Stock      int64              `json:"stock"`
	ImageURL   *string            `json:"image_url"`
	Attributes []variantAttribute `json:"attributes"`
}

func (h handler) productDetail(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}
	var item product
	err := h.db.QueryRowContext(r.Context(), `SELECT p.id,p.shop_id,p.category_id,p.brand_id,p.name,p.slug,p.description,p.thumbnail_url,p.price,p.sold_count,p.rating_avg,p.rating_count,p.status,NULL,p.is_deleted,s.name,c.name,
		(SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id AND v.status='ACTIVE')
		FROM products p JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id
		WHERE p.id=? AND p.status='ACTIVE' AND p.is_deleted=0 AND s.status='ACTIVE' AND c.is_active=1`, id).
		Scan(&item.ID, &item.ShopID, &item.CategoryID, &item.BrandID, &item.Name, &item.Slug, &item.Description, &item.ThumbnailURL, &item.Price, &item.SoldCount, &item.RatingAvg, &item.RatingCount, &item.Status, &item.RejectReason, &item.IsDeleted, &item.ShopName, &item.CategoryName, &item.Stock)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load product")
		return
	}

	images, err := h.productImages(r, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load product images")
		return
	}
	variants, err := h.productVariants(r, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load product variants")
		return
	}
	shop, err := h.publicShopByID(r, item.ShopID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"product": item, "images": images, "variants": variants, "shop": shop,
	}})
}

func (h handler) productImages(r *http.Request, productID int64) ([]productImage, error) {
	rows, err := h.db.QueryContext(r.Context(), `SELECT id,url,sort_order,is_primary FROM product_images WHERE product_id=? ORDER BY is_primary DESC,sort_order,id LIMIT 100`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	images := []productImage{}
	for rows.Next() {
		var image productImage
		var primary bool
		if err := rows.Scan(&image.ID, &image.URL, &image.SortOrder, &primary); err != nil {
			return nil, err
		}
		image.IsPrimary = primary
		images = append(images, image)
	}
	return images, rows.Err()
}

func (h handler) productVariants(r *http.Request, productID int64) ([]productVariant, error) {
	rows, err := h.db.QueryContext(r.Context(), `SELECT v.id,v.sku,v.name,v.price,v.stock,v.image_url,av.id,a.id,a.name,av.value
		FROM product_variants v
		LEFT JOIN variant_attribute_values vav ON vav.variant_id=v.id
		LEFT JOIN attribute_values av ON av.id=vav.attribute_value_id
		LEFT JOIN attributes a ON a.id=av.attribute_id
		WHERE v.product_id=? AND v.status='ACTIVE'
			AND v.id IN (SELECT limited.id FROM (
				SELECT id FROM product_variants WHERE product_id=? AND status='ACTIVE' ORDER BY id LIMIT 100
			) AS limited)
		ORDER BY v.id,a.id,av.id`, productID, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	variants := []productVariant{}
	var currentID int64
	for rows.Next() {
		var variant productVariant
		var attributeID, valueID sql.NullInt64
		var attributeName, value sql.NullString
		if err := rows.Scan(&variant.ID, &variant.SKU, &variant.Name, &variant.Price, &variant.Stock, &variant.ImageURL, &valueID, &attributeID, &attributeName, &value); err != nil {
			return nil, err
		}
		if len(variants) == 0 || currentID != variant.ID {
			variant.Attributes = []variantAttribute{}
			variants = append(variants, variant)
			currentID = variant.ID
		}
		if attributeID.Valid && valueID.Valid && attributeName.Valid && value.Valid {
			variants[len(variants)-1].Attributes = append(variants[len(variants)-1].Attributes, variantAttribute{
				AttributeID: attributeID.Int64,
				Name:        attributeName.String,
				ValueID:     valueID.Int64,
				Value:       value.String,
			})
		}
	}
	return variants, rows.Err()
}

func (h handler) shopDetail(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}
	shop, err := h.publicShopByID(r, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_not_found", "Shop was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"shop": shop}})
}

func (h handler) shopProducts(w http.ResponseWriter, r *http.Request) {
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}
	exists, err := activeShopExists(r.Context(), h.db, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop products")
		return
	}
	if !exists {
		writeError(w, http.StatusNotFound, "shop_not_found", "Shop was not found")
		return
	}
	h.listProducts(w, r, id)
}

func (h handler) shopFollowState(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}
	userID, ok := h.authenticatedUserID(w, r)
	if !ok {
		return
	}
	shop, err := h.publicShopByID(r, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_not_found", "Shop was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop follow state")
		return
	}
	var following bool
	if err := h.db.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM shop_followers WHERE shop_id=? AND user_id=?)`, id, userID).Scan(&following); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop follow state")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"shop_id": id, "following": following, "follower_count": shop.FollowerCount,
	}})
}

func (h handler) followShop(w http.ResponseWriter, r *http.Request, follow bool) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	id, ok := parsePathID(w, r)
	if !ok {
		return
	}
	userID, ok := h.authenticatedUserID(w, r)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
		return
	}
	defer tx.Rollback()

	var ownerID, followerCount int64
	err = tx.QueryRowContext(r.Context(), `SELECT owner_id,follower_count FROM shops WHERE id=? AND status='ACTIVE' FOR UPDATE`, id).Scan(&ownerID, &followerCount)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_not_found", "Shop was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
		return
	}
	if ownerID == userID {
		writeError(w, http.StatusConflict, "cannot_follow_own_shop", "You cannot follow your own shop")
		return
	}

	var exists bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM shop_followers WHERE shop_id=? AND user_id=?)`, id, userID).Scan(&exists); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
		return
	}
	changed := false
	if follow && !exists {
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO shop_followers(shop_id,user_id) VALUES(?,?)`, id, userID); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
			return
		}
		if _, err = tx.ExecContext(r.Context(), `UPDATE shops SET follower_count=follower_count+1 WHERE id=?`, id); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follower count")
			return
		}
		changed = true
	} else if !follow && exists {
		if _, err = tx.ExecContext(r.Context(), `DELETE FROM shop_followers WHERE shop_id=? AND user_id=?`, id, userID); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
			return
		}
		if _, err = tx.ExecContext(r.Context(), `UPDATE shops SET follower_count=GREATEST(follower_count-1,0) WHERE id=?`, id); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follower count")
			return
		}
		changed = true
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update shop follow state")
		return
	}
	if changed {
		if err = h.db.QueryRowContext(r.Context(), `SELECT follower_count FROM shops WHERE id=?`, id).Scan(&followerCount); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load shop follower count")
			return
		}
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"shop_id": id, "following": follow, "follower_count": followerCount,
	}})
}

func (h handler) authenticatedUserID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	if h.userID == nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Authentication context is unavailable")
		return 0, false
	}
	id, err := strconv.ParseInt(h.userID(r), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}

func (h handler) publicShopByID(r *http.Request, id int64) (publicShop, error) {
	var shop publicShop
	var approvedAt sql.NullTime
	err := h.db.QueryRowContext(r.Context(), `SELECT id,name,description,logo_url,banner_url,phone,follower_count,approved_at
		FROM shops WHERE id=? AND status='ACTIVE'`, id).
		Scan(&shop.ID, &shop.Name, &shop.Description, &shop.LogoURL, &shop.BannerURL, &shop.Phone, &shop.FollowerCount, &approvedAt)
	if approvedAt.Valid {
		approved := approvedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
		shop.ApprovedAt = &approved
	}
	return shop, err
}

func parsePathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_id", "ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func rejectUnexpectedQuery(w http.ResponseWriter, r *http.Request) bool {
	values, err := parseRequestQuery(r)
	if err != nil || len(values) != 0 {
		writeError(w, http.StatusBadRequest, "invalid_query", "This endpoint does not accept query parameters")
		return false
	}
	return true
}

func (h handler) followShopHandler(w http.ResponseWriter, r *http.Request) {
	h.followShop(w, r, true)
}

func (h handler) unfollowShopHandler(w http.ResponseWriter, r *http.Request) {
	h.followShop(w, r, false)
}
