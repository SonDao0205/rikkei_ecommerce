package seller

const (
	maxProductImages   = 10
	maxProductVariants = 50
	maxVariantAttrs    = 10
)

type sellerProductRequest struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	CategoryID  int64                  `json:"category_id"`
	BrandID     *int64                 `json:"brand_id"`
	Price       float64                `json:"price"`
	VideoURL    *string                `json:"video_url"`
	Images      []sellerProductImage   `json:"images"`
	Variants    []sellerProductVariant `json:"variants"`
}

type sellerProductImage struct {
	URL       string `json:"url"`
	IsPrimary bool   `json:"is_primary"`
}

type sellerProductVariant struct {
	ID                *int64  `json:"id,omitempty"`
	SKU               string  `json:"sku"`
	Name              string  `json:"name"`
	Price             float64 `json:"price"`
	Stock             int     `json:"stock"`
	ImageURL          *string `json:"image_url"`
	AttributeValueIDs []int64 `json:"attribute_value_ids"`
}

type sellerProduct struct {
	ID          int64                  `json:"id"`
	ShopID      int64                  `json:"shop_id"`
	CategoryID  int64                  `json:"category_id"`
	BrandID     *int64                 `json:"brand_id"`
	Name        string                 `json:"name"`
	Slug        string                 `json:"slug"`
	Description *string                `json:"description"`
	Thumbnail   *string                `json:"thumbnail_url"`
	VideoURL    *string                `json:"video_url"`
	Price       float64                `json:"price"`
	Status      string                 `json:"status"`
	Images      []sellerProductImage   `json:"images"`
	Variants    []sellerProductVariant `json:"variants"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
}
