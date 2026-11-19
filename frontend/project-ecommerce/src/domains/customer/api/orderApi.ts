import axiosClient from "@/shared/api/axiosClient";
import type { UserOrder, UserOrderFilterParams, UserOrderStatusCounts } from "@/domains/order/types";

type APIEnvelope<T> = { success: boolean; data: T; message?: string };
type BackendOrderItem = {
  id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name?: string;
  sku: string;
  image_url?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};
type BackendShopOrder = {
  id: number;
  shop_id: number;
  shop_name: string;
  shop_order_code: string;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_fee: number;
  shop_discount: number;
  platform_discount: number;
  total_amount: number;
  carrier?: string;
  tracking_code?: string;
  cancel_reason?: string;
  timeline?: Array<{
    id: number;
    time: string;
    title: string;
    subtitle?: string;
    note?: string;
    created_at: string;
  }>;
  items: BackendOrderItem[];
};
type BackendCustomerOrder = {
  id: number;
  order_code: string;
  parent_order_code?: string;
  shop_order_code?: string;
  shop_order_id?: number;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_fee: number;
  platform_discount: number;
  shop_discount_total: number;
  total_amount: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  payment_method_code: string;
  payment_method_name: string;
  payment_status: string;
  created_at: string;
  updated_at?: string;
  note?: string;
  shops: BackendShopOrder[];
  payment?: {
    payment_method_code: string;
    payment_method_name: string;
    status: string;
    transaction_ref?: string;
    paid_at?: string;
  };
  timeline?: Array<{
    id: number;
    time: string;
    title: string;
    subtitle?: string;
    note?: string;
    created_at: string;
  }>;
};
type BackendOrderList = {
  orders: BackendCustomerOrder[];
  counts: UserOrderStatusCounts;
  pagination: { total: number };
};
type BackendPaymentStatus = { status: string };

async function fetchBackendOrderPage(params: Record<string, string | number>): Promise<BackendOrderList> {
  const response = await axiosClient.get<APIEnvelope<BackendOrderList>>("/api/v1/orders", { params });
  return response.data.data;
}

async function refreshPendingBankTransfers(orders: BackendCustomerOrder[]): Promise<boolean> {
  const uniquePendingTransfers = new Map<number, BackendCustomerOrder>();
  for (const order of orders) {
    if (
      order.payment_method_code === "BANK_TRANSFER" &&
      ["PENDING", "FAILED"].includes(order.payment?.status || order.payment_status) &&
      !uniquePendingTransfers.has(order.id)
    ) {
      uniquePendingTransfers.set(order.id, order);
    }
  }
  const pendingTransfers = [...uniquePendingTransfers.values()].slice(0, 6);

  const refreshed = await Promise.allSettled(
    pendingTransfers.map(async (order) => {
      const payment = await axiosClient.get<APIEnvelope<BackendPaymentStatus>>(
        `/api/v1/orders/${encodeURIComponent(String(order.id))}/payment`
      );
      return payment.data.data.status !== (order.payment?.status || order.payment_status);
    })
  );

  return refreshed.some((result) => result.status === "fulfilled" && result.value);
}

function expandParentOrders(parents: BackendCustomerOrder[]): BackendCustomerOrder[] {
  return parents.flatMap((parent) => (parent.shops ?? []).map((shop) => ({
    ...parent,
    parent_order_code: parent.order_code,
    shop_order_code: shop.shop_order_code,
    shop_order_id: shop.id,
    order_code: shop.shop_order_code,
    status: shop.status,
    status_label: shop.status_label,
    subtotal: shop.subtotal,
    shipping_fee: shop.shipping_fee,
    shop_discount_total: shop.shop_discount,
    platform_discount: shop.platform_discount,
    total_amount: shop.total_amount,
    shops: [shop],
  })));
}

function childOrderCounts(orders: BackendCustomerOrder[]): UserOrderStatusCounts {
  const counts: UserOrderStatusCounts = {
    all: orders.length,
    pending: 0,
    packing: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  };
  for (const order of orders) {
    switch (uiStatus(order.status)) {
      case "pending": counts.pending++; break;
      case "packing": counts.packing++; break;
      case "shipping": counts.shipping++; break;
      case "completed": counts.completed++; break;
      case "cancelled": counts.cancelled++; break;
      case "returned": counts.returned++; break;
    }
  }
  return counts;
}

function matchesOrderTab(status: string, tab?: UserOrderFilterParams["tab"]): boolean {
  return !tab || tab === "all" || uiStatus(status) === tab;
}

async function loadLegacyShopOrders(firstPage: BackendOrderList): Promise<BackendCustomerOrder[]> {
  const parentOrders = [...firstPage.orders];
  const pageSize = 50;
  const pageCount = Math.ceil(firstPage.pagination.total / pageSize);
  for (let page = 2; page <= pageCount; page++) {
    const response = await fetchBackendOrderPage({ group_by: "shop", page, limit: pageSize });
    parentOrders.push(...response.orders);
  }
  if (await refreshPendingBankTransfers(parentOrders)) {
    const pages = await Promise.all(Array.from({ length: pageCount }, (_, index) =>
      fetchBackendOrderPage({ group_by: "shop", page: index + 1, limit: pageSize })
    ));
    return expandParentOrders(pages.flatMap((page) => page.orders));
  }
  return expandParentOrders(parentOrders);
}

function uiStatus(status: string): UserOrder["status"] {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "PACKING":
      return "packing";
    case "SHIPPING":
      return "shipping";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "RETURNED":
      return "returned";
    default:
      return "pending";
  }
}

export function mapCustomerBackendOrder(order: BackendCustomerOrder): UserOrder {
  const method = order.payment?.payment_method_code || order.payment_method_code;
  const paymentStatus = order.payment?.status || order.payment_status;
  const mapItem = (shop: BackendShopOrder, item: BackendOrderItem) => ({
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
  });
  const items = (order.shops ?? []).flatMap((shop) =>
    (shop.items ?? []).map((item) => mapItem(shop, item))
  );
  const status = uiStatus(order.status);
  const paymentText =
    paymentStatus === "PAID"
      ? `${order.payment_method_name || method} · Đã thanh toán`
      : `${order.payment_method_name || method} · Chưa thanh toán`;
  const carrier = order.shops?.find((shop) => shop.carrier)?.carrier;
  const trackingCode = order.shops?.find((shop) => shop.tracking_code)?.tracking_code;
  const created = new Date(order.created_at);
  const viewStatus = order.shops?.length === 1 ? uiStatus(order.shops[0].status) : status;
  return {
    id: order.id,
    orderCode: (order.shop_order_code || order.order_code).startsWith("#")
      ? order.shop_order_code || order.order_code
      : `#${order.shop_order_code || order.order_code}`,
    parentOrderCode: order.parent_order_code || (order.shop_order_id ? order.order_code : undefined),
    shopOrderId: order.shop_order_id,
    userId: 0,
    status: viewStatus,
    statusLabel: order.shops?.length === 1 ? order.shops[0].status_label : order.status_label,
    subtotal: order.shops?.length === 1 ? order.shops[0].subtotal : order.subtotal,
    shippingFee: order.shops?.length === 1 ? order.shops[0].shipping_fee : order.shipping_fee,
    shopDiscount: order.shops?.length === 1 ? order.shops[0].shop_discount : order.shop_discount_total,
    shippingDiscount: order.shops?.length === 1 ? order.shops[0].platform_discount : order.platform_discount,
    totalAmount: order.shops?.length === 1 ? order.shops[0].total_amount : order.total_amount,
    shippingCarrier: carrier,
    paymentMethod: method as UserOrder["paymentMethod"],
    paymentStatusText: paymentText,
    shippingInfoText: carrier
      ? `${viewStatus === "shipping" ? "Đang vận chuyển" : "Đơn vị vận chuyển"} · ${carrier}`
      : undefined,
    courierName: carrier,
    trackingCode,
    createdAt: Number.isNaN(created.getTime())
      ? order.created_at
      : created.toLocaleString("vi-VN"),
    updatedAtText: order.updated_at,
    note: order.note,
    cancelReason: order.shops?.find((shop) => shop.cancel_reason)?.cancel_reason,
    items,
    shops: (order.shops ?? []).map((shop) => ({
      shopId: shop.shop_id,
      shopName: shop.shop_name,
      shopOrderId: shop.id,
      shopOrderCode: shop.shop_order_code,
      status: uiStatus(shop.status),
      statusLabel: shop.status_label,
      carrier: shop.carrier,
      trackingCode: shop.tracking_code,
      cancelReason: shop.cancel_reason,
      timeline: shop.timeline?.map((entry) => ({
        id: String(entry.id),
        time: entry.time,
        title: entry.title,
        subtitle: entry.subtitle || entry.note,
      })),
      items: (shop.items ?? []).map((item) => mapItem(shop, item)),
    })),
    recipient: {
      name: order.recipient_name,
      phone: order.recipient_phone,
      address: order.shipping_address,
      addressType: "Địa chỉ nhận hàng",
    },
    timeline: order.timeline?.map((entry) => ({
      id: String(entry.id),
      time: entry.time,
      title: entry.title,
      subtitle: entry.subtitle || entry.note,
      isLatest: false,
    })),
  };
}

async function getOrder(id: string | number, shopOrderId?: number): Promise<UserOrder> {
  const rawID = String(id).replace(/^#/, "");
  const response = await axiosClient.get<APIEnvelope<BackendCustomerOrder>>(
    `/api/v1/orders/${encodeURIComponent(rawID)}`,
    { params: shopOrderId ? { shop_order_id: shopOrderId } : undefined }
  );
  return mapCustomerBackendOrder(response.data.data);
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
  async fetchUserOrders(
    params?: UserOrderFilterParams
  ): Promise<{ orders: UserOrder[]; total: number }> {
    const probe = await fetchBackendOrderPage({ group_by: "shop", page: 1, limit: 50 });
    const supportsShopGrouping = probe.orders.length === 0 || probe.orders.every((order) => order.shop_order_id != null);
    if (supportsShopGrouping) {
      const query = {
        ...(params?.tab && params.tab !== "all" ? { tab: params.tab } : {}),
        ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        group_by: "shop",
        page: params?.page ?? 1,
        limit: params?.pageSize ?? 6,
      };
      const initial = await fetchBackendOrderPage(query);
      const response = await refreshPendingBankTransfers(initial.orders)
        ? await fetchBackendOrderPage(query)
        : initial;
      return {
        orders: response.orders.map(mapCustomerBackendOrder),
        total: response.pagination.total,
      };
    }

    const childOrders = await loadLegacyShopOrders(probe);
    const search = params?.search?.trim().toLowerCase();
    const visibleOrders = childOrders.filter((order) => {
      const matchesSearch = !search || [
        order.order_code,
        order.parent_order_code,
        order.shops[0]?.shop_name,
      ].some((value) => value?.toLowerCase().includes(search));
      return matchesSearch && matchesOrderTab(order.status, params?.tab);
    });
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 6;
    const pageOrders = visibleOrders.slice((page - 1) * pageSize, page * pageSize);
    return {
      orders: pageOrders.map(mapCustomerBackendOrder),
      total: visibleOrders.length,
    };
  },

  async fetchUserOrderStatusCounts(): Promise<UserOrderStatusCounts> {
    const response = await fetchBackendOrderPage({ group_by: "shop", page: 1, limit: 50 });
    const supportsShopGrouping = response.orders.length === 0 || response.orders.every((order) => order.shop_order_id != null);
    if (supportsShopGrouping) return response.counts;
    const childOrders = await loadLegacyShopOrders(response);
    return childOrderCounts(childOrders);
  },

  async cancelUserOrder(
    orderId: string | number,
    cancelReason: string,
    shopOrderId?: number
  ): Promise<UserOrder> {
    const id = orderID(orderId);
    await axiosClient.post(`/api/v1/orders/${id}/cancel`, {
      reason: cancelReason,
      ...(shopOrderId ? { shop_order_id: shopOrderId } : {}),
    });
    return getOrder(id, shopOrderId);
  },

  async confirmOrderReceived(orderId: string | number, shopOrderId?: number): Promise<UserOrder> {
    const id = orderID(orderId);
    await axiosClient.post(`/api/v1/orders/${id}/received`, shopOrderId ? { shop_order_id: shopOrderId } : {});
    return getOrder(id, shopOrderId);
  },

  fetchUserOrderDetail: getOrder,
};

// Aliases for compatibility
export const mockUserOrderApi = userOrderApi;
