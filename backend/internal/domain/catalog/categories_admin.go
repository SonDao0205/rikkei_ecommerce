package catalog

import (
	"database/sql"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"rikkei-ecommerce/internal/platform/auditlog"
	"rikkei-ecommerce/internal/platform/httpx"
)

var categorySlugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type categoryRequest struct {
	ParentID  *int64  `json:"parent_id"`
	Name      string  `json:"name"`
	Slug      string  `json:"slug"`
	ImageURL  *string `json:"image_url"`
	SortOrder int     `json:"sort_order"`
	IsActive  *bool   `json:"is_active"`
}

func (h handler) adminCategories(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT id,parent_id,name,slug,image_url,sort_order,is_active
		FROM categories ORDER BY sort_order,id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load categories")
		return
	}
	defer rows.Close()
	items := make([]category, 0)
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

func (h handler) createCategory(w http.ResponseWriter, r *http.Request) {
	var request categoryRequest
	if !decodeJSON(w, r, &request, 1<<20) {
		writeError(w, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON")
		return
	}
	if !validateCategoryRequest(w, &request) {
		return
	}
	active := true
	if request.IsActive != nil {
		active = *request.IsActive
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create category")
		return
	}
	defer tx.Rollback()
	if !lockCategoryTree(w, r, tx) || !validateCategoryParent(w, r, tx, request.ParentID, 0, active) {
		return
	}
	result, err := tx.ExecContext(r.Context(), `INSERT INTO categories
		(parent_id,name,slug,image_url,sort_order,is_active) VALUES(?,?,?,?,?,?)`,
		request.ParentID, request.Name, request.Slug, request.ImageURL, request.SortOrder, active)
	if err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "category_slug_in_use", "Category slug is already in use")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create category")
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create category")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "CATEGORY_CREATED", "category", id, nil, categoryAuditValue(request.Name, request.Slug, request.ParentID, active)); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not record category audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create category")
		return
	}
	item, err := loadAdminCategory(r, h.db, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not reload category")
		return
	}
	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: item, Message: "Category created"})
}

func (h handler) updateCategory(w http.ResponseWriter, r *http.Request) {
	id, ok := parseCategoryID(w, r)
	if !ok {
		return
	}
	var request categoryRequest
	if !decodeJSON(w, r, &request, 1<<20) {
		writeError(w, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON")
		return
	}
	if !validateCategoryRequest(w, &request) {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category")
		return
	}
	defer tx.Rollback()
	if !lockCategoryTree(w, r, tx) {
		return
	}
	var previous category
	if err = tx.QueryRowContext(r.Context(), `SELECT id,parent_id,name,slug,image_url,sort_order,is_active FROM categories WHERE id=?`, id).
		Scan(&previous.ID, &previous.ParentID, &previous.Name, &previous.Slug, &previous.ImageURL, &previous.SortOrder, &previous.IsActive); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "category_not_found", "Category was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load category")
		return
	}
	active := previous.IsActive == 1
	if request.IsActive != nil {
		active = *request.IsActive
	}
	if !validateCategoryParent(w, r, tx, request.ParentID, id, active) {
		return
	}
	if !active && !ensureNoActiveChildren(w, r, tx, id) {
		return
	}
	_, err = tx.ExecContext(r.Context(), `UPDATE categories SET parent_id=?,name=?,slug=?,image_url=?,sort_order=?,is_active=? WHERE id=?`,
		request.ParentID, request.Name, request.Slug, request.ImageURL, request.SortOrder, active, id)
	if err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "category_slug_in_use", "Category slug is already in use")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "CATEGORY_UPDATED", "category", id,
		categoryAuditValue(previous.Name, previous.Slug, previous.ParentID, previous.IsActive == 1),
		categoryAuditValue(request.Name, request.Slug, request.ParentID, active)); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not record category audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update category")
		return
	}
	item, err := loadAdminCategory(r, h.db, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not reload category")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: item, Message: "Category updated"})
}

func (h handler) updateCategoryStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := parseCategoryID(w, r)
	if !ok {
		return
	}
	var request struct {
		IsActive *bool `json:"is_active"`
	}
	if !decodeJSON(w, r, &request, 1<<20) || request.IsActive == nil {
		writeError(w, http.StatusBadRequest, "invalid_request", "is_active must be provided as a boolean")
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not change category status")
		return
	}
	defer tx.Rollback()
	if !lockCategoryTree(w, r, tx) {
		return
	}
	var parentID *int64
	var currentActive bool
	if err = tx.QueryRowContext(r.Context(), `SELECT parent_id,is_active FROM categories WHERE id=?`, id).Scan(&parentID, &currentActive); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "category_not_found", "Category was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load category")
		return
	}
	if *request.IsActive && !validateCategoryParent(w, r, tx, parentID, id, true) {
		return
	}
	if !*request.IsActive && !ensureNoActiveChildren(w, r, tx, id) {
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE categories SET is_active=? WHERE id=?`, *request.IsActive, id); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not change category status")
		return
	}
	if currentActive != *request.IsActive {
		if err = auditlog.Record(r.Context(), tx, h.userID(r), "CATEGORY_STATUS_CHANGED", "category", id,
			map[string]any{"is_active": currentActive}, map[string]any{"is_active": *request.IsActive}); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not record category audit event")
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not change category status")
		return
	}
	item, err := loadAdminCategory(r, h.db, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not reload category")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: item, Message: "Category status updated"})
}

// DELETE is a soft delete: category IDs remain stable for existing product records.
func (h handler) deactivateCategory(w http.ResponseWriter, r *http.Request) {
	id, ok := parseCategoryID(w, r)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not deactivate category")
		return
	}
	defer tx.Rollback()
	if !lockCategoryTree(w, r, tx) {
		return
	}
	if !ensureNoActiveChildren(w, r, tx, id) {
		return
	}
	var exists struct {
		ID       int64
		IsActive bool
	}
	if err = tx.QueryRowContext(r.Context(), `SELECT id,is_active FROM categories WHERE id=?`, id).Scan(&exists.ID, &exists.IsActive); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "category_not_found", "Category was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load category")
		return
	}
	result, err := tx.ExecContext(r.Context(), `UPDATE categories SET is_active=0 WHERE id=?`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not deactivate category")
		return
	}
	if _, err = result.RowsAffected(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not verify category")
		return
	}
	if exists.IsActive {
		if err = auditlog.Record(r.Context(), tx, h.userID(r), "CATEGORY_DEACTIVATED", "category", id,
			map[string]any{"is_active": true}, map[string]any{"is_active": false}); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not record category audit event")
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not deactivate category")
		return
	}
	item, err := loadAdminCategory(r, h.db, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not reload category")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: item, Message: "Category deactivated; it can be reactivated by an administrator"})
}

func validateCategoryRequest(w http.ResponseWriter, request *categoryRequest) bool {
	request.Name = strings.TrimSpace(request.Name)
	request.Slug = strings.ToLower(strings.TrimSpace(request.Slug))
	if !httpx.ValidTextLength(request.Name, 2, 120) {
		writeError(w, http.StatusBadRequest, "invalid_category_name", "Category name must be 2 to 120 characters")
		return false
	}
	if len(request.Slug) > 150 || !categorySlugPattern.MatchString(request.Slug) || request.Slug == "all" {
		writeError(w, http.StatusBadRequest, "invalid_category_slug", "Slug must use lowercase letters, numbers, and single hyphens; 'all' is reserved")
		return false
	}
	if request.SortOrder < 0 || request.SortOrder > 100000 {
		writeError(w, http.StatusBadRequest, "invalid_category_sort_order", "sort_order must be between 0 and 100000")
		return false
	}
	if request.ImageURL != nil {
		value := strings.TrimSpace(*request.ImageURL)
		if value == "" {
			request.ImageURL = nil
		} else {
			parsed, err := url.Parse(value)
			if err != nil || len(value) > 500 || parsed.Scheme != "https" || parsed.Hostname() == "" || parsed.User != nil {
				writeError(w, http.StatusBadRequest, "invalid_category_image_url", "image_url must be an absolute HTTPS URL")
				return false
			}
			request.ImageURL = &value
		}
	}
	if request.ParentID != nil && *request.ParentID <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_category_parent", "parent_id must be a positive category ID or null")
		return false
	}
	return true
}

// Category administration is low-volume. Locking the current category rows makes
// parent changes and deactivation checks serialize, preventing concurrent cycles.
func lockCategoryTree(w http.ResponseWriter, r *http.Request, tx *sql.Tx) bool {
	rows, err := tx.QueryContext(r.Context(), `SELECT id FROM categories ORDER BY id FOR UPDATE`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not lock category tree")
		return false
	}
	defer rows.Close()
	for rows.Next() {
		var id int64
		if err = rows.Scan(&id); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not lock category tree")
			return false
		}
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not lock category tree")
		return false
	}
	if err = rows.Close(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not lock category tree")
		return false
	}
	return true
}

func validateCategoryParent(w http.ResponseWriter, r *http.Request, tx *sql.Tx, parentID *int64, categoryID int64, categoryActive bool) bool {
	if parentID == nil {
		return true
	}
	seen := make(map[int64]struct{})
	current := *parentID
	for current != 0 {
		if current == categoryID {
			writeError(w, http.StatusBadRequest, "category_parent_cycle", "A category cannot be its own ancestor")
			return false
		}
		if _, exists := seen[current]; exists {
			writeError(w, http.StatusConflict, "category_tree_invalid", "Existing category hierarchy contains a cycle")
			return false
		}
		seen[current] = struct{}{}
		var next sql.NullInt64
		var isActive bool
		err := tx.QueryRowContext(r.Context(), `SELECT parent_id,is_active FROM categories WHERE id=?`, current).Scan(&next, &isActive)
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusBadRequest, "invalid_category_parent", "Parent category was not found")
			return false
		}
		if err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate parent category")
			return false
		}
		if categoryActive && !isActive {
			writeError(w, http.StatusConflict, "inactive_parent_category", "An active category must have an active parent")
			return false
		}
		if next.Valid {
			current = next.Int64
		} else {
			current = 0
		}
	}
	return true
}

func ensureNoActiveChildren(w http.ResponseWriter, r *http.Request, tx *sql.Tx, id int64) bool {
	var children int
	if err := tx.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM categories WHERE parent_id=? AND is_active=1`, id).Scan(&children); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not validate child categories")
		return false
	}
	if children > 0 {
		writeError(w, http.StatusConflict, "category_has_active_children", "Deactivate or move active child categories before deactivating this category")
		return false
	}
	return true
}

func loadAdminCategory(r *http.Request, db *sql.DB, id int64) (category, error) {
	var item category
	err := db.QueryRowContext(r.Context(), `SELECT id,parent_id,name,slug,image_url,sort_order,is_active FROM categories WHERE id=?`, id).
		Scan(&item.ID, &item.ParentID, &item.Name, &item.Slug, &item.ImageURL, &item.SortOrder, &item.IsActive)
	return item, err
}

func categoryAuditValue(name, slug string, parentID *int64, active bool) map[string]any {
	return map[string]any{"name": name, "slug": slug, "parent_id": parentID, "is_active": active}
}
