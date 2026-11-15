export type ShopVoucherType = "money" | "percent" | "shipping";

export type ShopVoucherStatus = "all" | "ongoing" | "upcoming" | "expired" | "paused";

export interface ShopVoucherItem {
  id: string;
  code: string;
  title: string;
  type: ShopVoucherType;
  amountText: string;
  minOrderAmount: number;
  minOrderText: string;
  discountValue: number;
  maxDiscountAmount?: number;
  expiryText: string;
  startDate?: string;
  expiryDate?: string;
  claimedByDefault?: boolean;
  description: string;
  badge?: string;
  usagePercent?: number;
  usageCount?: number;
  maxUsageCount?: number;
  status: "ongoing" | "upcoming" | "expired" | "paused";
}

export type VoucherFilterCategory = "all" | "money" | "percent" | "shipping";

export interface ShopVoucherStats {
  activeCount: number;
  totalUsage: number;
  voucherRevenue: number;
  discountSpent: number;
}

export interface CreateShopVoucherPayload {
  title: string;
  code: string;
  type: ShopVoucherType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  startDate: string;
  expiryDate: string;
  maxUsageCount: number;
  description: string;
  badge?: string;
}
