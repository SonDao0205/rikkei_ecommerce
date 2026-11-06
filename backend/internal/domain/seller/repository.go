package seller

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"rikkei-ecommerce/internal/domain/auth"
	"strconv"
	"strings"
)

func activeSellerShop(w http.ResponseWriter, r *http.Request, a *Handler) (int64, bool) {
	userID, ok := sellerAuthenticatedID(w, r)
	if !ok {
		return 0, false
	}
	var shopID int64
	err := a.db.QueryRowContext(r.Context(), `SELECT s.id FROM shops s JOIN users u ON u.id=s.owner_id
		JOIN user_roles ur ON ur.user_id=u.id AND ur.role_code='SELLER'
		WHERE s.owner_id=? AND s.status='ACTIVE' AND u.status='ACTIVE'`, userID).Scan(&shopID)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusForbidden, "active_shop_required", "An approved active shop is required")
		return 0, false
	}
	if err != nil {
		a.serverError(w, r, err)
		return 0, false
	}
	return shopID, true
}

func scanSellerProduct(row scanner) (sellerProduct, error) {
	var product sellerProduct
	var description, thumbnail sql.NullString
	var brandID sql.NullInt64
	var createdAt, updatedAt sql.NullTime
	err := row.Scan(&product.ID, &product.ShopID, &product.CategoryID, &brandID, &product.Name, &product.Slug,
		&description, &thumbnail, &product.Price, &product.Status, &createdAt, &updatedAt)
	if err != nil {
		return sellerProduct{}, err
	}
	if brandID.Valid {
		product.BrandID = &brandID.Int64
	}
	if description.Valid {
		product.Description = &description.String
	}
	if thumbnail.Valid {
		product.Thumbnail = &thumbnail.String
	}
	if createdAt.Valid {
		product.CreatedAt = createdAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	if updatedAt.Valid {
		product.UpdatedAt = updatedAt.Time.UTC().Format("2006-01-02T15:04:05Z")
	}
	product.Images = []sellerProductImage{}
	product.Variants = []sellerProductVariant{}
	return product, nil
}

func (a *Handler) sellerProductForOwner(r *http.Request, shopID, productID int64) (sellerProduct, error) {
	return scanSellerProduct(a.db.QueryRowContext(r.Context(), `SELECT id,shop_id,category_id,brand_id,name,slug,
		description,thumbnail_url,price,status,created_at,updated_at FROM products
		WHERE id=? AND shop_id=? AND is_deleted=0`, productID, shopID))
}

func (a *Handler) loadProductChildren(r *http.Request, shopID int64, product *sellerProduct) error {
	rows, err := a.db.QueryContext(r.Context(), `SELECT i.url,i.is_primary FROM product_images i
		JOIN products p ON p.id=i.product_id WHERE i.product_id=? AND p.shop_id=? ORDER BY i.sort_order,i.id`,
		product.ID, shopID)
	if err != nil {
		return err
	}
	for rows.Next() {
		var image sellerProductImage
		if err = rows.Scan(&image.URL, &image.IsPrimary); err != nil {
			rows.Close()
			return err
		}
		product.Images = append(product.Images, image)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	rows, err = a.db.QueryContext(r.Context(), `SELECT v.id,v.sku,COALESCE(v.name,''),v.price,v.stock,v.image_url
		FROM product_variants v JOIN products p ON p.id=v.product_id
		WHERE v.product_id=? AND p.shop_id=? ORDER BY v.id`, product.ID, shopID)
	if err != nil {
		return err
	}
	for rows.Next() {
		var variant sellerProductVariant
		var variantID int64
		var imageURL sql.NullString
		if err = rows.Scan(&variantID, &variant.SKU, &variant.Name, &variant.Price, &variant.Stock, &imageURL); err != nil {
			return err
		}
		variant.ID = &variantID
		variant.AttributeValueIDs = []int64{}
		if imageURL.Valid {
			variant.ImageURL = &imageURL.String
		}
		product.Variants = append(product.Variants, variant)
	}
	if err = rows.Err(); err != nil {
		rows.Close()
		return err
	}
	if err = rows.Close(); err != nil {
		return err
	}
	variantIDs := make([]int64, 0, len(product.Variants))
	variantIndex := make(map[int64]int, len(product.Variants))
	for index, variant := range product.Variants {
		variantIDs = append(variantIDs, *variant.ID)
		variantIndex[*variant.ID] = index
	}
	if len(variantIDs) == 0 {
		return nil
	}
	placeholders := strings.TrimSuffix(strings.Repeat("?,", len(variantIDs)), ",")
	args := make([]any, len(variantIDs))
	for index, id := range variantIDs {
		args[index] = id
	}
	query := fmt.Sprintf(`SELECT variant_id,attribute_value_id FROM variant_attribute_values
		WHERE variant_id IN (%s) ORDER BY variant_id,attribute_value_id`, placeholders)
	attributeRows, err := a.db.QueryContext(r.Context(), query, args...)
	if err != nil {
		return err
	}
	defer attributeRows.Close()
	for attributeRows.Next() {
		var variantID, valueID int64
		if err = attributeRows.Scan(&variantID, &valueID); err != nil {
			return err
		}
		if index, exists := variantIndex[variantID]; exists {
			product.Variants[index].AttributeValueIDs = append(product.Variants[index].AttributeValueIDs, valueID)
		}
	}
	return attributeRows.Err()
}

func persistProductChildren(r *http.Request, tx *sql.Tx, productID int64, request *sellerProductRequest) error {
	for index, image := range request.Images {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO product_images(product_id,url,sort_order,is_primary) VALUES(?,?,?,?)`,
			productID, image.URL, index, image.IsPrimary); err != nil {
			return err
		}
	}
	return persistVariantSet(r, tx, productID, request.Variants, false)
}

func disableAndReplaceVariants(r *http.Request, tx *sql.Tx, productID int64, request *sellerProductRequest) error {
	if _, err := tx.ExecContext(r.Context(), `UPDATE product_variants SET status='INACTIVE' WHERE product_id=?`, productID); err != nil {
		return err
	}
	for index, image := range request.Images {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO product_images(product_id,url,sort_order,is_primary) VALUES(?,?,?,?)`,
			productID, image.URL, index, image.IsPrimary); err != nil {
			return err
		}
	}
	return persistVariantSet(r, tx, productID, request.Variants, true)
}

func persistVariantSet(r *http.Request, tx *sql.Tx, productID int64, variants []sellerProductVariant, updating bool) error {
	for index := range variants {
		variant := &variants[index]
		var variantID int64
		var oldStock int
		if updating && variant.ID != nil {
			if err := tx.QueryRowContext(r.Context(), `SELECT id,stock FROM product_variants
				WHERE id=? AND product_id=? FOR UPDATE`, *variant.ID, productID).Scan(&variantID, &oldStock); err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					return errInvalidProductRelation
				}
				return err
			}
			if _, err := tx.ExecContext(r.Context(), `UPDATE product_variants SET sku=?,name=?,price=?,stock=?,image_url=?,status='ACTIVE'
				WHERE id=? AND product_id=?`, variant.SKU, nullableText(variant.Name), variant.Price, variant.Stock,
				nullableOptionalText(variant.ImageURL), variantID, productID); err != nil {
				return err
			}
		} else {
			result, err := tx.ExecContext(r.Context(), `INSERT INTO product_variants(product_id,sku,name,price,stock,image_url)
				VALUES(?,?,?,?,?,?)`, productID, variant.SKU, nullableText(variant.Name), variant.Price,
				variant.Stock, nullableOptionalText(variant.ImageURL))
			if err != nil {
				return err
			}
			variantID, err = result.LastInsertId()
			if err != nil {
				return err
			}
		}
		stockChange := variant.Stock
		if updating && variant.ID != nil {
			stockChange -= oldStock
		}
		if stockChange != 0 {
			if _, err := tx.ExecContext(r.Context(), `INSERT INTO stock_movements(variant_id,change_qty,stock_after,reason,created_by)
				VALUES(?,?,?,'ADJUST',?)`, variantID, stockChange, variant.Stock, currentUserID(r)); err != nil {
				return err
			}
		}
		if _, err := tx.ExecContext(r.Context(), `DELETE FROM variant_attribute_values WHERE variant_id=?`, variantID); err != nil {
			return err
		}
		if err := persistVariantAttributes(r, tx, variantID, variant.AttributeValueIDs); err != nil {
			return err
		}
	}
	return nil
}

func persistVariantAttributes(r *http.Request, tx *sql.Tx, variantID int64, ids []int64) error {
	for _, id := range ids {
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO variant_attribute_values(variant_id,attribute_value_id) VALUES(?,?)`, variantID, id); err != nil {
			return err
		}
	}
	return nil
}

func currentUserID(r *http.Request) int64 {
	id, _ := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	return id
}

func primaryImage(images []sellerProductImage) string {
	for _, image := range images {
		if image.IsPrimary {
			return image.URL
		}
	}
	return ""
}

func parseSellerProductID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusBadRequest, "invalid_product_id", "Product ID must be a positive integer")
		return 0, false
	}
	return id, true
}

type scanner interface {
	Scan(dest ...any) error
}

func sellerAuthenticatedID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(auth.CurrentUser(r).ID, 10, 64)
	if err != nil || id <= 0 {
		writeError(w, http.StatusUnauthorized, "unauthorized", "Authenticated user is invalid")
		return 0, false
	}
	return id, true
}
