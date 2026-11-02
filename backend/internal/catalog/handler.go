package catalog

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"strconv"
	"strings"
)

type handler struct {
	db     *sql.DB
	userID func(*http.Request) string
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type apiResponse struct {
	Success bool       `json:"success"`
	Data    any        `json:"data,omitempty"`
	Message string     `json:"message,omitempty"`
	Errors  []apiError `json:"errors,omitempty"`
}

type category struct {
	ID        int64   `json:"id"`
	ParentID  *int64  `json:"parent_id"`
	Name      string  `json:"name"`
	Slug      string  `json:"slug"`
	ImageURL  *string `json:"image_url"`
	SortOrder int     `json:"sort_order"`
	IsActive  int     `json:"is_active"`
}

type product struct {
	ID           int64   `json:"id"`
	ShopID       int64   `json:"shop_id"`
	CategoryID   int64   `json:"category_id"`
	BrandID      *int64  `json:"brand_id"`
	Name         string  `json:"name"`
	Slug         string  `json:"slug"`
	Description  *string `json:"description"`
	ThumbnailURL *string `json:"thumbnail_url"`
	Price        float64 `json:"price"`
	SoldCount    int64   `json:"sold_count"`
	RatingAvg    float64 `json:"rating_avg"`
	RatingCount  int64   `json:"rating_count"`
	Status       string  `json:"status"`
	RejectReason *string `json:"reject_reason"`
	IsDeleted    int     `json:"is_deleted"`
	ShopName     string  `json:"shop_name"`
	CategoryName string  `json:"category_name"`
	Stock        int64   `json:"stock"`
	IsFlashSale  bool    `json:"is_flash_sale"`
}

type adminProduct struct {
	ID           int64   `json:"id"`
	Name         string  `json:"name"`
	SKU          string  `json:"sku"`
	ThumbnailURL *string `json:"thumbnail_url"`
	ShopName     string  `json:"shop_name"`
	ShopBadge    string  `json:"shop_badge"`
	CategoryName string  `json:"category_name"`
	Price        float64 `json:"price"`
	Stock        int64   `json:"stock"`
	Status       string  `json:"status"`
	IsActive     bool    `json:"is_active"`
}

func (h handler) categories(w http.ResponseWriter, r *http.Request) {
	values, err := parseRequestQuery(r)
	if err != nil || len(values) != 0 {
		writeError(w, http.StatusBadRequest, "invalid_query", "Categories does not accept query parameters")
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT id,parent_id,name,slug,image_url,sort_order,is_active FROM categories WHERE is_active=1 ORDER BY sort_order,id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load categories")
		return
	}
	defer rows.Close()
	items := []category{{ID: 0, Name: "Tất cả", Slug: "all", SortOrder: 0, IsActive: 1}}
	for rows.Next() {
		var item category
		if err = rows.Scan(&item.ID, &item.ParentID, &item.Name, &item.Slug, &item.ImageURL, &item.SortOrder, &item.IsActive); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load categories")
			return
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load categories")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: items})
}

func (h handler) products(w http.ResponseWriter, r *http.Request) {
	h.listProducts(w, r, 0)
}

func (h handler) adminProducts(w http.ResponseWriter, r *http.Request) {
	values, err := parseRequestQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_product_filters", "Query string is malformed")
		return
	}
	if err := validateAdminProductQuery(values); err != nil {
		writeError(w, http.StatusBadRequest, "invalid_product_filters", err.Error())
		return
	}
	search := strings.TrimSpace(values.Get("search"))
	category := strings.TrimSpace(values.Get("category"))
	stockStatus := strings.TrimSpace(values.Get("stock_status"))
	vendor := strings.TrimSpace(values.Get("vendor"))
	searchPattern := "%" + escapeLike(search) + "%"
	vendorPattern := "%" + escapeLike(vendor) + "%"
	query := `SELECT p.id,p.name,COALESCE(v.sku,''),p.thumbnail_url,s.name,IF(s.status='ACTIVE','VERIFIED','ARTISAN'),c.name,p.price,
		(SELECT COALESCE(SUM(v2.stock),0) FROM product_variants v2 WHERE v2.product_id=p.id AND v2.status='ACTIVE') AS total_stock,p.status
		FROM products p JOIN shops s ON s.id=p.shop_id JOIN categories c ON c.id=p.category_id
		LEFT JOIN product_variants v ON v.id=(SELECT MIN(v1.id) FROM product_variants v1 WHERE v1.product_id=p.id AND v1.status='ACTIVE')
		WHERE p.is_deleted=0 AND (?='' OR p.name LIKE ? ESCAPE '!' OR v.sku LIKE ? ESCAPE '!' OR s.name LIKE ? ESCAPE '!')
		AND (?='' OR c.name=?) AND (?='' OR s.name LIKE ? ESCAPE '!')
		AND (?='' OR (?='in_stock' AND (SELECT COALESCE(SUM(v3.stock),0) FROM product_variants v3 WHERE v3.product_id=p.id AND v3.status='ACTIVE')>5)
		OR (?='low_stock' AND (SELECT COALESCE(SUM(v4.stock),0) FROM product_variants v4 WHERE v4.product_id=p.id AND v4.status='ACTIVE') BETWEEN 1 AND 5)
		OR (?='out_of_stock' AND (SELECT COALESCE(SUM(v5.stock),0) FROM product_variants v5 WHERE v5.product_id=p.id AND v5.status='ACTIVE')=0)) ORDER BY ` + adminProductOrder(values.Get("sort_by"))
	args := []any{search, searchPattern, searchPattern, searchPattern, category, category, vendor, vendorPattern, stockStatus, stockStatus, stockStatus, stockStatus}
	rows, err := h.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory")
		return
	}
	defer rows.Close()
	items := []adminProduct{}
	for rows.Next() {
		var item adminProduct
		if err = rows.Scan(&item.ID, &item.Name, &item.SKU, &item.ThumbnailURL, &item.ShopName, &item.ShopBadge, &item.CategoryName, &item.Price, &item.Stock, &item.Status); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory")
			return
		}
		item.IsActive = item.Status == "ACTIVE"
		if !item.IsActive {
			item.Status = "INACTIVE"
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"products": items, "total": len(items)}})
}

func (h handler) inventoryStats(w http.ResponseWriter, r *http.Request) {
	var stats struct {
		TotalSkus        int `json:"totalSkus"`
		NewThisMonth     int `json:"newThisMonth"`
		ActiveListings   int `json:"activeListings"`
		ActivePercentage int `json:"activePercentage"`
		LowStockCount    int `json:"lowStockCount"`
		OutOfStockCount  int `json:"outOfStockCount"`
	}
	query := `SELECT COUNT(*),COALESCE(SUM(v.created_at>=DATE_FORMAT(UTC_TIMESTAMP(),'%Y-%m-01')),0) FROM product_variants v JOIN products p ON p.id=v.product_id WHERE p.is_deleted=0`
	if err := h.db.QueryRowContext(r.Context(), query).Scan(&stats.TotalSkus, &stats.NewThisMonth); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory statistics")
		return
	}
	var totalProducts int
	if err := h.db.QueryRowContext(r.Context(), `SELECT COUNT(*),COALESCE(SUM(status='ACTIVE'),0) FROM products WHERE is_deleted=0`).Scan(&totalProducts, &stats.ActiveListings); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory statistics")
		return
	}
	if totalProducts > 0 {
		stats.ActivePercentage = stats.ActiveListings * 100 / totalProducts
	}
	if err := h.db.QueryRowContext(r.Context(), `SELECT COALESCE(SUM(stock>0 AND stock<=5),0),COALESCE(SUM(stock=0),0) FROM product_variants v JOIN products p ON p.id=v.product_id WHERE p.is_deleted=0 AND v.status='ACTIVE'`).Scan(&stats.LowStockCount, &stats.OutOfStockCount); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load inventory statistics")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: stats})
}

func (h handler) updateProductStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_product_id", "Product ID is invalid")
		return
	}
	var request struct {
		IsActive *bool `json:"is_active"`
	}
	if !decodeJSON(w, r, &request, 4096) || request.IsActive == nil {
		writeError(w, http.StatusBadRequest, "invalid_request", "is_active is required")
		return
	}
	var currentStatus string
	if err := h.db.QueryRowContext(r.Context(), `SELECT status FROM products WHERE id=? AND is_deleted=0`, id).Scan(&currentStatus); err != nil {
		if err == sql.ErrNoRows {
			writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not read product status")
		return
	}
	if currentStatus != "ACTIVE" && currentStatus != "HIDDEN" {
		writeError(w, http.StatusConflict, "product_status_not_toggleable", "Only approved products can be activated or hidden")
		return
	}
	status := "HIDDEN"
	if *request.IsActive {
		status = "ACTIVE"
	}
	result, err := h.db.ExecContext(r.Context(), `UPDATE products SET status=? WHERE id=? AND is_deleted=0 AND status IN ('ACTIVE','HIDDEN')`, status, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update product status")
		return
	}
	count, err := result.RowsAffected()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not verify product status update")
		return
	}
	if count == 0 {
		writeError(w, http.StatusConflict, "product_status_changed", "Product status changed; reload and try again")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": id, "is_active": *request.IsActive, "status": status}})
}

func (h handler) deleteProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_product_id", "Product ID is invalid")
		return
	}
	result, err := h.db.ExecContext(r.Context(), `UPDATE products SET is_deleted=1 WHERE id=? AND is_deleted=0`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not delete product")
		return
	}
	count, err := result.RowsAffected()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not verify product deletion")
		return
	}
	if count == 0 {
		writeError(w, http.StatusNotFound, "product_not_found", "Product was not found")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": id}})
}

func (h handler) bulkProducts(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Action     string  `json:"action"`
		ProductIDs []int64 `json:"product_ids"`
	}
	if !decodeJSON(w, r, &request, 16*1024) || len(request.ProductIDs) == 0 || len(request.ProductIDs) > 100 {
		writeError(w, http.StatusBadRequest, "invalid_bulk_request", "Provide between 1 and 100 product IDs")
		return
	}
	if request.Action != "activate" && request.Action != "deactivate" && request.Action != "delete" {
		writeError(w, http.StatusBadRequest, "invalid_bulk_action", "Action must be activate, deactivate, or delete")
		return
	}
	ids := make([]int64, 0, len(request.ProductIDs))
	seen := make(map[int64]struct{}, len(request.ProductIDs))
	for _, id := range request.ProductIDs {
		if id <= 0 {
			writeError(w, http.StatusBadRequest, "invalid_product_id", "Product IDs must be positive")
			return
		}
		if _, exists := seen[id]; !exists {
			seen[id] = struct{}{}
			ids = append(ids, id)
		}
	}
	placeholders := make([]string, len(ids))
	args := make([]any, 0, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args = append(args, id)
	}
	field, value := "status", "ACTIVE"
	if request.Action == "deactivate" {
		value = "HIDDEN"
	} else if request.Action == "delete" {
		field, value = "is_deleted", "1"
	}
	where := "is_deleted=0"
	if request.Action == "activate" || request.Action == "deactivate" {
		where += " AND status IN ('ACTIVE','HIDDEN')"
	}
	statement := fmt.Sprintf("UPDATE products SET %s=? WHERE %s AND id IN (%s)", field, where, strings.Join(placeholders, ","))
	result, err := h.db.ExecContext(r.Context(), statement, append([]any{value}, args...)...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not apply bulk action")
		return
	}
	count, err := result.RowsAffected()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not verify bulk action")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"action": request.Action, "count": count}})
}

func productOrder(value string) string {
	switch value {
	case "price_asc", "Price: Low → High":
		return "p.price ASC,p.id ASC"
	case "price_desc", "Price: High → Low":
		return "p.price DESC,p.id DESC"
	case "best_selling", "Best Selling":
		return "p.sold_count DESC,p.id DESC"
	case "latest", "Latest Arrivals":
		return "p.created_at DESC,p.id DESC"
	default:
		return "p.created_at DESC,p.id DESC"
	}
}

func adminProductOrder(value string) string {
	switch value {
	case "stock_asc":
		return "total_stock ASC,p.id DESC"
	case "stock_desc":
		return "total_stock DESC,p.id DESC"
	case "price_desc":
		return "p.price DESC,p.id DESC"
	default:
		return "p.created_at DESC,p.id DESC"
	}
}

func parsePage(queryValues interface{ Get(string) string }) (page, limit int, err error) {
	page, limit = 1, 100
	if value := queryValues.Get("page"); value != "" {
		page, err = strconv.Atoi(value)
		if err != nil || page < 1 || page > 100_000 {
			return 0, 0, fmt.Errorf("page must be between 1 and 100000")
		}
	}
	if value := queryValues.Get("limit"); value != "" {
		limit, err = strconv.Atoi(value)
		if err != nil || limit < 1 {
			return 0, 0, fmt.Errorf("limit must be a positive integer")
		}
	}
	if limit > 100 {
		limit = 100
	}
	return page, limit, nil
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any, maxBytes int64) bool {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		return false
	}
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxBytes))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return false
	}
	var trailing any
	return decoder.Decode(&trailing) == io.EOF
}

func writeJSON(w http.ResponseWriter, status int, response any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(response)
}

func writeError(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, apiResponse{Success: false, Message: message, Errors: []apiError{{Code: code, Message: message}}})
}
