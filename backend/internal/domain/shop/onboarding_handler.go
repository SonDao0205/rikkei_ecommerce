package shop

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"rikkei-ecommerce/internal/domain/auth"
	"rikkei-ecommerce/internal/platform/auditlog"
	"strconv"
)

func (a *Handler) createShopDraft(w http.ResponseWriter, r *http.Request) {
	var request shopProfileRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateShopProfile(w, &request) {
		return
	}
	user := auth.CurrentUser(r)
	ownerID, err := strconv.ParseInt(user.ID, 10, 64)
	if err != nil || ownerID <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	result, err := tx.ExecContext(r.Context(), `INSERT INTO shops
		(owner_id,name,description,logo_url,banner_url,phone,warehouse_address,status)
		VALUES(?,?,?,?,?,?,?,'DRAFT')`,
		ownerID, request.Name, nullableText(request.Description), request.LogoURL, request.BannerURL,
		request.Phone, request.WarehouseAddress)
	if err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "shop_already_exists", "This account or shop name is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	id, err := result.LastInsertId()
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = auditlog.Record(r.Context(), tx, user.ID, "SHOP_DRAFT_CREATED", "shop", id, nil, map[string]any{"status": "DRAFT"}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if shop.ID != id {
		a.serverError(w, r, fmt.Errorf("created shop ID mismatch"))
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"success": true, "data": shop, "message": "Shop draft created"})
}

func (a *Handler) myShop(w http.ResponseWriter, r *http.Request) {
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "shop_not_found", "You do not have a shop")
		return
	}
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop})
}

func (a *Handler) updateMyShop(w http.ResponseWriter, r *http.Request) {
	var request shopProfileRequest
	if !decode(w, r, &request) {
		return
	}
	if !validateShopProfile(w, &request) {
		return
	}
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()

	var shopID int64
	var status string
	if err = tx.QueryRowContext(r.Context(), `SELECT id,status FROM shops WHERE owner_id=? FOR UPDATE`, ownerID).Scan(&shopID, &status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "shop_not_found", "You do not have a shop")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if status != "DRAFT" && status != "REJECTED" && status != "NEEDS_INFO" && status != "PENDING" && status != "ACTIVE" {
		writeError(w, http.StatusConflict, "shop_not_editable", "This shop cannot be edited in its current state")
		return
	}
	_, err = tx.ExecContext(r.Context(), `UPDATE shops
		SET name=?,description=?,logo_url=?,banner_url=?,phone=?,warehouse_address=?
		WHERE id=? AND owner_id=?`,
		request.Name, nullableText(request.Description), request.LogoURL, request.BannerURL,
		request.Phone, request.WarehouseAddress, shopID, ownerID)
	if err != nil {
		if isMySQLDuplicate(err) {
			writeError(w, http.StatusConflict, "shop_name_in_use", "Shop name is already in use")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop profile updated"})
}

func (a *Handler) submitShop(w http.ResponseWriter, r *http.Request) {
	var request shopSubmitRequest
	if !decode(w, r, &request) {
		return
	}
	ownerID, ok := authenticatedID(w, r)
	if !ok {
		return
	}
	tx, err := a.db.BeginTx(r.Context(), nil)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	defer tx.Rollback()
	var shopID int64
	var status, ownerStatus string
	if err = tx.QueryRowContext(r.Context(), `SELECT s.id,s.status,u.status FROM shops s
		JOIN users u ON u.id=s.owner_id WHERE s.owner_id=? FOR UPDATE`, ownerID).Scan(&shopID, &status, &ownerStatus); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "shop_not_found", "Create a shop draft before submitting it")
			return
		}
		a.serverError(w, r, err)
		return
	}
	if ownerStatus != "ACTIVE" {
		writeError(w, http.StatusForbidden, "shop_owner_inactive", "An inactive account cannot submit a shop application")
		return
	}
	if status == "PENDING" {
		_ = tx.Rollback()
		shop, loadErr := a.shopForOwner(r, ownerID)
		if loadErr != nil {
			a.serverError(w, r, loadErr)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop application is already under review"})
		return
	}
	if status != "DRAFT" && status != "NEEDS_INFO" && status != "REJECTED" {
		writeError(w, http.StatusConflict, "shop_not_submittable", "This shop cannot be submitted in its current state")
		return
	}
	accepted, err := latestTermsAccepted(r.Context(), tx, shopID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	if request.Agreements != nil {
		if !request.Agreements.allAccepted() {
			writeError(w, http.StatusBadRequest, "shop_terms_required", "All seller terms must be accepted before submitting")
			return
		}
		if request.Agreements.Version != sellerTermsVersion {
			writeError(w, http.StatusBadRequest, "shop_terms_version_invalid", "The accepted seller terms version is not supported")
			return
		}
		_, err = tx.ExecContext(r.Context(), `INSERT INTO shop_application_acceptances
			(shop_id,owner_id,terms_version,service_policy_accepted,authenticity_accepted,anti_counterfeit_accepted,ip_address,user_agent)
			VALUES(?,?,?,?,?,?,?,?)`, shopID, ownerID, sellerTermsVersion, true, true, true,
			requestClientIP(r), truncate(r.UserAgent(), 512))
		if err != nil {
			a.serverError(w, r, err)
			return
		}
		accepted = true
	}
	if !accepted {
		writeError(w, http.StatusBadRequest, "shop_terms_required", "Accept the current seller terms before submitting this application")
		return
	}
	if _, err = tx.ExecContext(r.Context(), `UPDATE shops SET status='PENDING',reject_reason=NULL WHERE id=?`, shopID); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = auditlog.Record(r.Context(), tx, auth.CurrentUser(r).ID, "SHOP_APPLICATION_SUBMITTED", "shop", shopID,
		map[string]any{"status": status}, map[string]any{"status": "PENDING", "terms_version": sellerTermsVersion}); err != nil {
		a.serverError(w, r, err)
		return
	}
	if err = tx.Commit(); err != nil {
		a.serverError(w, r, err)
		return
	}
	shop, err := a.shopForOwner(r, ownerID)
	if err != nil {
		a.serverError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "data": shop, "message": "Shop application submitted"})
}

func authenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}
