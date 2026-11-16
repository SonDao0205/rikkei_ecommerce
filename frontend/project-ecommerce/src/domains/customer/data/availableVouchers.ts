import axiosClient from "@/shared/api/axiosClient";

export interface AvailableVoucher {
  id: number;
  code: string;
  scope: "PLATFORM" | "SHOP";
  shopId?: number;
  shopName?: string;
  title: string;
  description: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  endAt: string;
  badge?: string;
  highlightText: string;
}

interface BackendVoucher {
  id: number;
  code: string;
  scope: "PLATFORM" | "SHOP";
  shop_id: number | null;
  title: string;
  description: string | null;
  discount_type: "FIXED" | "PERCENT";
  discount_value: number;
  max_discount_amount: number | null;
  min_order_value: number;
  end_at: string;
}

const mapVoucher = (voucher: BackendVoucher): AvailableVoucher => {
  const value = Number(voucher.discount_value);
  const fixedLabel = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
  return {
    id: voucher.id,
    code: voucher.code,
    scope: voucher.scope,
    shopId: voucher.shop_id ?? undefined,
    title: voucher.title,
    description: voucher.description || "",
    discountType: voucher.discount_type,
    discountValue: value,
    maxDiscountAmount: voucher.max_discount_amount ?? undefined,
    minOrderValue: Number(voucher.min_order_value),
    endAt: voucher.end_at,
    badge: voucher.scope === "PLATFORM" ? "Toàn sàn" : "Cửa hàng",
    highlightText: voucher.discount_type === "PERCENT" ? `GIẢM ${value}%` : `GIẢM ${fixedLabel}₫`,
  };
};

async function fetchVouchers(params: { scope: "PLATFORM" | "SHOP"; shop_id?: number }): Promise<AvailableVoucher[]> {
  const response = await axiosClient.get<{ success: boolean; data: BackendVoucher[] }>("/api/v1/vouchers", { params });
  return (response.data.data || []).map(mapVoucher);
}

export const fetchPlatformVouchers = () => fetchVouchers({ scope: "PLATFORM" });
export const fetchShopVouchers = (shopId: number) => fetchVouchers({ scope: "SHOP", shop_id: shopId });
