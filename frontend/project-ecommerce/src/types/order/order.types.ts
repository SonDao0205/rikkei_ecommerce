/**
 * User / Client Order Interfaces matching scriptDb.sql and my_order.html
 */
export type UserOrderStatusTab =
  | "all"
  | "pending"
  | "packing"
  | "shipping"
  | "completed"
  | "cancelled"
  | "returned";

export interface UserOrderShop {
  shopId: number;
  shopName: string;
  shopBadge?: "MALL" | "ARTISAN" | "OFFICIAL";
  logoUrl?: string;
}

export interface UserOrderItem {
  id: number;
  shopId: number;
  shopName: string;
  shopBadge?: "MALL" | "ARTISAN" | "OFFICIAL";
  productId: number;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  discountVoucherText?: string;
}

export interface UserOrderTimelineLog {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  isLatest?: boolean;
}

export interface UserOrderRecipient {
  name: string;
  phone: string;
  address: string;
  addressType: string;
  tag?: string;
  note?: string;
  notes?: string;
}

export interface UserOrder {
  id: number;
  orderCode: string;
  userId: number;
  status: UserOrderStatusTab;
  statusLabel: string;
  subtotal: number;
  shippingFee: number;
  shippingDiscount?: number;
  shopDiscount?: number;
  totalAmount: number;
  shippingCarrier?: string;
  paymentMethod: "COD" | "MOMO" | "VISA" | "ZALOPAY";
  paymentStatusText: string;
  shippingInfoText?: string;
  estimatedDeliveryDate?: string;
  courierName?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAtText?: string;
  note?: string;
  cancelReason?: string;
  cancelledAt?: string;
  items: UserOrderItem[];
  shops: UserOrderShop[];
  recipient?: UserOrderRecipient;
  timeline?: UserOrderTimelineLog[];
}

export interface ShopOrderGroup {
  shopId: number;
  shopName: string;
  shopAvatar?: string;
  logoUrl?: string;
  isMall?: boolean;
  isArtisan?: boolean;
  rating?: number;
  responseRate?: number;
  items: UserOrderItem[];
}

export type OrderItem = UserOrderItem;

export interface UserOrderStatusCounts {
  all: number;
  pending: number;
  packing: number;
  shipping: number;
  completed: number;
  cancelled: number;
  returned: number;
}

export interface UserOrderFilterParams {
  tab?: UserOrderStatusTab;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Admin Order Management Interfaces matching scriptDb.sql and admin_order.html
 */
export type OrderStatus = 'pending' | 'shipping' | 'delivered' | 'packing' | 'cancelled';
export type OrderPaymentMethod = 'COD' | 'MOMO' | 'VISA' | 'CARD';
export type OrderCourier = 'GHTK' | 'GHN' | 'VIETTEL_POST';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
}

export interface OrderLineItem {
  id?: number;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface AdminOrderItem {
  id: string; // e.g. "#ORD-9821"
  source: string; // e.g. "Web Store • GHTK", "TikTok Shop"
  hasCodAlert?: boolean;
  createdAt: string; // e.g. "27/10/2024"
  timeAgo: string; // e.g. "14:18 (15m trước)"
  customer: OrderCustomerInfo;
  shopName: string;
  productSummary: string;
  items: OrderLineItem[];
  paymentMethod: OrderPaymentMethod;
  paymentNote: string;
  totalAmount: number;
  formattedTotal: string;
  codAmount?: number;
  status: OrderStatus;
  statusLabel: string;
  courier: OrderCourier;
  courierLabel: string;
  trackingCode?: string;
}

export interface OrderStatusCounts {
  all: number;
  pending: number;
  shipping: number;
  delivered: number;
  cancelled: number;
}

export interface OrderFilterParams {
  search?: string;
  statusTab?: 'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled';
  dateRange?: string;
  paymentMethod?: string;
  vendor?: string;
  courier?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Order Detail Full Specification Interfaces matching admin_orderDetail.html
 */
export interface OrderDetailProductItem {
  id: number | string;
  name: string;
  image: string;
  tag?: string;
  tagType?: "emerald" | "sky" | "amber";
  variant: string;
  sku: string;
  warehouse: string;
  availableStock: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderDetailFinancial {
  subtotal: number;
  shippingFee: number;
  shippingRegion: string;
  insuranceFee: number;
  insuranceLabel: string;
  voucherCode: string;
  voucherDiscount: number;
  partnerDiscount: number;
  grandTotal: number;
  paymentStatus: string;
  paymentStatusType: "amber" | "emerald" | "rose";
  paymentNote?: string;
}

export interface OrderDetailCustomer {
  id: string;
  name: string;
  avatarText?: string;
  tier: string;
  orderCount: number;
  phone: string;
  street: string;
  administrativeArea: string;
  buyerNote?: string;
}

export interface OrderDetailTimelineStep {
  step: number;
  title: string;
  time: string;
  description: string;
  status: "completed" | "current" | "pending";
}

export interface OrderDetailShipping {
  courier: string;
  trackingCode: string;
  servicePackage: string;
  estimatedDelivery: string;
  timeline: OrderDetailTimelineStep[];
}

export interface AdminOrderDetailData {
  id: string;
  orderCode: string;
  status: OrderStatus;
  statusLabel: string;
  isUrgent?: boolean;
  urgentLabel?: string;
  createdAt: string;
  timeAgo: string;
  channel: string;
  paymentCode: string;
  shopName: string;
  shopCode: string;
  shopBadge: "verified" | "official";
  packageSpec: string;
  packageWeight: string;
  items: OrderDetailProductItem[];
  financial: OrderDetailFinancial;
  customer: OrderDetailCustomer;
  shipping: OrderDetailShipping;
}
