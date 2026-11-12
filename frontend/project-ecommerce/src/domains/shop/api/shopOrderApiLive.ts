import axiosClient from "@/shared/api/axiosClient";
import type { ShopOrderFilterParams, ShopOrderItem, ShopOrderStatusCounts } from "@/domains/shop/types/shopOrder.types";
import { mapBackendShopOrder, orderResourceID, type BackendShopOrder } from "./shopOrderApi";

type APIEnvelope<T> = { success: boolean; data: T; message?: string };
type SellerOrderList = {
  orders: BackendShopOrder[];
  counts: { all: number; pending: number; preparing: number; shipping: number; completed: number; cancelled: number; returned: number };
  pagination: { page: number; limit: number; total: number; total_pages: number };
};

function queryParams(params?: ShopOrderFilterParams) {
  const status = params?.statusTab === "packing" ? "PREPARING" : params?.statusTab === "delivered" ? "COMPLETED" : params?.statusTab?.toUpperCase();
  return {
    ...(status && status !== "ALL" ? { status } : {}),
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params?.dateRange && params.dateRange !== "all" ? { date_range: params.dateRange } : {}),
    ...(params?.paymentMethod && params.paymentMethod !== "all" ? { payment_method: params.paymentMethod } : {}),
    ...(params?.courier && params.courier !== "all" ? { courier: params.courier } : {}),
    page: params?.page ?? 1,
    limit: params?.pageSize ?? 10,
  };
}

async function loadDetail(id: string): Promise<ShopOrderItem> {
  const response = await axiosClient.get<APIEnvelope<BackendShopOrder>>(
    `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}`,
  );
  return mapBackendShopOrder(response.data.data);
}

export const shopOrderApi = {
  async fetchShopOrders(params?: ShopOrderFilterParams): Promise<{ orders: ShopOrderItem[]; total: number }> {
    const response = await axiosClient.get<APIEnvelope<SellerOrderList>>("/api/v1/seller/orders", { params: queryParams(params) });
    const rawOrders = response.data?.data?.orders;
    const total = response.data?.data?.pagination?.total ?? 0;
    const orders = Array.isArray(rawOrders) ? rawOrders.map(mapBackendShopOrder) : [];
    return { orders, total };
  },

  async fetchShopOrderCounts(): Promise<ShopOrderStatusCounts> {
    const response = await axiosClient.get<APIEnvelope<SellerOrderList>>("/api/v1/seller/orders", { params: { limit: 1 } });
    const counts = response.data?.data?.counts;
    return {
      all: counts?.all ?? 0,
      pending: counts?.pending ?? 0,
      packing: counts?.preparing ?? 0,
      shipping: counts?.shipping ?? 0,
      delivered: counts?.completed ?? 0,
      cancelled: counts?.cancelled ?? 0,
      returned: counts?.returned ?? 0,
    };
  },

  async getShopOrderDetail(id: string): Promise<ShopOrderItem> {
    return loadDetail(id);
  },

  async confirmOrder(id: string): Promise<ShopOrderItem> {
    await axiosClient.patch(`/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/confirm`);
    return loadDetail(id);
  },

  async startPacking(id: string): Promise<ShopOrderItem> {
    await axiosClient.patch(`/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/pack`);
    return loadDetail(id);
  },

  async dispatchOrder(id: string, carrier: string, trackingCode: string): Promise<ShopOrderItem> {
    await axiosClient.patch(`/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/ship`, { carrier, tracking_code: trackingCode });
    return loadDetail(id);
  },

  async cancelOrder(id: string, reason: string): Promise<ShopOrderItem> {
    await axiosClient.patch(`/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/cancel`, { reason });
    return loadDetail(id);
  },

  async bulkConfirmOrders(ids: string[]): Promise<string[]> {
    const numericIDs = ids.map((id) => Number(orderResourceID(id)));
    if (numericIDs.some((id) => !Number.isSafeInteger(id) || id < 1)) throw new Error("Đơn được chọn không có mã hợp lệ.");
    const response = await axiosClient.post<APIEnvelope<{ confirmed_shop_order_ids: number[] }>>("/api/v1/seller/orders/bulk-confirm", { shop_order_ids: numericIDs });
    const confirmedIds = response.data?.data?.confirmed_shop_order_ids;
    return Array.isArray(confirmedIds) ? confirmedIds.map(String) : [];
  },

  async exportOrdersCsv(): Promise<string> {
    const first = await axiosClient.get<APIEnvelope<SellerOrderList>>("/api/v1/seller/orders", { params: { page: 1, limit: 100 } });
    const rawFirst = first.data?.data?.orders;
    const all: BackendShopOrder[] = Array.isArray(rawFirst) ? [...rawFirst] : [];
    const totalPages = first.data?.data?.pagination?.total_pages ?? 1;
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await axiosClient.get<APIEnvelope<SellerOrderList>>("/api/v1/seller/orders", { params: { page, limit: 100 } });
      const rawNext = next.data?.data?.orders;
      if (Array.isArray(rawNext)) {
        all.push(...rawNext);
      }
    }
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    return [
      ["Mã đơn shop", "Mã đơn tổng", "Ngày tạo", "Người nhận", "Số điện thoại", "Địa chỉ", "Trạng thái", "Tổng tiền", "Thực nhận"].map(quote).join(","),
      ...all.map((order) => [order.shop_order_code, order.parent_order_code, order.created_at, order.recipient_name, order.recipient_phone, order.shipping_address, order.status_label, order.total_amount, order.seller_payout].map(quote).join(",")),
    ].join("\r\n");
  },
};
