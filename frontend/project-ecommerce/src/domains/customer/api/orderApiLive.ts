import axiosClient from "@/shared/api/axiosClient";
import type { UserOrder, UserOrderFilterParams, UserOrderStatusCounts } from "@/domains/order/types";

type APIEnvelope<T> = { success: boolean; data: T; message?: string };
type BackendOrderItem = { id: number; product_id: number; variant_id: number; product_name: string; variant_name?: string; sku: string; image_url?: string; unit_price: number; quantity: number; line_total: number };
type BackendShopOrder = { id: number; shop_id: number; shop_name: string; shop_order_code: string; status: string; status_label: string; carrier?: string; tracking_code?: string; cancel_reason?: string; items: BackendOrderItem[] };
type BackendCustomerOrder = {
  id: number; order_code: string; status: string; status_label: string; subtotal: number; shipping_fee: number;
  platform_discount: number; shop_discount_total: number; total_amount: number; recipient_name: string;
  recipient_phone: string; shipping_address: string; payment_method_code: string; payment_method_name: string;
  payment_status: string; created_at: string; updated_at?: string; note?: string; shops: BackendShopOrder[];
  payment?: { payment_method_code: string; payment_method_name: string; status: string; transaction_ref?: string; paid_at?: string };
  timeline?: Array<{ id: number; time: string; title: string; subtitle?: string; note?: string; created_at: string }>;
};
type BackendOrderList = { orders: BackendCustomerOrder[]; counts: UserOrderStatusCounts; pagination: { total: number } };

function uiStatus(status: string): UserOrder["status"] {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "PACKING": return "packing";
    case "SHIPPING": return "shipping";
    case "COMPLETED": return "completed";
    case "CANCELLED": return "cancelled";
    case "RETURNED": return "returned";
    default: return "pending";
  }
}

function mapOrder(order: BackendCustomerOrder): UserOrder {
  const method = order.payment?.payment_method_code || order.payment_method_code;
  const paymentStatus = order.payment?.status || order.payment_status;
  const items = (order.shops ?? []).flatMap((shop) => (shop.items ?? []).map((item) => ({
    id: item.id,
    shopId: shop.shop_id,
    shopName: shop.shop_name,
    productId: item.product_id,
    productName: item.product_name,
    variantName: item.variant_name || "Mặc định",
    sku: item.sku,
    imageUrl: item.image_url || "",
    quantity: item.quantity,
    unitPrice: item.unit_price,
  })));
  const status = uiStatus(order.status);
  const paymentText = paymentStatus === "PAID" ? `${order.payment_method_name || method} · Đã thanh toán` : `${order.payment_method_name || method} · Chưa thanh toán`;
  const carrier = order.shops?.find((shop) => shop.carrier)?.carrier;
  const trackingCode = order.shops?.find((shop) => shop.tracking_code)?.tracking_code;
  const created = new Date(order.created_at);
  return {
    id: order.id,
    orderCode: order.order_code.startsWith("#") ? order.order_code : `#${order.order_code}`,
    userId: 0,
    status,
    statusLabel: order.status_label,
    subtotal: order.subtotal,
    shippingFee: order.shipping_fee,
    shopDiscount: order.shop_discount_total,
    shippingDiscount: order.platform_discount,
    totalAmount: order.total_amount,
    shippingCarrier: carrier,
    paymentMethod: method as UserOrder["paymentMethod"],
    paymentStatusText: paymentText,
    shippingInfoText: carrier ? `${status === "shipping" ? "Đang vận chuyển" : "Đơn vị vận chuyển"} · ${carrier}` : undefined,
    courierName: carrier,
    trackingCode,
    createdAt: Number.isNaN(created.getTime()) ? order.created_at : created.toLocaleString("vi-VN"),
    updatedAtText: order.updated_at,
    note: order.note,
    cancelReason: order.shops?.find((shop) => shop.cancel_reason)?.cancel_reason,
    items,
    shops: (order.shops ?? []).map((shop) => ({ shopId: shop.shop_id, shopName: shop.shop_name })),
    recipient: { name: order.recipient_name, phone: order.recipient_phone, address: order.shipping_address, addressType: "Địa chỉ nhận hàng" },
    timeline: order.timeline?.map((entry) => ({ id: String(entry.id), time: entry.time, title: entry.title, subtitle: entry.subtitle || entry.note, isLatest: false })),
  };
}

async function getOrder(id: string | number): Promise<UserOrder> {
  const rawID = String(id).replace(/^#/, "");
  const response = await axiosClient.get<APIEnvelope<BackendCustomerOrder>>(`/api/v1/orders/${encodeURIComponent(rawID)}`);
  return mapOrder(response.data.data);
}

function orderID(value: string | number): string {
  const rawID = String(value).trim().replace(/^#/, "");
  const numericID = Number(rawID);
  if (!Number.isSafeInteger(numericID) || numericID < 1) {
    throw new Error("Mã đơn hàng không hợp lệ.");
  }
  return String(numericID);
}

export const userOrderApi = {
  async fetchUserOrders(params?: UserOrderFilterParams): Promise<{ orders: UserOrder[]; total: number }> {
    const response = await axiosClient.get<APIEnvelope<BackendOrderList>>("/api/v1/orders", {
      params: { ...(params?.tab && params.tab !== "all" ? { tab: params.tab } : {}), ...(params?.search?.trim() ? { search: params.search.trim() } : {}), page: params?.page ?? 1, limit: params?.pageSize ?? 6 },
    });
    return { orders: response.data.data.orders.map(mapOrder), total: response.data.data.pagination.total };
  },

  async fetchUserOrderStatusCounts(): Promise<UserOrderStatusCounts> {
    const response = await axiosClient.get<APIEnvelope<BackendOrderList>>("/api/v1/orders", { params: { limit: 1 } });
    return response.data.data.counts;
  },

  async cancelUserOrder(orderId: string | number, cancelReason: string): Promise<UserOrder> {
    const id = orderID(orderId);
    await axiosClient.post(`/api/v1/orders/${id}/cancel`, { reason: cancelReason });
    return getOrder(id);
  },

  async confirmOrderReceived(orderId: string | number): Promise<UserOrder> {
    const id = orderID(orderId);
    await axiosClient.post(`/api/v1/orders/${id}/received`);
    return getOrder(id);
  },

  fetchUserOrderDetail: getOrder,
};
