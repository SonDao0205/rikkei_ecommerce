package order

import "time"

type OrderItemView struct {
	ID          int64   `json:"id"`
	ProductID   int64   `json:"product_id"`
	VariantID   int64   `json:"variant_id"`
	ProductName string  `json:"product_name"`
	VariantName string  `json:"variant_name,omitempty"`
	SKU         string  `json:"sku"`
	ImageURL    string  `json:"image_url,omitempty"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int64   `json:"quantity"`
	LineTotal   float64 `json:"line_total"`
}

type ShopOrderView struct {
	ID               int64           `json:"id"`
	OrderID          int64           `json:"order_id"`
	ShopID           int64           `json:"shop_id"`
	ShopName         string          `json:"shop_name"`
	ShopOrderCode    string          `json:"shop_order_code"`
	Status           string          `json:"status"`
	StatusLabel      string          `json:"status_label"`
	Subtotal         float64         `json:"subtotal"`
	ShippingFee      float64         `json:"shipping_fee"`
	ShopDiscount     float64         `json:"shop_discount"`
	PlatformDiscount float64         `json:"platform_discount"`
	TotalAmount      float64         `json:"total_amount"`
	CommissionRate   float64         `json:"commission_rate,omitempty"`
	CommissionAmount float64         `json:"commission_amount,omitempty"`
	SellerPayout     float64         `json:"seller_payout,omitempty"`
	Carrier          *string         `json:"carrier,omitempty"`
	TrackingCode     *string         `json:"tracking_code,omitempty"`
	CancelReason     *string         `json:"cancel_reason,omitempty"`
	ConfirmedAt      *time.Time      `json:"confirmed_at,omitempty"`
	PackedAt         *time.Time      `json:"packed_at,omitempty"`
	ShippedAt        *time.Time      `json:"shipped_at,omitempty"`
	CompletedAt      *time.Time      `json:"completed_at,omitempty"`
	CancelledAt      *time.Time      `json:"cancelled_at,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	Items            []OrderItemView `json:"items"`
}

type PaymentInfoView struct {
	ID             int64      `json:"id"`
	PaymentMethod  string     `json:"payment_method_code"`
	MethodName     string     `json:"payment_method_name"`
	Amount         float64    `json:"amount"`
	Status         string     `json:"status"`
	TransactionRef *string    `json:"transaction_ref,omitempty"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
}

type RefundInfoView struct {
	RefundStatus  string  `json:"refund_status"` // "NOT_APPLICABLE" | "REFUND_PROCESSING" | "REFUNDED"
	RefundMessage string  `json:"refund_message"`
	RefundAmount  float64 `json:"refund_amount,omitempty"`
}

type TimelineLogView struct {
	ID        int64     `json:"id"`
	Time      string    `json:"time"`
	Title     string    `json:"title"`
	Subtitle  string    `json:"subtitle,omitempty"`
	Note      string    `json:"note,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

type CustomerOrderSummary struct {
	ID                int64           `json:"id"`
	OrderCode         string          `json:"order_code"`
	Status            string          `json:"status"`
	StatusLabel       string          `json:"status_label"`
	Subtotal          float64         `json:"subtotal"`
	ShippingFee       float64         `json:"shipping_fee"`
	PlatformDiscount  float64         `json:"platform_discount"`
	ShopDiscountTotal float64         `json:"shop_discount_total"`
	TotalAmount       float64         `json:"total_amount"`
	RecipientName     string          `json:"recipient_name"`
	RecipientPhone    string          `json:"recipient_phone"`
	ShippingAddress   string          `json:"shipping_address"`
	PaymentMethodCode string          `json:"payment_method_code"`
	PaymentMethodName string          `json:"payment_method_name"`
	PaymentStatus     string          `json:"payment_status"`
	CreatedAt         time.Time       `json:"created_at"`
	Shops             []ShopOrderView `json:"shops"`
}

type CustomerOrderDetail struct {
	ID                int64             `json:"id"`
	OrderCode         string            `json:"order_code"`
	Status            string            `json:"status"`
	StatusLabel       string            `json:"status_label"`
	Subtotal          float64           `json:"subtotal"`
	ShippingFee       float64           `json:"shipping_fee"`
	PlatformDiscount  float64           `json:"platform_discount"`
	ShopDiscountTotal float64           `json:"shop_discount_total"`
	TotalAmount       float64           `json:"total_amount"`
	RecipientName     string            `json:"recipient_name"`
	RecipientPhone    string            `json:"recipient_phone"`
	ShippingAddress   string            `json:"shipping_address"`
	Note              *string           `json:"note,omitempty"`
	CreatedAt         time.Time         `json:"created_at"`
	UpdatedAt         time.Time         `json:"updated_at"`
	Payment           PaymentInfoView   `json:"payment"`
	RefundInfo        *RefundInfoView   `json:"refund_info,omitempty"`
	Shops             []ShopOrderView   `json:"shops"`
	Timeline          []TimelineLogView `json:"timeline"`
	ReturnRequests    []ReturnView      `json:"return_requests,omitempty"`
}

type SellerOrderView struct {
	ID                int64           `json:"id"`
	ShopOrderID       int64           `json:"shop_order_id"`
	OrderID           int64           `json:"order_id"`
	ShopID            int64           `json:"shop_id"`
	ShopOrderCode     string          `json:"shop_order_code"`
	ParentOrderCode   string          `json:"parent_order_code"`
	Status            string          `json:"status"`
	StatusLabel       string          `json:"status_label"`
	Subtotal          float64         `json:"subtotal"`
	ShippingFee       float64         `json:"shipping_fee"`
	ShopDiscount      float64         `json:"shop_discount"`
	PlatformDiscount  float64         `json:"platform_discount"`
	TotalAmount       float64         `json:"total_amount"`
	CommissionRate    float64         `json:"commission_rate"`
	CommissionAmount  float64         `json:"commission_amount"`
	SellerPayout      float64         `json:"seller_payout"`
	Carrier           *string         `json:"carrier,omitempty"`
	TrackingCode      *string         `json:"tracking_code,omitempty"`
	CancelReason      *string         `json:"cancel_reason,omitempty"`
	RecipientName     string          `json:"recipient_name"`
	RecipientPhone    string          `json:"recipient_phone"`
	ShippingAddress   string          `json:"shipping_address"`
	PaymentMethodCode string          `json:"payment_method_code"`
	PaymentMethodName string          `json:"payment_method_name"`
	PaymentStatus     string          `json:"payment_status"`
	ConfirmedAt       *time.Time      `json:"confirmed_at,omitempty"`
	PackedAt          *time.Time      `json:"packed_at,omitempty"`
	ShippedAt         *time.Time      `json:"shipped_at,omitempty"`
	CompletedAt       *time.Time      `json:"completed_at,omitempty"`
	CancelledAt       *time.Time      `json:"cancelled_at,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	Items             []OrderItemView `json:"items"`
}

type SellerOrderDetail struct {
	SellerOrderView
	BuyerNote      *string           `json:"buyer_note,omitempty"`
	Timeline       []TimelineLogView `json:"timeline"`
	ReturnRequests []ReturnView      `json:"return_requests,omitempty"`
}

type ReturnView struct {
	ID            int64     `json:"id"`
	ShopOrderID   int64     `json:"shop_order_id"`
	ShopOrderCode string    `json:"shop_order_code,omitempty"`
	UserID        int64     `json:"user_id"`
	UserName      string    `json:"user_name,omitempty"`
	UserPhone     string    `json:"user_phone,omitempty"`
	Type          string    `json:"type"` // "RETURN" | "EXCHANGE" | "REFUND"
	Reason        string    `json:"reason"`
	Status        string    `json:"status"` // "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED"
	RefundAmount  *float64  `json:"refund_amount,omitempty"`
	HandledBy     *int64    `json:"handled_by,omitempty"`
	HandledNote   *string   `json:"handled_note,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type OrderStatusCounts struct {
	All       int64 `json:"all"`
	Pending   int64 `json:"pending"`
	Confirmed int64 `json:"confirmed"`
	Packing   int64 `json:"packing"`
	Shipping  int64 `json:"shipping"`
	Completed int64 `json:"completed"`
	Cancelled int64 `json:"cancelled"`
	Returned  int64 `json:"returned"`
}

// Request bodies
type CancelOrderRequest struct {
	ShopOrderID *int64 `json:"shop_order_id,omitempty"`
	Reason      string `json:"reason"`
}

type ShipOrderRequest struct {
	Carrier      string `json:"carrier"`
	TrackingCode string `json:"tracking_code"`
}

type CreateReturnRequest struct {
	ShopOrderID  int64    `json:"shop_order_id"`
	Type         string   `json:"type"` // RETURN, EXCHANGE, REFUND
	Reason       string   `json:"reason"`
	RefundAmount *float64 `json:"refund_amount,omitempty"`
}

type HandleReturnRequest struct {
	Note string `json:"note"`
}
