export type ShopVoucherType = "money" | "percent" | "shipping";

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
  expiryDate?: string;
  claimedByDefault?: boolean;
  description: string;
  badge?: string;
  usagePercent?: number;
}

export type VoucherFilterCategory = "all" | "money" | "percent" | "shipping";

