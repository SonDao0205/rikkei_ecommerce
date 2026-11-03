package catalog

import (
	"database/sql"
	"errors"
	"net/http"
	"sort"
	"strconv"
)

const maxCategoryAttributes = 10

type categoryAttributeValue struct {
	ID    int64  `json:"id"`
	Value string `json:"value"`
}

type categoryAttribute struct {
	ID       int64                    `json:"id"`
	Name     string                   `json:"name"`
	Required bool                     `json:"required"`
	Values   []categoryAttributeValue `json:"values"`
}

type categoryAttributeInput struct {
	AttributeID int64 `json:"attribute_id"`
	Required    bool  `json:"required"`
	SortOrder   int   `json:"sort_order"`
}

type categoryAttributeConfigRequest struct {
	Attributes []categoryAttributeInput `json:"attributes"`
}

func (h handler) categoryAttributes(w http.ResponseWriter, r *http.Request) {
	categoryID, ok := parseCategoryID(w, r)
	if !ok {
		return
	}
	attributes, err := loadCategoryAttributes(r, h.db, categoryID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "category_not_found", "Category was not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load category attributes")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"category_id": categoryID,
		"attributes":  attributes,
	}})
}

func (h handler) replaceCategoryAttributes(w http.ResponseWriter, r *http.Request) {
	categoryID, ok := parseCategoryID(w, r)
	if !ok {
		return
	}
	var request categoryAttributeConfigRequest
	if !decodeJSON(w, r, &request, 1<<20) {
		writeError(w, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON")
		return
	}
	if len(request.Attributes) > maxCategoryAttributes {
		writeError(w, http.StatusBadRequest, "too_many_category_attributes", "A category can have at most 10 variant attributes")
		return
	}
	attributeIDs := make(map[int64]struct{}, len(request.Attributes))
	for _, attribute := range request.Attributes {
		if attribute.AttributeID <= 0 || attribute.SortOrder < 0 || attribute.SortOrder > 1000 {
			writeError(w, http.StatusBadRequest, "invalid_category_attribute", "Attribute IDs must be positive and sort_order must be between 0 and 1000")
			return
		}
		if _, exists := attributeIDs[attribute.AttributeID]; exists {
			writeError(w, http.StatusBadRequest, "duplicate_category_attribute", "Each attribute can only be configured once")
			return
		}
		attributeIDs[attribute.AttributeID] = struct{}{}
	}

	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category attributes")
		return
	}
	defer tx.Rollback()

	var exists int
	if err = tx.QueryRowContext(r.Context(), `SELECT id FROM categories WHERE id=? FOR UPDATE`, categoryID).Scan(&exists); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "category_not_found", "Category was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category attributes")
		return
	}

	if len(attributeIDs) > 0 {
		placeholders, args := sqlPlaceholders(attributeIDs)
		var count int
		if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM attributes WHERE id IN (`+placeholders+`)`, args...).Scan(&count); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate category attributes")
			return
		}
		if count != len(attributeIDs) {
			writeError(w, http.StatusBadRequest, "invalid_category_attribute", "One or more attributes do not exist")
			return
		}
		if err = tx.QueryRowContext(r.Context(), `SELECT COUNT(DISTINCT attribute_id)
			FROM attribute_values WHERE attribute_id IN (`+placeholders+`)`, args...).Scan(&count); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate category attribute values")
			return
		}
		if count != len(attributeIDs) {
			writeError(w, http.StatusBadRequest, "category_attribute_without_values", "Every configured attribute must have at least one selectable value")
			return
		}
	}

	for _, attribute := range request.Attributes {
		if !attribute.Required {
			continue
		}
		var hasIncompleteVariants bool
		if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(
			SELECT 1 FROM products p
			JOIN product_variants v ON v.product_id=p.id AND v.status='ACTIVE'
			WHERE p.category_id=? AND p.is_deleted=0 AND NOT EXISTS(
				SELECT 1 FROM variant_attribute_values vav
				JOIN attribute_values av ON av.id=vav.attribute_value_id
				WHERE vav.variant_id=v.id AND av.attribute_id=?
			)
		)`, categoryID, attribute.AttributeID).Scan(&hasIncompleteVariants); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate existing product variants")
			return
		}
		if hasIncompleteVariants {
			writeError(w, http.StatusConflict, "required_attribute_in_use", "A required attribute must be present on every existing active variant before it can be enabled")
			return
		}
	}

	rows, err := tx.QueryContext(r.Context(), `SELECT DISTINCT av.attribute_id
		FROM products p
		JOIN product_variants v ON v.product_id=p.id
		JOIN variant_attribute_values vav ON vav.variant_id=v.id
		JOIN attribute_values av ON av.id=vav.attribute_value_id
		WHERE p.category_id=? AND p.is_deleted=0`, categoryID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate existing product variants")
		return
	}
	for rows.Next() {
		var usedAttributeID int64
		if err = rows.Scan(&usedAttributeID); err != nil {
			rows.Close()
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate existing product variants")
			return
		}
		if _, allowed := attributeIDs[usedAttributeID]; !allowed {
			rows.Close()
			writeError(w, http.StatusConflict, "category_attribute_in_use", "An attribute used by an existing product variant cannot be removed")
			return
		}
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate existing product variants")
		return
	}
	if err = rows.Close(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate existing product variants")
		return
	}

	if _, err = tx.ExecContext(r.Context(), `DELETE FROM category_attributes WHERE category_id=?`, categoryID); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category attributes")
		return
	}
	for _, attribute := range request.Attributes {
		if _, err = tx.ExecContext(r.Context(), `INSERT INTO category_attributes
			(category_id,attribute_id,is_required,sort_order) VALUES(?,?,?,?)`,
			categoryID, attribute.AttributeID, attribute.Required, attribute.SortOrder); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category attributes")
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category attributes")
		return
	}
	attributes, err := loadCategoryAttributes(r, h.db, categoryID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not reload category attributes")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{
		"category_id": categoryID,
		"attributes":  attributes,
	}})
}

func loadCategoryAttributes(r *http.Request, db *sql.DB, categoryID int64) ([]categoryAttribute, error) {
	var active bool
	if err := db.QueryRowContext(r.Context(), `SELECT is_active FROM categories WHERE id=?`, categoryID).Scan(&active); err != nil {
		return nil, err
	}
	if !active {
		return nil, sql.ErrNoRows
	}
	rows, err := db.QueryContext(r.Context(), `SELECT a.id,a.name,ca.is_required,av.id,av.value
		FROM category_attributes ca
		JOIN attributes a ON a.id=ca.attribute_id
		LEFT JOIN attribute_values av ON av.attribute_id=a.id
		WHERE ca.category_id=?
		ORDER BY ca.sort_order,a.id,av.id`, categoryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	attributes := make([]categoryAttribute, 0)
	indexByID := make(map[int64]int)
	for rows.Next() {
		var attributeID int64
		var name string
		var required bool
		var valueID sql.NullInt64
		var value sql.NullString
		if err = rows.Scan(&attributeID, &name, &required, &valueID, &value); err != nil {
			return nil, err
		}
		index, exists := indexByID[attributeID]
		if !exists {
			index = len(attributes)
			indexByID[attributeID] = index
			attributes = append(attributes, categoryAttribute{
				ID: attributeID, Name: name, Required: required, Values: make([]categoryAttributeValue, 0),
			})
		}
		if valueID.Valid && value.Valid {
			attributes[index].Values = append(attributes[index].Values, categoryAttributeValue{
				ID: valueID.Int64, Value: value.String,
			})
		}
	}
	return attributes, rows.Err()
}

func parseCategoryID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_category_id", "Category ID must be a positive integer")
		return 0, false
	}
	return id, true
}

func sqlPlaceholders(ids map[int64]struct{}) (string, []any) {
	ordered := make([]int64, 0, len(ids))
	for id := range ids {
		ordered = append(ordered, id)
	}
	sort.Slice(ordered, func(i, j int) bool { return ordered[i] < ordered[j] })
	args := make([]any, len(ordered))
	for i, id := range ordered {
		args[i] = id
	}
	placeholders := "?"
	for i := 1; i < len(ordered); i++ {
		placeholders += ",?"
	}
	return placeholders, args
}
