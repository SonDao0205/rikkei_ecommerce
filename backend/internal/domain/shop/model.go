package shop

import (
	"database/sql"
	"log"
)

const sellerTermsVersion = "seller-onboarding-v1"

type Handler struct {
	db     *sql.DB
	logger *log.Logger
}

type shopProfileRequest struct {
	Name             string  `json:"name"`
	Description      string  `json:"description"`
	LogoURL          *string `json:"logo_url"`
	BannerURL        *string `json:"banner_url"`
	Phone            string  `json:"phone"`
	WarehouseAddress string  `json:"warehouse_address"`
}

type managedShop struct {
	ID               int64   `json:"id"`
	OwnerID          int64   `json:"owner_id,omitempty"`
	Name             string  `json:"name"`
	Description      *string `json:"description"`
	LogoURL          *string `json:"logo_url"`
	BannerURL        *string `json:"banner_url"`
	Phone            *string `json:"phone"`
	WarehouseAddress *string `json:"warehouse_address,omitempty"`
	Status           string  `json:"status"`
	RejectReason     *string `json:"reject_reason,omitempty"`
	ApprovalNotes    *string `json:"approval_notes,omitempty"`
	FollowerCount    int64   `json:"follower_count"`
	ApprovedAt       *string `json:"approved_at"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
	OwnerName        string  `json:"owner_name,omitempty"`
	OwnerEmail       *string `json:"owner_email,omitempty"`
	OwnerPhone       string  `json:"owner_phone,omitempty"`
	TermsAccepted    bool    `json:"terms_accepted"`
	TermsVersion     string  `json:"terms_version,omitempty"`
	TermsAcceptedAt  *string `json:"terms_accepted_at,omitempty"`
}

type shopStatusRequest struct {
	Status       string `json:"status"`
	RejectReason string `json:"reject_reason"`
	Notes        string `json:"notes"`
}

type shopSubmitRequest struct {
	Agreements *sellerTermsAcceptance `json:"agreements"`
}

type sellerTermsAcceptance struct {
	Version         string `json:"version"`
	ServicePolicy   bool   `json:"service_policy"`
	Authenticity    bool   `json:"authenticity"`
	AntiCounterfeit bool   `json:"anti_counterfeit"`
}

func (a sellerTermsAcceptance) allAccepted() bool {
	return a.ServicePolicy && a.Authenticity && a.AntiCounterfeit
}

type scanner interface {
	Scan(dest ...any) error
}
