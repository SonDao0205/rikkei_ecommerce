package shop

import (
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/platform/httpx"
	"strings"
	"unicode/utf8"
)

func validateShopProfile(w http.ResponseWriter, request *shopProfileRequest) bool {
	request.Name = strings.TrimSpace(request.Name)
	request.Description = strings.TrimSpace(request.Description)
	request.Phone = strings.TrimSpace(request.Phone)
	request.WarehouseAddress = strings.TrimSpace(request.WarehouseAddress)
	if !validTextLength(request.Name, 2, 150) {
		writeError(w, http.StatusBadRequest, "invalid_shop_name", "Shop name must be 2 to 150 characters")
		return false
	}
	if utf8.RuneCountInString(request.Description) > 2000 {
		writeError(w, http.StatusBadRequest, "invalid_shop_description", "Description must be at most 2000 characters")
		return false
	}
	if request.Phone != "" && !validPhone(request.Phone) {
		writeError(w, http.StatusBadRequest, "invalid_shop_phone", "Phone must contain 9 to 15 digits and may start with +")
		return false
	}
	if !validTextLength(request.WarehouseAddress, 5, 500) {
		writeError(w, http.StatusBadRequest, "invalid_warehouse_address", "Warehouse address must be 5 to 500 characters")
		return false
	}
	if !validateOptionalHTTPSURL(w, "logo_url", request.LogoURL, 500) ||
		!validateOptionalHTTPSURL(w, "banner_url", request.BannerURL, 500) {
		return false
	}
	if request.Phone == "" {
		request.Phone = ""
	}
	return true
}

func validateOptionalHTTPSURL(w http.ResponseWriter, field string, value *string, maxLength int) bool {
	if value == nil {
		return true
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		*value = ""
		return true
	}
	parsed, err := url.Parse(trimmed)
	if err != nil || len(trimmed) > maxLength || parsed.Scheme != "https" ||
		parsed.Host == "" || parsed.User != nil || parsed.Hostname() == "" {
		writeError(w, http.StatusBadRequest, "invalid_"+field, field+" must be an absolute HTTPS URL")
		return false
	}
	*value = trimmed
	return true
}

func validPhone(value string) bool { return httpx.ValidPhone(value) }

func validTextLength(value string, minimum, maximum int) bool {
	return httpx.ValidTextLength(value, minimum, maximum)
}
