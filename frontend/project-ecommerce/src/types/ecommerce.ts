/**
 * Database schema interfaces matching scriptDb.sql table definitions.
 */

export interface User {
  id: number;
  email: string | null;
  phone: string;
  password_hash?: string;
  full_name: string;
  avatar_url: string | null;
  email_verified: number;
  status: 'ACTIVE' | 'LOCKED';
  role: 'client' | 'seller' | 'admin';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'client' | 'seller' | 'admin';

export interface UserProfile {
  id: number;
  email: string | null;
  phone: string;
  full_name: string;
  avatar_url: string | null;
  email_verified: number;
  status: 'ACTIVE' | 'LOCKED';
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProfileDetails extends UserProfile {
  username?: string;
  phone_verified?: number;
  date_of_birth?: {
    day: string;
    month: string;
    year: string;
  };
  gender?: 'male' | 'female' | 'other';
  membership_tier?: string;
}

export interface UpdateProfilePayload {
  full_name: string;
  email?: string;
  phone?: string;
  username?: string;
  avatar_url?: string | null;
  date_of_birth?: {
    day: string;
    month: string;
    year: string;
  };
  gender?: 'male' | 'female' | 'other';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RequestPasswordResetPayload {
  identity: string;
  mode: "email" | "phone";
}

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
  identity: string;
  mode: "email" | "phone";
}

export interface VerifyPasswordResetOtpPayload {
  identity: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordPayload {
  identity: string;
  resetToken?: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  warehouse_address: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  reject_reason: string | null;
  follower_count: number;
  badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN';
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: number;
}

export interface Product {
  id: number;
  shop_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  sold_count: number;
  rating_avg: number;
  rating_count: number;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'HIDDEN' | 'REJECTED';
  reject_reason: string | null;
  is_deleted: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Extended Product item for UI rendering with relational & presentation data
 */
export interface ProductItem extends Product {
  category_name?: string;
  stock?: number;
  original_price?: number;
  discount_percent?: number;
  shop_name: string;
  shop_badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN' | 'VERIFIED';
  tag?: string;
  badge_info?: string;
  claimed_percentage?: number;
  stock_alert?: string;
  is_flash_sale?: boolean;
}

export interface AdminProductItem {
  id: number;
  name: string;
  sku: string;
  thumbnail_url: string | null;
  shop_name: string;
  shop_badge: 'MALL' | 'ARTISAN' | 'VERIFIED' | 'OFFICIAL';
  category_name: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
}

export interface InventoryStats {
  totalSkus: number;
  newThisMonth: number;
  activeListings: number;
  activePercentage: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/**
 * Admin Executive Dashboard Interfaces matching scriptDb.sql schema
 */
export type TimeRangeFilter = 'today' | '7d' | 'month' | 'ytd';
export type TrendMetricType = 'revenue' | 'volume';

export interface KpiCardRevenue {
  totalRevenue: number;
  formattedRevenue: string;
  changePercent: number;
  isPositive: boolean;
  comparisonLabel: string;
  targetRevenue: string;
  sparkline: number[];
}

export interface KpiCardOrders {
  totalOrders: number;
  codCount: number;
  codPercent: number;
  digitalCount: number;
  digitalPercent: number;
}

export interface KpiCardInventory {
  totalSkus: number;
  restockNeededCount: number;
  lowStockShops: { shopName: string; count: number }[];
}

export interface KpiCardCustomers {
  totalNew: number;
  changePercent: number;
  isPositive: boolean;
  comparisonLabel: string;
  mobilePercent: number;
  otpVerifiedCount: number;
  firstPurchaseCount: number;
}

export interface RevenueTrendItem {
  day: string;
  fullDate: string;
  codRevenue: number;
  digitalRevenue: number;
  totalRevenue: number;
  orderVolume: number;
  codHeight: number;
  digitalHeight: number;
  splineY: number;
  isToday?: boolean;
}

export interface CodSettlementItem {
  id: string;
  label: string;
  sublabel: string;
  count: number;
  amount: string;
  percentage: number;
  colorClass: string;
  dotColorClass: string;
  strokeDasharray: string;
  strokeDashoffset: string;
}

export interface OperationalAlertItem {
  id: string;
  type: 'shop_approval' | 'return_request' | 'inventory_warning' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  actionUrl?: string;
}

export interface MarketplaceActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timeAgo: string;
  tag?: string;
  tagColor?: string;
}

export interface AdminDashboardData {
  kpis: {
    revenue: KpiCardRevenue;
    orders: KpiCardOrders;
    inventory: KpiCardInventory;
    customers: KpiCardCustomers;
  };
  revenueTrend: {
    weekLabel: string;
    points: RevenueTrendItem[];
    avgBasketValue: string;
    codVolumePercent: number;
    digitalVolumePercent: number;
  };
  codSettlement: {
    totalActiveBatch: number;
    slices: CodSettlementItem[];
    lastSynced: string;
  };
  operations: OperationalAlertItem[];
  activities: MarketplaceActivityItem[];
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
 * Address Book Interfaces matching scriptDb.sql addresses table & address.html
 */
export type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

export interface Address {
  id: number;
  user_id?: number;
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street_detail: string;
  is_default: number | boolean;
  address_type?: AddressType;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressPayload {
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street_detail: string;
  is_default?: boolean | number;
  address_type?: AddressType;
}

export interface UpdateAddressPayload extends CreateAddressPayload {
  id: number;
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

/**
 * Admin Shop & Merchant Management Interfaces matching scriptDb.sql and admin_shop.html
 */
export type ShopTier = "STANDARD" | "PREMIUM" | "MALL" | "OFFICIAL";
export type AdminShopStatus =
  | "all"
  | "active"
  | "pending"
  | "suspended"
  | "rejected"
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "REJECTED";

export interface AdminShopItem {
  id: number;
  code: string; // e.g. "#VN-8821"
  name: string;
  description?: string;
  logo_url: string | null;
  tier: ShopTier;
  category: string;
  category_icon?: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  location: string;
  sku_count: number;
  sku_label?: string; // e.g. "12 Draft SKUs", "86 SKUs", "24 SKUs (Frozen)"
  order_count: number;
  order_label?: string; // e.g. "0 orders (New Registration)", "1,420 orders"
  rating_avg: number;
  rating_count: number;
  commission_rate: number; // e.g. 5, 8, 12
  commission_tier_label: string; // e.g. "8% Tier", "12% Mall Tier", "5% Standard"
  available_balance: number;
  settlement_cycle: string; // e.g. "Bi-weekly", "Weekly", "Escrow: 4.800.000 ₫"
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  status_label: string;
  is_live: boolean;
  tax_id?: string;
  identity_card?: string;
  business_license_url?: string;
  reject_reason?: string | null;
  created_at: string;
}

export interface ShopMetricStats {
  totalShops?: number;
  activeShops?: number;
  activeRateText?: string;
  pendingKycCount?: number;
  pendingActionRequired?: number;
  suspendedCount?: number;
  suspendedNote?: string;
  totalGmvFormatted?: string;
  totalGmvChange?: string;
  statusCounts?: {
    all: number;
    active: number;
    pending: number;
    suspended: number;
  };
  totalActive?: number;
  activeGrowth?: string;
  pendingKyc?: number;
  suspended?: number;
  totalGmv?: number;
  formattedGmv?: string;
  gmvGrowth?: string;
}

export interface ShopFilterParams {
  search?: string;
  statusTab?: AdminShopStatus;
  category?: string;
  commissionTier?: string;
  rating?: string;
  page?: number;
  pageSize?: number;
}





