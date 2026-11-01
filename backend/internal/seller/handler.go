package seller

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"

	"rikkei-ecommerce/internal/auth"
	"rikkei-ecommerce/internal/httpx"
)

const (
	maxProductImages   = 10
	maxProductVariants = 50
	maxVariantAttrs    = 10
)

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

func RegisterRoutes(mux *http.ServeMux, security *auth.App, db *sql.DB, logger *log.Logger) {
	handler := &Handler{db: db, logger: logger}
	mux.Handle("GET /api/v1/seller/products", security.RequireRole("SELLER", handler.listSellerProducts))
	mux.Handle("POST /api/v1/seller/products", security.RequireRole("SELLER", handler.createSellerProduct))
	mux.Handle("GET /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.getSellerProduct))
	mux.Handle("PUT /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.updateSellerProduct))
	mux.Handle("DELETE /api/v1/seller/products/{id}", security.RequireRole("SELLER", handler.deleteSellerProduct))
}

type sellerProductRequest struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	CategoryID  int64                  `json:"category_id"`
	BrandID     *int64                 `json:"brand_id"`
	Price       float64                `json:"price"`
	Images      []sellerProductImage   `json:"images"`
	Variants    []sellerProductVariant `json:"variants"`
}

type sellerProductImage struct {
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
}

type sellerProductVariant struct {
	ID                *int64  `json:"id,omitempty"`
	SKU               string  `json:"sku"`
	Name              string  `json:"name"`
	Price             float64 `json:"price"`
	Stock             int     `json:"stock"`
	ImageURL          *string `json:"image_url"`
	AttributeValueIDs []int64 `json:"attribute_value_ids"`
}

type sellerProduct struct {
	ID          int64                  `json:"id"`
	ShopID      int64                  `json:"shop_id"`
	CategoryID  int64                  `json:"category_id"`
	BrandID     *int64                 `json:"brand_id"`
	Name        string                 `json:"name"`
	Slug        string                 `json:"slug"`
	Description *string                `json:"description"`
	Thumbnail   *string                `json:"thumbnail_url"`
	Price       float64                `json:"price"`
	Status      string                 `json:"status"`
	Images      []sellerProductImage   `json:"images"`
	Variants    []sellerProductVariant `json:"variants"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
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
		thumbnail_url,price,status,created_at,updated_at FROM products
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
		(shop_id,category_id,brand_id,name,slug,description,thumbnail_url,price,status)
		VALUES(?,?,?,?,?,?,?,?, 'PENDING')`, shopID, request.CategoryID, request.BrandID, request.Name,
		slug, nullableText(request.Description), thumbnail, request.Price)
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
	var exists int
	if err = tx.QueryRowContext(r.Context(), `SELECT id FROM products WHERE id=? AND shop_id=? AND is_deleted=0 FOR UPDATE`, productID, shopID).Scan(&exists); err != nil {
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
		description=?,thumbnail_url=?,price=?,status='PENDING',reject_reason=NULL
		WHERE id=? AND shop_id=?`, request.CategoryID, request.BrandID, request.Name, slug,
		nullableText(request.Description), thumbnail, request.Price, productID, shopID); err != nil {
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
	var exists int
	if err = tx.QueryRowContext(r.Context(), `SELECT id FROM products WHERE id=? AND shop_id=? AND is_deleted=0 FOR UPDATE`, productID, shopID).Scan(&exists); err != nil {
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
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": map[string]any{"id": productID}, "message": "Product deleted"})
}

func activeSellerShop(w http.ResponseWriter, r *http.Request, a *Handler) (int64, bool) {
	userID, ok := sellerAuthenticatedID(w, r)
	if !ok {
		return 0, false
	}
	var shopID int64
	err := a.db.QueryRowContext(r.Context(), `SELECT s.id FROM shops s JOIN users u ON u.id=s.owner_id
		WHERE s.owner_id=? AND s.status='ACTIVE' AND u.status='ACTIVE' AND u.role='seller'`, userID).Scan(&shopID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "An approved active shop is required")
		return 0, false
	}
	if err != nil {
		a.serverError(w, r, err)
		return 0, false
	}
	return shopID, true
}

func scanSellerProduct(row scanner) (sellerProduct, error) {
	var product sellerProduct
	var description, thumbnail sql.NullString
	var brandID sql.NullInt64
	var createdAt, updatedAt sql.NullTime
	err := row.Scan(&product.ID, &product.ShopID, &product.CategoryID, &brandID, &product.Name, &product.Slug,
		&description, &thumbnail, &product.Price, &product.Status, &createdAt, &updatedAt)
	if err != nil {
		return sellerProduct{}, err
	}
	if brandID.Valid {
		product.BrandID = &brandID.Int64
	}
	if description.Valid {
		product.Description = &description.String
	}
	if thumbnail.Valid {
		product.Thumbnail = &thumbnail.String
	}
	if createdAt.Valid {
		product.CreatedAt = createdAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	if updatedAt.Valid {
		product.UpdatedAt = updatedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	product.Images = []sellerProductImage{}
	product.Variants = []sellerProductVariant{}
	return product, nil
}

func (a *Handler) sellerProductForOwner(r *http.Request, shopID, productID int64) (sellerProduct, error) {
	return scanSellerProduct(a.db.QueryRowContext(r.Context(), `SELECT id,shop_id,category_id,brand_id,name,slug,
		description,thumbnail_url,price,status,created_at,updated_at FROM products
		WHERE id=? AND shop_id=? AND is_deleted=0`, productID, shopID))
}

func (a *Handler) loadProductChildren(r *http.Request, shopID int64, product *sellerProduct) error {
	rows, err := a.db.QueryContext(r.Context(), `SELECT i.url,i.is_primary FROM product_images i
		JOIN products p ON p.id=i.product_id WHERE i.product_id=? AND p.shop_id=? ORDER BY i.sort_order,i.id`,
		product.ID, shopID)
	if err != nil {
		return err
	}
	for rows.Next() {
		var image sellerProductImage
		if err = rows.Scan(&image.URL, &image.IsPrimary); err != nil {
			rows.Close()
			return err
		}
		product.Images = append(product.Images, image)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	rows, err = a.db.QueryContext(r.Context(), `SELECT v.id,v.sku,COALESCE(v.name,''),v.price,v.stock,v.image_url
		FROM product_variants v JOIN products p ON p.id=v.product_id
		WHERE v.product_id=? AND p.shop_id=? ORDER BY v.id`, product.ID, shopID)
	if err != nil {
		return err
	}
	for rows.Next() {
		var variant sellerProductVariant
		var variantID int64
		var imageURL sql.NullString
		if err = rows.Scan(&variantID, &variant.SKU, &variant.Name, &variant.Price, &variant.Stock, &imageURL); err != nil {
			return err
		}
		variant.ID = &variantID
		variant.AttributeValueIDs = []int64{}
		if imageURL.Valid {
			variant.ImageURL = &imageURL.String
		}
		product.Variants = append(product.Variants, variant)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	variantIDs := make([]int64, 0, len(product.Variants))
	variantIndex := make(map[int64]int, len(product.Variants))
	for index, variant := range product.Variants {
		variantIDs = append(variantIDs, *variant.ID)
		variantIndex[*variant.ID] = index
	}
	if len(variantIDs) == 0 {
		return nil
	}
	placeholders := strings.TrimSuffix(strings.Repeat("?,", len(variantIDs)), ",")
	args := make([]any, len(variantIDs))
	for index, id := range variantIDs {
		args[index] = id
	}
	query := fmt.Sprintf(`SELECT variant_id,attribute_value_id FROM variant_attribute_values
		WHERE variant_id IN (%s) ORDER BY variant_id,attribute_value_id`, placeholders)
	attributeRows, err := a.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		return err
	}
	defer attributeRows.Close()
	for attributeRows.Next() {
		var variantID, valueID int64
		if err = attributeRows.Scan(&variantID, &valueID); err != nil {
			return err
		}
		if index, exists := variantIndex[variantID]; exists {
			product.Variants[index].AttributeValueIDs = append(product.Variants[index].AttributeValueIDs, valueID)
		}
	}
	return attributeRows.Err()
}

func validateSellerProductRequest(w http.ResponseWriter, request *sellerProductRequest) bool {
	request.Name = strings.TrimSpace(request.Name)
	request.Description = strings.TrimSpace(request.Description)
	if !validTextLength(request.Name, 2, 255) || utf8.RuneCountInString(request.Description) > 20000 {
		writeError(w, http.StatusBadRequest, "invalid_product_text", "Name must be 2 to 255 characters and description at most 20000 characters")
		return false
	}
	if request.CategoryID <= 0 || request.BrandID != nil && *request.BrandID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_product_relation", "Category and brand IDs must be positive integers")
		return false
	}
	if !validProductMoney(request.Price) {
		writeError(w, http.StatusBadRequest, "invalid_product_price", "Price must be between 0 and 9999999999999.99")
		return false
	}
	if len(request.Images) == 0 || len(request.Images) > maxProductImages {
		writeError(w, http.StatusBadRequest, "invalid_product_images", "A product must have 1 to 10 images")
		return false
	}
	primaryCount := 0
	for index := range request.Images {
		request.Images[index].URL = strings.TrimSpace(request.Images[index].URL)
		if !validHTTPSURL(request.Images[index].URL, 500) {
			writeError(w, http.StatusBadRequest, "invalid_product_image_url", "Product image URLs must be absolute HTTPS URLs")
			return false
		}
		if request.Images[index].IsPrimary {
			primaryCount++
		}
	}
	if primaryCount > 1 {
		writeError(w, http.StatusBadRequest, "invalid_primary_image", "Only one product image can be primary")
		return false
	}
	if primaryCount == 0 {
		request.Images[0].IsPrimary = true
	}
	if len(request.Variants) == 0 || len(request.Variants) > maxProductVariants {
		writeError(w, http.StatusBadRequest, "invalid_product_variants", "A product must have 1 to 50 variants")
		return false
	}
	seenSKUs := make(map[string]struct{}, len(request.Variants))
	seenVariantIDs := make(map[int64]struct{}, len(request.Variants))
	for index := range request.Variants {
		variant := &request.Variants[index]
		if variant.ID != nil {
			if *variant.ID <= 0 {
				writeError(w, http.StatusBadRequest, "invalid_variant_id", "Variant IDs must be positive integers")
				return false
			}
			if _, exists := seenVariantIDs[*variant.ID]; exists {
				writeError(w, http.StatusBadRequest, "duplicate_variant_id", "Variant IDs must not be duplicated")
				return false
			}
			seenVariantIDs[*variant.ID] = struct{}{}
		}
		variant.SKU = strings.TrimSpace(variant.SKU)
		variant.Name = strings.TrimSpace(variant.Name)
		if !validTextLength(variant.SKU, 1, 80) || utf8.RuneCountInString(variant.Name) > 200 ||
			!validProductMoney(variant.Price) || variant.Stock < 0 || variant.Stock > 1000000000 {
			writeError(w, http.StatusBadRequest, "invalid_product_variant", "Variant SKU, name, price, or stock is invalid")
			return false
		}
		key := strings.ToLower(variant.SKU)
		if _, exists := seenSKUs[key]; exists {
			writeError(w, http.StatusBadRequest, "duplicate_sku", "SKUs must be unique within the product")
			return false
		}
		seenSKUs[key] = struct{}{}
		if variant.ImageURL != nil {
			value := strings.TrimSpace(*variant.ImageURL)
			if value != "" && !validHTTPSURL(value, 500) {
				writeError(w, http.StatusBadRequest, "invalid_variant_image_url", "Variant image URLs must be absolute HTTPS URLs")
				return false
			}
			variant.ImageURL = &value
		}
		if len(variant.AttributeValueIDs) > maxVariantAttrs {
			writeError(w, http.StatusBadRequest, "too_many_variant_attributes", "A variant can have at most 10 attribute values")
			return false
		}
		seenValues := make(map[int64]struct{}, len(variant.AttributeValueIDs))
		for _, attributeValueID := range variant.AttributeValueIDs {
			if attributeValueID <= 0 {
				writeError(w, http.StatusBadRequest, "invalid_attribute_value", "Attribute value IDs must be positive integers")
				return false
			}
			if _, exists := seenValues[attributeValueID]; exists {
				writeError(w, http.StatusBadRequest, "duplicate_attribute_value", "Attribute values must not be duplicated")
				return false
			}
			seenValues[attributeValueID] = struct{}{}
		}
	}
	return true
}

func validateProductRelations(r *http.Request, tx *sql.Tx, request *sellerProductRequest) error {
	var categoryID int64
	if err := tx.QueryRowContext(r.Context(), `SELECT id FROM categories WHERE id=? AND is_active=1 FOR SHARE`, request.CategoryID).Scan(&categoryID); errors.Is(err, sql.ErrNoRows) {
		return errInvalidProductRelation
	} else if err != nil {
		return err
	}
	var active bool
	if request.BrandID != nil {
		if err := tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM brands WHERE id=? AND is_active=1)`, *request.BrandID).Scan(&active); err != nil {
			return err
		}
		if !active {
			return errInvalidProductRelation
		}
	}
	return validateCategoryVariantAttributes(r, tx, request.CategoryID, request.Variants)
}

var errInvalidProductRelation = errors.New("invalid or inactive product relation")

type categoryVariantValidationError struct {
	code    string
	message string
}

func (e *categoryVariantValidationError) Error() string { return e.message }

func writeProductRelationError(w http.ResponseWriter, err error) bool {
	if errors.Is(err, errInvalidProductRelation) {
		writeError(w, http.StatusBadRequest, "invalid_product_relation", "Category or brand is invalid or inactive")
		return true
	}
	var validationErr *categoryVariantValidationError
	if errors.As(err, &validationErr) {
		writeError(w, http.StatusBadRequest, validationErr.code, validationErr.message)
		return true
	}
	return false
}

func validateCategoryVariantAttributes(r *http.Request, tx *sql.Tx, categoryID int64, variants []sellerProductVariant) error {
	rows, err := tx.QueryContext(r.Context(), `SELECT ca.attribute_id,ca.is_required,av.id
		FROM category_attributes ca
		LEFT JOIN attribute_values av ON av.attribute_id=ca.attribute_id
		WHERE ca.category_id=? ORDER BY ca.sort_order,ca.attribute_id,av.id`, categoryID)
	if err != nil {
		return err
	}
	allowedValues := make(map[int64]int64)
	requiredAttributes := make(map[int64]struct{})
	for rows.Next() {
		var attributeID int64
		var required bool
		var valueID sql.NullInt64
		if err = rows.Scan(&attributeID, &required, &valueID); err != nil {
			rows.Close()
			return err
		}
		if required {
			requiredAttributes[attributeID] = struct{}{}
		}
		if valueID.Valid {
			allowedValues[valueID.Int64] = attributeID
		}
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	return validateVariantAttributeSets(variants, requiredAttributes, allowedValues)
}

func validateVariantAttributeSets(
	variants []sellerProductVariant,
	requiredAttributes map[int64]struct{},
	allowedValues map[int64]int64,
) error {
	var expectedAttributes map[int64]struct{}
	seenCombinations := make(map[string]struct{}, len(variants))
	for _, variant := range variants {
		selectedAttributes := make(map[int64]struct{}, len(variant.AttributeValueIDs))
		valueIDs := append([]int64(nil), variant.AttributeValueIDs...)
		sort.Slice(valueIDs, func(i, j int) bool { return valueIDs[i] < valueIDs[j] })
		for _, valueID := range valueIDs {
			attributeID, allowed := allowedValues[valueID]
			if !allowed {
				return &categoryVariantValidationError{
					code:    "invalid_category_variant_attribute",
					message: "Variant attribute values must belong to attributes configured for the selected category",
				}
			}
			if _, exists := selectedAttributes[attributeID]; exists {
				return &categoryVariantValidationError{
					code:    "duplicate_variant_attribute",
					message: "A variant can only select one value for each attribute",
				}
			}
			selectedAttributes[attributeID] = struct{}{}
		}
		for attributeID := range requiredAttributes {
			if _, exists := selectedAttributes[attributeID]; !exists {
				return &categoryVariantValidationError{
					code:    "missing_required_variant_attribute",
					message: "Every variant must include a value for each required category attribute",
				}
			}
		}
		if expectedAttributes == nil {
			expectedAttributes = selectedAttributes
		} else if !sameAttributeSet(expectedAttributes, selectedAttributes) {
			return &categoryVariantValidationError{
				code:    "inconsistent_variant_attributes",
				message: "All variants of a product must use the same set of attributes",
			}
		}
		combination := make([]string, len(valueIDs))
		for i, valueID := range valueIDs {
			combination[i] = strconv.FormatInt(valueID, 10)
		}
		key := strings.Join(combination, ",")
		if _, exists := seenCombinations[key]; exists {
			return &categoryVariantValidationError{
				code:    "duplicate_variant_combination",
				message: "Each variant must have a unique attribute combination",
			}
		}
		seenCombinations[key] = struct{}{}
	}
	return nil
}

func sameAttributeSet(left, right map[int64]struct{}) bool {
	if len(left) != len(right) {
		return false
	}
	for attributeID := range left {
		if _, exists := right[attributeID]; !exists {
			return false
		}
	}
	return true
}

func persistProductChildren(r *http.Request, tx *sql.Tx, productID int64, request *sellerProductRequest) error {
	for index, image := range request.Images {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO product_images(product_id,url,sort_order,is_primary) VALUES(?,?,?,?)`,
			productID, image.URL, index, image.IsPrimary); err != nil {
			return err
		}
	}
	return persistVariantSet(r, tx, productID, request.Variants, false)
}

func disableAndReplaceVariants(r *http.Request, tx *sql.Tx, productID int64, request *sellerProductRequest) error {
	if _, err := tx.ExecContext(r.Context(), `UPDATE product_variants SET status='INACTIVE' WHERE product_id=?`, productID); err != nil {
		return err
	}
	for index, image := range request.Images {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO product_images(product_id,url,sort_order,is_primary) VALUES(?,?,?,?)`,
			productID, image.URL, index, image.IsPrimary); err != nil {
			return err
		}
	}
	return persistVariantSet(r, tx, productID, request.Variants, true)
}

func persistVariantSet(r *http.Request, tx *sql.Tx, productID int64, variants []sellerProductVariant, updating bool) error {
	for index := range variants {
		variant := &variants[index]
		var variantID int64
		var oldStock int
		if updating && variant.ID != nil {
			if err := tx.QueryRowContext(r.Context(), `SELECT id,stock FROM product_variants
				WHERE id=? AND product_id=? FOR UPDATE`, *variant.ID, productID).Scan(&variantID, &oldStock); err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return errInvalidProductRelation
				}
				return err
			}
			if _, err := tx.ExecContext(r.Context(), `UPDATE product_variants SET sku=?,name=?,price=?,stock=?,image_url=?,status='ACTIVE'
				WHERE id=? AND product_id=?`, variant.SKU, nullableText(variant.Name), variant.Price, variant.Stock,
				nullableOptionalText(variant.ImageURL), variantID, productID); err != nil {
				return err
			}
		} else {
			result, err := tx.ExecContext(r.Context(), `INSERT INTO product_variants(product_id,sku,name,price,stock,image_url)
				VALUES(?,?,?,?,?,?)`, productID, variant.SKU, nullableText(variant.Name), variant.Price,
				variant.Stock, nullableOptionalText(variant.ImageURL))
			if err != nil {
				return err
			}
			variantID, err = result.LastInsertId()
			if err != nil {
				return err
			}
		}
		stockChange := variant.Stock
		if updating && variant.ID != nil {
			stockChange -= oldStock
		}
		if stockChange != 0 {
			if _, err := tx.ExecContext(r.Context(), `INSERT INTO stock_movements(variant_id,change_qty,stock_after,reason,created_by)
				VALUES(?,?,?,'ADJUST',?)`, variantID, stockChange, variant.Stock, currentUserID(r)); err != nil {
				return err
			}
		}
		if _, err := tx.ExecContext(r.Context(), `DELETE FROM variant_attribute_values WHERE variant_id=?`, variantID); err != nil {
			return err
		}
		if err := persistVariantAttributes(r, tx, variantID, variant.AttributeValueIDs); err != nil {
			return err
		}
	}
	return nil
}

func persistVariantAttributes(r *http.Request, tx *sql.Tx, variantID int64, ids []int64) error {
	for _, id := range ids {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO variant_attribute_values(variant_id,attribute_value_id) VALUES(?,?)`, variantID, id); err != nil {
			return err
		}
	}
	return nil
}

func currentUserID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	return id
}

func primaryImage(images []sellerProductImage) string {
	for _, image := range images {
		if image.IsPrimary {
			return image.URL
		}
	}
	return ""
}

func productSlug(name string) (string, error) {
	randomSuffix := make([]byte, 4)
	if _, err := rand.Read(randomSuffix); err != nil {
		return "", err
	}
	var slug strings.Builder
	lastHyphen := false
	for _, character := range strings.ToLower(name) {
		if unicode.IsLetter(character) || unicode.IsDigit(character) {
			slug.WriteRune(character)
			lastHyphen = false
		} else if !lastHyphen && slug.Len() > 0 {
			slug.WriteByte('-')
			lastHyphen = true
		}
	}
	base := strings.Trim(slug.String(), "-")
	if base == "" {
		base = "product"
	}
	suffix := hex.EncodeToString(randomSuffix)
	return base + "-" + suffix, nil
}

func validHTTPSURL(value string, maxLength int) bool {
	parsed, err := url.Parse(value)
	return err == nil && len(value) <= maxLength && parsed.Scheme == "https" &&
		parsed.Host != "" && parsed.User == nil && parsed.Hostname() != ""
}

func validProductMoney(value float64) bool {
	return value >= 0 && value <= 9999999999999.99 &&
		math.Abs(value*100-math.Round(value*100)) < 0.000001
}

func nullableOptionalText(value *string) any {
	if value == nil || strings.TrimSpace(*value) == "" {
		return nil
	}
	return strings.TrimSpace(*value)
}

func parseSellerProductID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_product_id", "Product ID must be a positive integer")
		return 0, false
	}
	return id, true
}

type scanner interface {
	Scan(dest ...any) error
}

func sellerAuthenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}

func parseListPage(values url.Values) (int, int, error) { return httpx.ParseListPage(values) }
func isMySQLDuplicate(err error) bool                   { return httpx.IsMySQLDuplicate(err) }
func validTextLength(value string, minimum, maximum int) bool {
	return httpx.ValidTextLength(value, minimum, maximum)
}
func nullableText(value string) any { return httpx.NullableText(value) }
func decode(w http.ResponseWriter, r *http.Request, target any) bool {
	return httpx.Decode(w, r, target)
}
func writeJSON(w http.ResponseWriter, status int, value any) { httpx.WriteJSON(w, status, value) }
func writeError(w http.ResponseWriter, status int, code, message string) {
	httpx.WriteError(w, status, code, message)
}
func (a *Handler) serverError(w http.ResponseWriter, _ *http.Request, err error) {
	httpx.ServerError(w, a.logger, err)
}
