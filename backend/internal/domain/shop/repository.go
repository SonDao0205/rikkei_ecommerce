package shop

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
)

func (a *Handler) shopForOwner(r *http.Request, ownerID int64) (managedShop, error) {
	row := a.db.QueryRowContext(r.Context(), `SELECT s.id,s.owner_id,s.name,s.description,s.logo_url,s.banner_url,s.phone,
		s.warehouse_address,s.status,s.reject_reason,s.approval_notes,s.follower_count,s.approved_at,s.created_at,s.updated_at,
		u.full_name,u.email,u.phone
		FROM shops s JOIN users u ON u.id=s.owner_id WHERE s.owner_id=?`, ownerID)
	shop, err := scanManagedShop(row)
	if err != nil {
		return managedShop{}, err
	}
	var acceptedAt sql.NullTime
	var servicePolicy, authenticity, antiCounterfeit bool
	err = a.db.QueryRowContext(r.Context(), `SELECT terms_version,accepted_at,service_policy_accepted,authenticity_accepted,anti_counterfeit_accepted FROM shop_application_acceptances
		WHERE shop_id=? ORDER BY id DESC LIMIT 1`, shop.ID).Scan(&shop.TermsVersion, &acceptedAt, &servicePolicy, &authenticity, &antiCounterfeit)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return managedShop{}, err
	}
	if acceptedAt.Valid {
		value := acceptedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
		shop.TermsAcceptedAt = &value
		shop.TermsAccepted = shop.TermsVersion == sellerTermsVersion && servicePolicy && authenticity && antiCounterfeit
	}
	return shop, nil
}

func latestTermsAccepted(ctx context.Context, queryer interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}, shopID int64) (bool, error) {
	var version string
	var servicePolicy, authenticity, antiCounterfeit bool
	err := queryer.QueryRowContext(ctx, `SELECT terms_version,service_policy_accepted,authenticity_accepted,anti_counterfeit_accepted FROM shop_application_acceptances
		WHERE shop_id=? ORDER BY id DESC LIMIT 1`, shopID).Scan(&version, &servicePolicy, &authenticity, &antiCounterfeit)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return version == sellerTermsVersion && servicePolicy && authenticity && antiCounterfeit, err
}

func scanManagedShop(row scanner) (managedShop, error) {
	var shop managedShop
	var phone, rejectReason, approvalNotes, email sql.NullString
	var approvedTime sql.NullTime
	var createdAt, updatedAt sql.NullTime
	err := row.Scan(&shop.ID, &shop.OwnerID, &shop.Name, &shop.Description, &shop.LogoURL, &shop.BannerURL,
		&phone, &shop.WarehouseAddress, &shop.Status, &rejectReason, &approvalNotes, &shop.FollowerCount, &approvedTime,
		&createdAt, &updatedAt, &shop.OwnerName, &email, &shop.OwnerPhone)
	if err != nil {
		return managedShop{}, err
	}
	if phone.Valid {
		shop.Phone = &phone.String
	}
	if approvedTime.Valid {
		formatted := approvedTime.Time.UTC().Format("2006-01-02T15:04:05Z")
		shop.ApprovedAt = &formatted
	}
	if rejectReason.Valid {
		shop.RejectReason = &rejectReason.String
	}
	if approvalNotes.Valid {
		shop.ApprovalNotes = &approvalNotes.String
	}
	if email.Valid {
		shop.OwnerEmail = &email.String
	}
	if createdAt.Valid {
		shop.CreatedAt = createdAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	if updatedAt.Valid {
		shop.UpdatedAt = updatedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	return shop, nil
}
