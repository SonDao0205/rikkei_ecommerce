export type ShopOrderStatus =
  | "all"
  | "pending"     // Chờ xác nhận
  | "packing"     // Đang chuẩn bị hàng / Đã xác nhận
  | "shipping"    // Đang giao hàng
  | "delivered"   // Đã giao / Hoàn thành
  | "cancelled"   // Đã huỷ
  | "returned";   // Trả hàng / Hoàn tiền

export type ShopOrderPaymentMethod = "COD" | "MOMO" | "VISA" | "ZALOPAY" | "BANKING";
export type ShopOrderCourier = "GHN" | "VIETTEL_POST" | "SPX" | "GHTK";

export interface ShopOrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
  email?: string;
  avatarText?: string;
  buyerNote?: string;
  orderCount?: number;
  tier?: string;
}

export interface ShopOrderProductItem {
  id: string | number;
  productId: number | string;
  name: string;
  variant: string;
  sku: string;
  imageUrl: string;
  price: number;
  formattedPrice: string;
  quantity: number;
  total: number;
  formattedTotal: string;
  warehouseStock?: number;
}

export interface ShopOrderFinancial {
  subtotal: number;
  shopDiscount: number;
  shippingFee: number;
  platformDiscount: number;
  grandTotal: number;
  platformFee: number;
  shopPayout: number;
  formattedShopPayout: string;
  paymentMethod: ShopOrderPaymentMethod;
  paymentStatus: "paid" | "unpaid" | "cod_pending" | "refunded";
  paymentStatusLabel: string;
}

export interface ShopOrderTimelineStep {
  step: number;
  title: string;
  time: string;
  description: string;
  status: "completed" | "current" | "pending";
}

export interface ShopOrderShipping {
  courier: ShopOrderCourier;
  courierLabel: string;
  trackingCode: string;
  servicePackage: string;
  estimatedDeliveryDate: string;
  weightGram: number;
  dimensionsText: string;
  timeline: ShopOrderTimelineStep[];
}

export interface ShopOrderItem {
  id: string; // e.g. "#ORD-9821"
  orderCode: string;
  createdAt: string;
  createdAtTime: string;
  timeAgo: string;
  status: ShopOrderStatus;
  statusLabel: string;
  customer: ShopOrderCustomerInfo;
  items: ShopOrderProductItem[];
  productSummary: string;
  totalQuantity: number;
  financial: ShopOrderFinancial;
  shipping: ShopOrderShipping;
  isUrgent?: boolean;
  cancelReason?: string;
}

export interface ShopOrderStatusCounts {
  all: number;
  pending: number;
  packing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface ShopOrderFilterParams {
  search?: string;
  statusTab?: ShopOrderStatus;
  dateRange?: string;
  paymentMethod?: string;
  courier?: string;
  page?: number;
  pageSize?: number;
}

