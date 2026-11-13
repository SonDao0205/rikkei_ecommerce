import axiosClient from "@/shared/api/axiosClient";
import type {
  ShopVoucherItem,
  ShopVoucherStats,
  CreateShopVoucherPayload,
} from "@/domains/shop/types/shopVoucher.types";

interface VoucherRecord {
  id: number;
  code: string;
  scope: "PLATFORM" | "SHOP";
  shop_id: number | null;
  title: string;
  description: string | null;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_discount_amount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  usage_per_user: number;
  used_count: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
}

interface ApiEnvelope<T> { success: boolean; data: T }

const dateOnly = (value: string) => value.slice(0, 10);
const mapVoucher = (v: VoucherRecord): ShopVoucherItem => {
  const now = Date.now();
  const start = new Date(v.start_at).getTime();
  const end = new Date(v.end_at).getTime();
  const status = !v.is_active ? "paused" : now < start ? "upcoming" : now >= end ? "expired" : "ongoing";
  const percent = v.discount_type === "PERCENT";
  const amountText = percent
    ? `GIẢM ${v.discount_value}%${v.max_discount_amount ? ` tối đa ${v.max_discount_amount.toLocaleString("vi-VN")} ₫` : ""}`
    : `GIẢM ${v.discount_value.toLocaleString("vi-VN")} ₫`;
  return {
    id: String(v.id), code: v.code, title: v.title, type: percent ? "percent" : "money",
    amountText, minOrderAmount: v.min_order_value, minOrderText: `Đơn tối thiểu ${v.min_order_value.toLocaleString("vi-VN")} ₫`,
    discountValue: v.discount_value, maxDiscountAmount: v.max_discount_amount ?? undefined,
    startDate: dateOnly(v.start_at), expiryDate: dateOnly(v.end_at), expiryText: `HSD: ${dateOnly(v.end_at)}`,
    description: v.description ?? "", usageCount: v.used_count, maxUsageCount: v.usage_limit ?? undefined,
    usagePercent: v.usage_limit ? Math.min(100, Math.round(v.used_count * 100 / v.usage_limit)) : 0,
    status,
  };
};

const toPayload = (payload: CreateShopVoucherPayload) => ({
  code: payload.code.trim().toUpperCase(), title: payload.title.trim(), description: payload.description.trim(),
  discount_type: payload.type === "percent" ? "PERCENT" : "FIXED",
  discount_value: payload.discountValue, max_discount_amount: payload.type === "percent" ? payload.maxDiscountAmount ?? null : null,
  min_order_value: payload.minOrderAmount, usage_limit: payload.maxUsageCount || null, usage_per_user: 1,
  start_at: `${payload.startDate}T00:00:00Z`, end_at: `${payload.expiryDate}T23:59:59Z`,
});

export const shopVoucherApi = {
  async getPublicShopVouchers(shopId: number): Promise<ShopVoucherItem[]> {
    const { data } = await axiosClient.get<ApiEnvelope<VoucherRecord[]>>("/api/v1/vouchers", { params: { scope: "SHOP", shop_id: shopId } });
    return (data.data ?? []).map(mapVoucher);
  },
  async getClaimedVoucherIDs(): Promise<string[]> {
    const { data } = await axiosClient.get<ApiEnvelope<VoucherRecord[]>>("/api/v1/me/vouchers");
    return (data.data ?? []).map((voucher) => String(voucher.id));
  },
  async claimShopVoucher(voucherId: string): Promise<{ success: boolean; message: string }> {
    await axiosClient.post(`/api/v1/me/vouchers/${voucherId}/claim`);
    return { success: true, message: "Đã lưu voucher vào ví ưu đãi của bạn." };
  },
  async getShopVouchers(): Promise<ShopVoucherItem[]> {
    const { data } = await axiosClient.get<ApiEnvelope<VoucherRecord[]>>("/api/v1/seller/vouchers");
    return (data.data ?? []).map(mapVoucher);
  },
  async getShopVoucherStats(): Promise<ShopVoucherStats> {
    const { data } = await axiosClient.get<ApiEnvelope<{ active_count: number; total_usage: number; voucher_revenue: number; discount_spent: number }>>("/api/v1/seller/vouchers/stats");
    return { activeCount: data.data.active_count, totalUsage: data.data.total_usage, voucherRevenue: data.data.voucher_revenue, discountSpent: data.data.discount_spent };
  },
  async createShopVoucher(payload: CreateShopVoucherPayload): Promise<ShopVoucherItem> {
    const { data } = await axiosClient.post<ApiEnvelope<VoucherRecord>>("/api/v1/seller/vouchers", toPayload(payload));
    return this.getShopVouchers().then((list) => list.find((voucher) => voucher.id === String(data.data.id)) ?? mapVoucher({ ...data.data, scope: "SHOP", shop_id: null, description: payload.description, discount_type: payload.type === "percent" ? "PERCENT" : "FIXED", discount_value: payload.discountValue, max_discount_amount: payload.maxDiscountAmount ?? null, min_order_value: payload.minOrderAmount, usage_limit: payload.maxUsageCount, usage_per_user: 1, used_count: 0, start_at: `${payload.startDate}T00:00:00Z`, end_at: `${payload.expiryDate}T23:59:59Z`, is_active: true }));
  },
  async updateShopVoucher(id: string, payload: Partial<ShopVoucherItem>): Promise<ShopVoucherItem> {
    const current = (await this.getShopVouchers()).find((voucher) => voucher.id === id);
    if (!current) throw new Error("Không tìm thấy voucher");
    const full = { ...current, ...payload } as ShopVoucherItem;
    const body = toPayload({ code: full.code, title: full.title, type: full.type, discountValue: full.discountValue, maxDiscountAmount: full.maxDiscountAmount, minOrderAmount: full.minOrderAmount, startDate: full.startDate ?? "", expiryDate: full.expiryDate ?? "", maxUsageCount: full.maxUsageCount ?? 0, description: full.description });
    await axiosClient.put(`/api/v1/seller/vouchers/${id}`, body);
    return (await this.getShopVouchers()).find((voucher) => voucher.id === id)!;
  },
  async deleteShopVoucher(id: string): Promise<string> {
    await axiosClient.patch(`/api/v1/seller/vouchers/${id}/status`, { is_active: false });
    return id;
  },
  async toggleShopVoucherStatus(id: string): Promise<ShopVoucherItem> {
    const current = (await this.getShopVouchers()).find((voucher) => voucher.id === id);
    if (!current) throw new Error("Không tìm thấy voucher");
    const active = current.status === "paused";
    await axiosClient.patch(`/api/v1/seller/vouchers/${id}/status`, { is_active: active });
    return { ...current, status: active ? "ongoing" : "paused" };
  },
};
