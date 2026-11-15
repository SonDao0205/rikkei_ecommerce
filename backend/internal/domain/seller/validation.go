package seller

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"math"
	"net/http"
	"net/url"
	"rikkei-ecommerce/internal/platform/httpx"
	"sort"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"
)

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
	if request.VideoURL != nil {
		value := strings.TrimSpace(*request.VideoURL)
		if value != "" && !validHTTPSURL(value, 500) {
			writeError(w, http.StatusBadRequest, "invalid_product_video_url", "Product video URL must be an absolute HTTPS URL")
			return false
		}
		request.VideoURL = &value
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

func validTextLength(value string, minimum, maximum int) bool {
	return httpx.ValidTextLength(value, minimum, maximum)
}
