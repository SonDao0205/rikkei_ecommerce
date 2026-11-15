import axiosClient from "@/shared/api/axiosClient";

export interface AdminVoucher {
  id: number; code: string; scope: string; shop_id: number | null; title: string; description: string | null;
  discount_type: "FIXED" | "PERCENT"; discount_value: number; max_discount_amount: number | null; min_order_value: number;
  usage_limit: number | null; usage_per_user: number; used_count: number; start_at: string; end_at: string; is_active: boolean;
}
export interface AdminBanner { id: number; title: string; image_url: string; target_url: string | null; position: string; start_at: string; end_at: string; sort_order: number; is_active: boolean }
export interface AdminFlashSale { id: number; product_id: number; sale_price: number; quantity_limit: number; quantity_sold: number; start_at: string; end_at: string; is_active: boolean }
export interface AdminReview { id: number; product_id: number; order_item_id: number; customer_name: string; rating: number; content: string | null; status: string; shop_reply: string | null; created_at: string }
export interface AuditLog { id: number; user_id: number | null; action: string; entity_type: string; entity_id: number | null; old_value: string | null; new_value: string | null; request_id: string | null; created_at: string }
interface Envelope<T> { success: boolean; data: T }

export const adminPromotionApi = {
  async vouchers() { return (await axiosClient.get<Envelope<AdminVoucher[]>>("/api/v1/admin/vouchers")).data.data ?? []; },
  async createVoucher(input: Record<string, unknown>) { return axiosClient.post("/api/v1/admin/vouchers", input); },
  async voucherStatus(id: number, is_active: boolean) { return axiosClient.patch(`/api/v1/admin/vouchers/${id}/status`, { is_active }); },
  async banners() { return (await axiosClient.get<Envelope<AdminBanner[]>>("/api/v1/admin/promotions/banners")).data.data ?? []; },
  async createBanner(input: Record<string, unknown>) { return axiosClient.post("/api/v1/admin/promotions/banners", input); },
  async bannerStatus(id: number, is_active: boolean) { return axiosClient.patch(`/api/v1/admin/promotions/banners/${id}/status`, { is_active }); },
  async flashSales() { return (await axiosClient.get<Envelope<AdminFlashSale[]>>("/api/v1/admin/promotions/flash-sales")).data.data ?? []; },
  async createFlashSale(input: Record<string, unknown>) { return axiosClient.post("/api/v1/admin/promotions/flash-sales", input); },
  async flashSaleStatus(id: number, is_active: boolean) { return axiosClient.patch(`/api/v1/admin/promotions/flash-sales/${id}/status`, { is_active }); },
  async reviews(status: "VISIBLE" | "HIDDEN") { return (await axiosClient.get<Envelope<AdminReview[]>>("/api/v1/admin/reviews", { params: { status } })).data.data ?? []; },
  async moderateReview(id: number, status: "VISIBLE" | "HIDDEN", reason: string) { return axiosClient.patch(`/api/v1/admin/reviews/${id}/status`, { status, reason }); },
  async auditLogs() { return (await axiosClient.get<Envelope<AuditLog[]>>("/api/v1/admin/audit-logs", { params: { limit: 200 } })).data.data ?? []; },
};
