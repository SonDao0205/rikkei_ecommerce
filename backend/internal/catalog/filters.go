package catalog

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"unicode/utf8"
)

const (
	maxSearchRunes = 100
	maxPrice       = 9999999999999.99
)

type productFilters struct {
	search    string
	category  int64
	brandID   int64
	shopID    int64
	minPrice  *float64
	maxPrice  *float64
	minRating *float64
	sort      string
	page      int
	limit     int
}

func parseProductFilters(values url.Values, allowShopID bool) (productFilters, error) {
	allowed := map[string]bool{
		"q": true, "search": true, "category_id": true, "brand_id": true,
		"min_price": true, "max_price": true, "min_rating": true,
		"sort": true, "page": true, "limit": true,
	}
	if allowShopID {
		allowed["shop_id"] = true
	}
	for key := range values {
		if !allowed[key] {
			return productFilters{}, fmt.Errorf("unsupported query parameter: %s", key)
		}
		if len(values[key]) != 1 {
			return productFilters{}, fmt.Errorf("%s must be provided once", key)
		}
	}

	var filters productFilters
	search, err := singleQuery(values, "q")
	if err != nil {
		return filters, err
	}
	legacySearch, err := singleQuery(values, "search")
	if err != nil {
		return filters, err
	}
	if search != "" && legacySearch != "" {
		return filters, fmt.Errorf("use either q or search, not both")
	}
	if search == "" {
		search = legacySearch
	}
	if utf8.RuneCountInString(search) > maxSearchRunes {
		return filters, fmt.Errorf("search query must be at most %d characters", maxSearchRunes)
	}
	filters.search = strings.TrimSpace(search)

	if filters.category, err = parseOptionalID(values, "category_id", true); err != nil {
		return filters, err
	}
	if filters.brandID, err = parseOptionalID(values, "brand_id", false); err != nil {
		return filters, err
	}
	if allowShopID {
		if filters.shopID, err = parseOptionalID(values, "shop_id", false); err != nil {
			return filters, err
		}
	}
	if filters.minPrice, err = parseOptionalDecimal(values, "min_price", maxPrice); err != nil {
		return filters, err
	}
	if filters.maxPrice, err = parseOptionalDecimal(values, "max_price", maxPrice); err != nil {
		return filters, err
	}
	if filters.minPrice != nil && filters.maxPrice != nil && *filters.minPrice > *filters.maxPrice {
		return filters, fmt.Errorf("min_price must not exceed max_price")
	}
	if filters.minRating, err = parseOptionalDecimal(values, "min_rating", 5); err != nil {
		return filters, err
	}

	filters.sort, err = singleQuery(values, "sort")
	if err != nil {
		return filters, err
	}
	if !validProductSort(filters.sort) {
		return filters, fmt.Errorf("sort must be latest, best_selling, price_asc, or price_desc")
	}
	pageValues := url.Values{}
	for _, key := range []string{"page", "limit"} {
		value, valueErr := singleQuery(values, key)
		if valueErr != nil {
			return filters, valueErr
		}
		if value != "" {
			pageValues.Set(key, value)
		}
	}
	filters.page, filters.limit, err = parsePage(pageValues)
	return filters, err
}

func parseRequestQuery(r *http.Request) (url.Values, error) {
	return url.ParseQuery(r.URL.RawQuery)
}

func singleQuery(values url.Values, key string) (string, error) {
	items, exists := values[key]
	if !exists {
		return "", nil
	}
	if len(items) != 1 {
		return "", fmt.Errorf("%s must be provided once", key)
	}
	return strings.TrimSpace(items[0]), nil
}

func parseOptionalID(values url.Values, key string, allowZero bool) (int64, error) {
	value, err := singleQuery(values, key)
	if err != nil || value == "" {
		return 0, err
	}
	id, err := strconv.ParseInt(value, 10, 64)
	if err != nil || id < 0 || !allowZero && id == 0 {
		kind := "positive"
		if allowZero {
			kind = "non-negative"
		}
		return 0, fmt.Errorf("%s must be a %s integer", key, kind)
	}
	return id, nil
}

func parseOptionalDecimal(values url.Values, key string, maximum float64) (*float64, error) {
	value, err := singleQuery(values, key)
	if err != nil || value == "" {
		return nil, err
	}
	number, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(number) || math.IsInf(number, 0) || number < 0 || number > maximum {
		return nil, fmt.Errorf("%s must be between 0 and %v", key, maximum)
	}
	return &number, nil
}

func validProductSort(value string) bool {
	switch value {
	case "", "latest", "best_selling", "price_asc", "price_desc",
		"Latest Arrivals", "Best Selling", "Price: Low → High", "Price: High → Low":
		return true
	default:
		return false
	}
}

func validateAdminProductQuery(values url.Values) error {
	allowed := map[string]bool{
		"search": true, "category": true, "stock_status": true,
		"vendor": true, "sort_by": true,
	}
	for key, items := range values {
		if !allowed[key] {
			return fmt.Errorf("unsupported query parameter: %s", key)
		}
		if len(items) != 1 {
			return fmt.Errorf("%s must be provided once", key)
		}
		if utf8.RuneCountInString(strings.TrimSpace(items[0])) > maxSearchRunes {
			return fmt.Errorf("%s must be at most %d characters", key, maxSearchRunes)
		}
	}
	if sortBy := values.Get("sort_by"); sortBy != "" {
		switch sortBy {
		case "newest", "stock_asc", "stock_desc", "price_desc":
		default:
			return fmt.Errorf("sort_by must be newest, stock_asc, stock_desc, or price_desc")
		}
	}
	if stockStatus := values.Get("stock_status"); stockStatus != "" &&
		stockStatus != "in_stock" && stockStatus != "low_stock" && stockStatus != "out_of_stock" {
		return fmt.Errorf("stock_status must be in_stock, low_stock, or out_of_stock")
	}
	return nil
}

func escapeLike(value string) string {
	replacer := strings.NewReplacer("!", "!!", "%", "!%", "_", "!_")
	return replacer.Replace(value)
}

func (h handler) listProducts(w http.ResponseWriter, r *http.Request, forcedShopID int64) {
	values, err := parseRequestQuery(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_product_filters", "Query string is malformed")
		return
	}
	filters, err := parseProductFilters(values, forcedShopID != 0)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid_product_filters", err.Error())
		return
	}
	if forcedShopID != 0 && filters.shopID != 0 && filters.shopID != forcedShopID {
		writeError(w, http.StatusBadRequest, "invalid_shop_id", "shop_id must match the requested shop")
		return
	}
	if forcedShopID != 0 {
		filters.shopID = forcedShopID
	}

	conditions := []string{"p.status='ACTIVE'", "p.is_deleted=0", "s.status='ACTIVE'", "c.is_active=1"}
	args := make([]any, 0, 10)
	if filters.category > 0 {
		conditions = append(conditions, "p.category_id=?")
		args = append(args, filters.category)
	}
	if filters.brandID > 0 {
		conditions = append(conditions, "p.brand_id=?")
		args = append(args, filters.brandID)
	}
	if filters.shopID > 0 {
		conditions = append(conditions, "p.shop_id=?")
		args = append(args, filters.shopID)
	}
	if filters.minPrice != nil {
		conditions = append(conditions, "p.price>=?")
		args = append(args, *filters.minPrice)
	}
	if filters.maxPrice != nil {
		conditions = append(conditions, "p.price<=?")
		args = append(args, *filters.maxPrice)
	}
	if filters.minRating != nil {
		conditions = append(conditions, "p.rating_avg>=?")
		args = append(args, *filters.minRating)
	}
	if filters.search != "" {
		pattern := "%" + escapeLike(filters.search) + "%"
		conditions = append(conditions, "(p.name LIKE ? ESCAPE '!' OR COALESCE(p.description,'') LIKE ? ESCAPE '!' OR s.name LIKE ? ESCAPE '!')")
		args = append(args, pattern, pattern, pattern)
	}

	where := strings.Join(conditions, " AND ")
	baseQuery := ` FROM products p
		JOIN shops s ON s.id=p.shop_id
		JOIN categories c ON c.id=p.category_id
		WHERE ` + where
	var total int64
	if err = h.db.QueryRowContext(r.Context(), "SELECT COUNT(*)"+baseQuery, args...).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load products")
		return
	}

	offset := (filters.page - 1) * filters.limit
	query := `SELECT p.id,p.shop_id,p.category_id,p.brand_id,p.name,p.slug,p.description,p.thumbnail_url,p.price,p.sold_count,p.rating_avg,p.rating_count,p.status,NULL,p.is_deleted,s.name,c.name,
		(SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id AND v.status='ACTIVE')` +
		baseQuery + ` ORDER BY ` + productOrder(filters.sort) + ` LIMIT ? OFFSET ?`
	listArgs := append(append([]any(nil), args...), filters.limit, offset)
	rows, err := h.db.QueryContext(r.Context(), query, listArgs...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load products")
		return
	}
	defer rows.Close()
	items := []product{}
	for rows.Next() {
		var item product
		if err = rows.Scan(&item.ID, &item.ShopID, &item.CategoryID, &item.BrandID, &item.Name, &item.Slug, &item.Description, &item.ThumbnailURL, &item.Price, &item.SoldCount, &item.RatingAvg, &item.RatingCount, &item.Status, &item.RejectReason, &item.IsDeleted, &item.ShopName, &item.CategoryName, &item.Stock); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load products")
			return
		}
		items = append(items, item)
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load products")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"products": items, "total": total, "page": filters.page, "limit": filters.limit,
	}})
}

func activeShopExists(ctx context.Context, db *sql.DB, shopID int64) (bool, error) {
	var exists bool
	err := db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM shops WHERE id=? AND status='ACTIVE')`, shopID).Scan(&exists)
	return exists, err
}
