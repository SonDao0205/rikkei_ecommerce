package seller

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/auditlog"
	"strings"
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

func (a *Handler) listSellerProducts(w http.ResponseWriter, r *http.Request) {
	shopID, ok := activeSellerShop(w, r, a)
	if !ok {
		return
	}
	values, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_query", "Query string is malformed")
		return
	}
	for key, items := range values {
		if key != "page" && key != "limit" && key != "status" {
			writeError(w, http.StatusBadRequest, "invalid_query", "Unsupported product filter")
			return
		}
		if len(items) != 1 {
			writeError(w, http.StatusBadRequest, "invalid_query", "Query parameters must be provided once")
			return
		}
	}
	page, limit, err := parseListPage(values)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_pagination", err.Error())
		return
	}
	status := strings.ToUpper(strings.TrimSpace(values.Get("status")))
	if status != "" && status != "DRAFT" && status != "PENDING" && status != "ACTIVE" && status != "HIDDEN" && status != "REJECTED" {
		writeError(w, http.StatusBadRequest, "invalid_product_status", "Unsupported product status")
		return
	}
	rows, err := a.db.QueryContext(r.Context(), `SELECT id,shop_id,category_id,brand_id,name,slug,description,
		thumbnail_url,video_url,price,status,created_at,updated_at FROM products
		WHERE shop_id=? AND is_deleted=0 AND (?='' OR status=?) ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?`,
		shopID, status, status, limit, (page-1)*limit)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	products := make([]sellerProduct, 0)
	for rows.Next() {
		product, scanErr := scanSellerProduct(rows)
		if scanErr != nil {
			rows.Close()
			a.serverError(w, r, scanErr)
			return
		}
		products = append(products, product)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		a.serverError(w, r, err)
		return
	}
	if err = rows.Close(); err != nil {
		a.serverError(w, r, err)
		return
	}
	for index := range products {
		if err = a.loadProductChildren(r, shopID, &products[index]); err != nil {
			a.serverError(w, r, err)
			return
		}
	}
	var total int64
	if err = a.db.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM products
		WHERE shop_id=? AND is_deleted=0 AND (?='' OR status=?)`, shopID, status, status).Scan(&total); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{
		"products": products, "total": total, "page": page, "limit": limit,
	}})
}

func (a *Handler) createSellerProduct(w http.ResponseWriter, r *http.Request) {
	var request sellerProductRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateSellerProductRequest(w, &request) {
		return
	}
	for _, variant := range request.Variants {
		if variant.ID != nil {
			writeError(w, http.StatusBadRequest, "unexpected_variant_id", "Variant IDs are only accepted when updating a product")
			return
		}
	}
	shopID, ok := activeSellerShop(w, r, a)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	if err = validateProductRelations(r, tx, &request); err != nil {
		if !writeProductRelationError(w, err) {
			a.serverError(w, r, err)
		}
		return
	}
	slug, err := productSlug(request.Name)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	thumbnail := primaryImage(request.Images)
	result, err := tx.ExecContext(r.Context(), `INSERT INTO products
		(shop_id,category_id,brand_id,name,slug,description,thumbnail_url,video_url,price,status)
		VALUES(?,?,?,?,?,?,?,?,?, 'PENDING')`, shopID, request.CategoryID, request.BrandID, request.Name,
		slug, nullableText(request.Description), thumbnail, request.VideoURL, request.Price)
	if err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "product_conflict", "A product with conflicting unique data already exists")
			return
		}
		a.serverError(w, r, err)
		return
	}
	productID, err := result.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = persistProductChildren(r, tx, productID, &request); err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "sku_in_use", "A product SKU is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if err = auditlog.Record(r.Context(), tx, auth.CurrentUser(r).ID, "PRODUCT_CREATED", "product", productID, nil,
		map[string]any{"status": "PENDING", "shop_id": shopID, "category_id": request.CategoryID}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	product, err := a.sellerProductForOwner(r, shopID, productID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = a.loadProductChildren(r, shopID, &product); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "data": product, "message": "Product submitted for review"})
}

func (a *Handler) getSellerProduct(w http.ResponseWriter, r *http.Request) {
	shopID, ok := activeSellerShop(w, r, a)
	if !ok {
		return
	}
	id, ok := parseSellerProductID(w, r)
	if !ok {
		return
	}
	product, err := a.sellerProductForOwner(r, shopID, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = a.loadProductChildren(r, shopID, &product); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": product})
}

func (a *Handler) updateSellerProduct(w http.ResponseWriter, r *http.Request) {
	var request sellerProductRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateSellerProductRequest(w, &request) {
		return
	}
	shopID, ok := activeSellerShop(w, r, a)
	if !ok {
		return
	}
	productID, ok := parseSellerProductID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var previousStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT status FROM products WHERE id=? AND shop_id=? AND is_deleted=0 FOR UPDATE`, productID, shopID).Scan(&previousStatus); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if err = validateProductRelations(r, tx, &request); err != nil {
		if !writeProductRelationError(w, err) {
			a.serverError(w, r, err)
		}
		return
	}
	slug, err := productSlug(request.Name)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	thumbnail := primaryImage(request.Images)
	if _, err = tx.ExecContext(r.Context(), `UPDATE products SET category_id=?,brand_id=?,name=?,slug=?,
		description=?,thumbnail_url=?,video_url=?,price=?,status='PENDING',reject_reason=NULL
		WHERE id=? AND shop_id=?`, request.CategoryID, request.BrandID, request.Name, slug,
		nullableText(request.Description), thumbnail, request.VideoURL, request.Price, productID, shopID); err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "product_conflict", "A product with conflicting unique data already exists")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `DELETE FROM product_images WHERE product_id=?`, productID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = disableAndReplaceVariants(r, tx, productID, &request); err != nil {
		if errors.Is(err, errInvalidProductRelation) {
			writeError(w, http.StatusBadRequest, "invalid_variant_id", "Variant ID does not belong to this product")
			return
		}
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "sku_in_use", "A product SKU is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if err = auditlog.Record(r.Context(), tx, auth.CurrentUser(r).ID, "PRODUCT_UPDATED", "product", productID,
		map[string]any{"status": previousStatus}, map[string]any{"status": "PENDING", "shop_id": shopID, "category_id": request.CategoryID}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	product, err := a.sellerProductForOwner(r, shopID, productID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = a.loadProductChildren(r, shopID, &product); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": product, "message": "Product updated and submitted for review"})
}

func (a *Handler) deleteSellerProduct(w http.ResponseWriter, r *http.Request) {
	shopID, ok := activeSellerShop(w, r, a)
	if !ok {
		return
	}
	productID, ok := parseSellerProductID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var previousStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT status FROM products WHERE id=? AND shop_id=? AND is_deleted=0 FOR UPDATE`, productID, shopID).Scan(&previousStatus); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE product_variants SET status='INACTIVE' WHERE product_id=?`, productID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE products SET is_deleted=1,status='HIDDEN' WHERE id=? AND shop_id=?`, productID, shopID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = auditlog.Record(r.Context(), tx, auth.CurrentUser(r).ID, "PRODUCT_DELETED", "product", productID,
		map[string]any{"status": previousStatus, "is_deleted": false}, map[string]any{"status": "HIDDEN", "is_deleted": true}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"id": productID}, "message": "Product deleted"})
}
