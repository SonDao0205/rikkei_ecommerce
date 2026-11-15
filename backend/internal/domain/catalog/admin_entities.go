package catalog

import (
	"database/sql"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	"rikkei-ecommerce/internal/platform/auditlog"
	"rikkei-ecommerce/internal/platform/httpx"
)

var catalogNameSlug = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type brandRecord struct {
	ID       int64   `json:"id"`
	Name     string  `json:"name"`
	Slug     string  `json:"slug"`
	LogoURL  *string `json:"logo_url"`
	IsActive bool    `json:"is_active"`
}

type brandRequest struct {
	Name     string  `json:"name"`
	Slug     string  `json:"slug"`
	LogoURL  *string `json:"logo_url"`
	IsActive *bool   `json:"is_active"`
}

type attributeRecord struct {
	ID     int64                    `json:"id"`
	Name   string                   `json:"name"`
	Values []categoryAttributeValue `json:"values"`
}

func (h handler) publicBrands(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT id,name,slug,logo_url,is_active FROM brands WHERE is_active=1 ORDER BY name,id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
		return
	}
	defer rows.Close()
	brands := make([]brandRecord, 0)
	for rows.Next() {
		var item brandRecord
		if err = rows.Scan(&item.ID, &item.Name, &item.Slug, &item.LogoURL, &item.IsActive); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
			return
		}
		brands = append(brands, item)
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: brands})
}

func (h handler) adminBrands(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT id,name,slug,logo_url,is_active FROM brands ORDER BY name,id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
		return
	}
	defer rows.Close()
	brands := make([]brandRecord, 0)
	for rows.Next() {
		var item brandRecord
		if err = rows.Scan(&item.ID, &item.Name, &item.Slug, &item.LogoURL, &item.IsActive); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
			return
		}
		brands = append(brands, item)
	}
	if err = rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brands")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: brands})
}

func (h handler) createBrand(w http.ResponseWriter, r *http.Request) {
	var request brandRequest
	if !decodeJSON(w, r, &request, 1<<20) || !validateBrand(w, &request) {
		return
	}
	active := true
	if request.IsActive != nil {
		active = *request.IsActive
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create brand")
		return
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(r.Context(), `INSERT INTO brands(name,slug,logo_url,is_active) VALUES(?,?,?,?)`, request.Name, request.Slug, request.LogoURL, active)
	if err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "brand_conflict", "Brand name or slug is already in use")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create brand")
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create brand")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "BRAND_CREATED", "brand", id, nil, map[string]any{"name": request.Name, "slug": request.Slug, "is_active": active}); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not record brand audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not create brand")
		return
	}
	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: brandRecord{ID: id, Name: request.Name, Slug: request.Slug, LogoURL: request.LogoURL, IsActive: active}})
}

func (h handler) updateBrand(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "brand")
	if !ok {
		return
	}
	var request brandRequest
	if !decodeJSON(w, r, &request, 1<<20) || !validateBrand(w, &request) {
		return
	}
	active := true
	if request.IsActive != nil {
		active = *request.IsActive
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand")
		return
	}
	defer tx.Rollback()
	var previous brandRecord
	if err = tx.QueryRowContext(r.Context(), `SELECT id,name,slug,logo_url,is_active FROM brands WHERE id=? FOR UPDATE`, id).Scan(&previous.ID, &previous.Name, &previous.Slug, &previous.LogoURL, &previous.IsActive); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "brand_not_found", "Brand was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brand")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE brands SET name=?,slug=?,logo_url=?,is_active=? WHERE id=?`, request.Name, request.Slug, request.LogoURL, active, id); err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "brand_conflict", "Brand name or slug is already in use")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "BRAND_UPDATED", "brand", id, previous, map[string]any{"name": request.Name, "slug": request.Slug, "is_active": active}); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not record brand audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: brandRecord{ID: id, Name: request.Name, Slug: request.Slug, LogoURL: request.LogoURL, IsActive: active}})
}

func (h handler) setBrandStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "brand")
	if !ok {
		return
	}
	var request struct {
		IsActive *bool `json:"is_active"`
	}
	if !decodeJSON(w, r, &request, 4096) || request.IsActive == nil {
		writeError(w, http.StatusBadRequest, "invalid_request", "is_active must be provided")
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand status")
		return
	}
	defer tx.Rollback()
	var oldActive bool
	if err = tx.QueryRowContext(r.Context(), `SELECT is_active FROM brands WHERE id=? FOR UPDATE`, id).Scan(&oldActive); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "brand_not_found", "Brand was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load brand")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE brands SET is_active=? WHERE id=?`, *request.IsActive, id); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand status")
		return
	}
	if oldActive != *request.IsActive {
		if err = auditlog.Record(r.Context(), tx, h.userID(r), "BRAND_STATUS_CHANGED", "brand", id, map[string]any{"is_active": oldActive}, map[string]any{"is_active": *request.IsActive}); err != nil {
			writeError(w, http.StatusInternalServerError, "internal_error", "Could not record brand audit event")
			return
		}
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update brand status")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": id, "is_active": *request.IsActive}})
}

func (h handler) adminAttributes(w http.ResponseWriter, r *http.Request) {
	if !rejectUnexpectedQuery(w, r) {
		return
	}
	rows, err := h.db.QueryContext(r.Context(), `SELECT a.id,a.name,av.id,av.value FROM attributes a LEFT JOIN attribute_values av ON av.attribute_id=a.id ORDER BY a.name,a.id,av.id`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load attributes")
		return
	}
	defer rows.Close()
	items := make([]attributeRecord, 0)
	index := map[int64]int{}
	for rows.Next() {
		var id int64
		var name string
		var valueID sql.NullInt64
		var value sql.NullString
		if err = rows.Scan(&id, &name, &valueID, &value); err != nil {
			writeError(w, 500, "internal_error", "Could not load attributes")
			return
		}
		i, exists := index[id]
		if !exists {
			i = len(items)
			index[id] = i
			items = append(items, attributeRecord{ID: id, Name: name, Values: make([]categoryAttributeValue, 0)})
		}
		if valueID.Valid {
			items[i].Values = append(items[i].Values, categoryAttributeValue{ID: valueID.Int64, Value: value.String})
		}
	}
	if err = rows.Err(); err != nil {
		writeError(w, 500, "internal_error", "Could not load attributes")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: items})
}

func (h handler) createAttribute(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Name   string   `json:"name"`
		Values []string `json:"values"`
	}
	if !decodeJSON(w, r, &request, 1<<20) {
		writeError(w, 400, "invalid_request", "Request body must be valid JSON")
		return
	}
	request.Name = strings.TrimSpace(request.Name)
	if !httpx.ValidTextLength(request.Name, 1, 80) || len(request.Values) > 100 {
		writeError(w, 400, "invalid_attribute", "Name must be 1 to 80 characters and at most 100 values are allowed")
		return
	}
	values, ok := normalizeAttributeValues(w, request.Values)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not create attribute")
		return
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(r.Context(), `INSERT INTO attributes(name) VALUES(?)`, request.Name)
	if err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, 409, "attribute_conflict", "Attribute name is already in use")
		} else {
			writeError(w, 500, "internal_error", "Could not create attribute")
		}
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		writeError(w, 500, "internal_error", "Could not create attribute")
		return
	}
	createdValues := make([]categoryAttributeValue, 0, len(values))
	for _, value := range values {
		valueResult, insertErr := tx.ExecContext(r.Context(), `INSERT INTO attribute_values(attribute_id,value) VALUES(?,?)`, id, value)
		if insertErr != nil {
			writeError(w, 500, "internal_error", "Could not save attribute values")
			return
		}
		valueID, idErr := valueResult.LastInsertId()
		if idErr != nil {
			writeError(w, 500, "internal_error", "Could not read saved attribute value")
			return
		}
		createdValues = append(createdValues, categoryAttributeValue{ID: valueID, Value: value})
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "ATTRIBUTE_CREATED", "attribute", id, nil, map[string]any{"name": request.Name, "values": values}); err != nil {
		writeError(w, 500, "internal_error", "Could not record attribute audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, 500, "internal_error", "Could not create attribute")
		return
	}
	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: attributeRecord{ID: id, Name: request.Name, Values: createdValues}})
}

func (h handler) updateAttribute(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "attribute")
	if !ok {
		return
	}
	var request struct {
		Name string `json:"name"`
	}
	if !decodeJSON(w, r, &request, 4096) {
		writeError(w, http.StatusBadRequest, "invalid_request", "Request body must be valid JSON")
		return
	}
	request.Name = strings.TrimSpace(request.Name)
	if !httpx.ValidTextLength(request.Name, 1, 80) {
		writeError(w, http.StatusBadRequest, "invalid_attribute_name", "Attribute name must be 1 to 80 characters")
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update attribute")
		return
	}
	defer tx.Rollback()
	var oldName string
	if err = tx.QueryRowContext(r.Context(), `SELECT name FROM attributes WHERE id=? FOR UPDATE`, id).Scan(&oldName); errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "attribute_not_found", "Attribute was not found")
		return
	} else if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not load attribute")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE attributes SET name=? WHERE id=?`, request.Name, id); err != nil {
		if httpx.IsMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "attribute_conflict", "Attribute name is already in use")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update attribute")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "ATTRIBUTE_UPDATED", "attribute", id, map[string]any{"name": oldName}, map[string]any{"name": request.Name}); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not record attribute audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error", "Could not update attribute")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": id, "name": request.Name}})
}

func (h handler) addAttributeValues(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "attribute")
	if !ok {
		return
	}
	var request struct {
		Values []string `json:"values"`
	}
	if !decodeJSON(w, r, &request, 1<<20) {
		writeError(w, 400, "invalid_request", "Request body must be valid JSON")
		return
	}
	values, ok := normalizeAttributeValues(w, request.Values)
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not add attribute values")
		return
	}
	defer tx.Rollback()
	var name string
	if err = tx.QueryRowContext(r.Context(), `SELECT name FROM attributes WHERE id=? FOR UPDATE`, id).Scan(&name); errors.Is(err, sql.ErrNoRows) {
		writeError(w, 404, "attribute_not_found", "Attribute was not found")
		return
	} else if err != nil {
		writeError(w, 500, "internal_error", "Could not load attribute")
		return
	}
	createdValues := make([]categoryAttributeValue, 0, len(values))
	for _, value := range values {
		valueResult, insertErr := tx.ExecContext(r.Context(), `INSERT INTO attribute_values(attribute_id,value) VALUES(?,?)`, id, value)
		if insertErr != nil {
			if httpx.IsMySQLDuplicate(insertErr) {
				writeError(w, 409, "attribute_value_conflict", "An attribute value already exists")
			} else {
				writeError(w, 500, "internal_error", "Could not add attribute values")
			}
			return
		}
		valueID, idErr := valueResult.LastInsertId()
		if idErr != nil {
			writeError(w, 500, "internal_error", "Could not read saved attribute value")
			return
		}
		createdValues = append(createdValues, categoryAttributeValue{ID: valueID, Value: value})
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "ATTRIBUTE_VALUES_ADDED", "attribute", id, nil, map[string]any{"values": values}); err != nil {
		writeError(w, 500, "internal_error", "Could not record attribute audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, 500, "internal_error", "Could not add attribute values")
		return
	}
	writeJSON(w, http.StatusCreated, apiResponse{Success: true, Data: attributeRecord{ID: id, Name: name, Values: createdValues}})
}

func (h handler) deleteAttributeValue(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "attribute")
	if !ok {
		return
	}
	valueID, err := strconv.ParseInt(r.PathValue("valueId"), 10, 64)
	if err != nil || valueID <= 0 {
		writeError(w, 400, "invalid_attribute_value_id", "Value ID must be positive")
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute value")
		return
	}
	defer tx.Rollback()
	var used bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM variant_attribute_values WHERE attribute_value_id=?)`, valueID).Scan(&used); err != nil {
		writeError(w, 500, "internal_error", "Could not validate attribute value")
		return
	}
	if used {
		writeError(w, 409, "attribute_value_in_use", "Attribute value is used by a product variant")
		return
	}
	result, err := tx.ExecContext(r.Context(), `DELETE FROM attribute_values WHERE id=? AND attribute_id=?`, valueID, id)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute value")
		return
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		writeError(w, 404, "attribute_value_not_found", "Attribute value was not found")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "ATTRIBUTE_VALUE_DELETED", "attribute", id, nil, map[string]any{"value_id": valueID}); err != nil {
		writeError(w, 500, "internal_error", "Could not record attribute audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute value")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": valueID}})
}

func (h handler) deleteAttribute(w http.ResponseWriter, r *http.Request) {
	id, ok := parseEntityID(w, r, "attribute")
	if !ok {
		return
	}
	tx, err := h.db.BeginTx(r.Context(), nil)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute")
		return
	}
	defer tx.Rollback()
	var used bool
	if err = tx.QueryRowContext(r.Context(), `SELECT EXISTS(SELECT 1 FROM variant_attribute_values vav JOIN attribute_values av ON av.id=vav.attribute_value_id WHERE av.attribute_id=?)`, id).Scan(&used); err != nil {
		writeError(w, 500, "internal_error", "Could not validate attribute")
		return
	}
	if used {
		writeError(w, 409, "attribute_in_use", "Attribute is used by product variants and cannot be deleted")
		return
	}
	result, err := tx.ExecContext(r.Context(), `DELETE FROM attributes WHERE id=?`, id)
	if err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute")
		return
	}
	count, _ := result.RowsAffected()
	if count == 0 {
		writeError(w, 404, "attribute_not_found", "Attribute was not found")
		return
	}
	if err = auditlog.Record(r.Context(), tx, h.userID(r), "ATTRIBUTE_DELETED", "attribute", id, nil, nil); err != nil {
		writeError(w, 500, "internal_error", "Could not record attribute audit event")
		return
	}
	if err = tx.Commit(); err != nil {
		writeError(w, 500, "internal_error", "Could not delete attribute")
		return
	}
	writeJSON(w, http.StatusOK, apiResponse{Success: true, Data: map[string]any{"id": id}})
}

func validateBrand(w http.ResponseWriter, request *brandRequest) bool {
	request.Name = strings.TrimSpace(request.Name)
	request.Slug = strings.ToLower(strings.TrimSpace(request.Slug))
	if !httpx.ValidTextLength(request.Name, 1, 120) || !catalogNameSlug.MatchString(request.Slug) {
		writeError(w, 400, "invalid_brand", "Brand name or slug is invalid")
		return false
	}
	if request.LogoURL != nil {
		value := strings.TrimSpace(*request.LogoURL)
		if value != "" && !validCatalogHTTPSURL(value, 500) {
			writeError(w, 400, "invalid_brand_logo_url", "Logo URL must be a valid HTTPS URL")
			return false
		}
		if value == "" {
			request.LogoURL = nil
		} else {
			request.LogoURL = &value
		}
	}
	return true
}

func validCatalogHTTPSURL(value string, maxLength int) bool {
	parsed, err := url.Parse(value)
	return err == nil && len(value) <= maxLength && parsed.Scheme == "https" && parsed.Host != "" && parsed.User == nil && parsed.Hostname() != ""
}
func parseEntityID(w http.ResponseWriter, r *http.Request, entity string) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, 400, "invalid_"+entity+"_id", strings.Title(entity)+" ID must be positive")
		return 0, false
	}
	return id, true
}
func normalizeAttributeValues(w http.ResponseWriter, input []string) ([]string, bool) {
	if len(input) > 100 {
		writeError(w, 400, "too_many_attribute_values", "At most 100 values are allowed per request")
		return nil, false
	}
	seen := map[string]bool{}
	values := make([]string, 0, len(input))
	for _, raw := range input {
		value := strings.TrimSpace(raw)
		if !httpx.ValidTextLength(value, 1, 100) {
			writeError(w, 400, "invalid_attribute_value", "Each value must be 1 to 100 characters")
			return nil, false
		}
		key := strings.ToLower(value)
		if seen[key] {
			writeError(w, 400, "duplicate_attribute_value", "Attribute values must be unique in the request")
			return nil, false
		}
		seen[key] = true
		values = append(values, value)
	}
	if len(values) == 0 {
		writeError(w, 400, "empty_attribute_values", "At least one value is required")
		return nil, false
	}
	return values, true
}
