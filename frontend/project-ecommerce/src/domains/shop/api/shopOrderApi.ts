import axiosClient from "@/shared/api/axiosClient";
import type {
  ShopOrderItem,
  ShopOrderStatusCounts,
  ShopOrderFilterParams,
} from "@/domains/shop/types/shopOrder.types";

export type BackendShopOrder = {
  id: number;
  shop_order_id: number;
  shop_order_code: string;
  parent_order_code: string;
  status: string;
  status_label: string;
  subtotal: number;
  shipping_fee: number;
  shop_discount: number;
  platform_discount: number;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  seller_payout: number;
  carrier?: string;
  tracking_code?: string;
  cancel_reason?: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  payment_method_code: string;
  payment_method_name: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items?: Array<{
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
  }>;
  timeline?: Array<{
    id: number;
    time: string;
    title: string;
    subtitle?: string;
    note?: string;
    created_at: string;
  }>;
};

type APIEnvelope<T> = { success: boolean; data: T; message?: string };
type SellerOrderList = {
  orders: BackendShopOrder[];
  counts: {
    all: number;
    pending: number;
    preparing: number;
    shipping: number;
    completed: number;
    cancelled: number;
    returned: number;
  };
  pagination: { page: number; limit: number; total: number; total_pages: number };
};

function mapBackendStatus(status: string): ShopOrderItem["status"] {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
    case "PACKING":
      return "packing";
    case "SHIPPING":
      return "shipping";
    case "COMPLETED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    case "RETURNED":
      return "returned";
    default:
      return "pending";
  }
}

export function mapBackendShopOrder(row: BackendShopOrder): ShopOrderItem {
  const status = mapBackendStatus(row.status);
  const date = new Date(row.created_at);
  const items = (row.items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    name: item.product_name,
    variant: item.variant_name || "Mặc định",
    sku: item.sku,
    imageUrl: item.image_url || "",
    price: item.unit_price,
    formattedPrice: new Intl.NumberFormat("vi-VN").format(item.unit_price) + " ₫",
    quantity: item.quantity,
    total: item.line_total,
    formattedTotal: new Intl.NumberFormat("vi-VN").format(item.line_total) + " ₫",
  }));
  const paymentMethod =
    row.payment_method_code === "BANK_TRANSFER" ? "BANKING" : row.payment_method_code;
  const courierLabel = row.carrier || "Chưa bàn giao đơn vị vận chuyển";
  return {
    id: String(row.shop_order_id || row.id),
    orderCode: row.shop_order_code,
    createdAt: Number.isNaN(date.getTime()) ? row.created_at : date.toLocaleDateString("vi-VN"),
    createdAtTime: Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    timeAgo: "",
    status,
    workflowStatus: row.status.toUpperCase() as NonNullable<ShopOrderItem["workflowStatus"]>,
    statusLabel: row.status_label,
    isUrgent: status === "pending",
    customer: {
      name: row.recipient_name,
      phone: row.recipient_phone,
      address: row.shipping_address,
    },
    items,
    productSummary: items.map((item) => `${item.name} × ${item.quantity}`).join(", "),
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    financial: {
      subtotal: row.subtotal,
      shopDiscount: row.shop_discount,
      shippingFee: row.shipping_fee,
      platformDiscount: row.platform_discount,
      grandTotal: row.total_amount,
      platformFee: row.commission_amount,
      shopPayout: row.seller_payout,
      formattedShopPayout: new Intl.NumberFormat("vi-VN").format(row.seller_payout) + " ₫",
      paymentMethod: paymentMethod as ShopOrderItem["financial"]["paymentMethod"],
      paymentStatus: row.payment_status === "PAID" ? "paid" : "unpaid",
      paymentStatusLabel: row.payment_status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán",
    },
    shipping: {
      courier: (row.carrier || "GHN") as ShopOrderItem["shipping"]["courier"],
      courierLabel,
      trackingCode: row.tracking_code || "",
      servicePackage: "",
      estimatedDeliveryDate: "",
      weightGram: 0,
      dimensionsText: "",
      timeline: (row.timeline ?? []).map((entry, index) => ({
        step: index + 1,
        title: entry.title,
        time: entry.time,
        description: entry.note || entry.subtitle || "",
        status: "completed" as const,
      })),
    },
    cancelReason: row.cancel_reason,
  };
}

export function orderResourceID(id: string): string {
  return id.replace(/^#/, "").trim();
}

function queryParams(params?: ShopOrderFilterParams) {
  const status =
    params?.statusTab === "packing"
      ? "PREPARING"
      : params?.statusTab === "delivered"
      ? "COMPLETED"
      : params?.statusTab?.toUpperCase();
  return {
    ...(status && status !== "ALL" ? { status } : {}),
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params?.dateRange && params.dateRange !== "all" ? { date_range: params.dateRange } : {}),
    ...(params?.paymentMethod && params.paymentMethod !== "all"
      ? { payment_method: params.paymentMethod }
      : {}),
    ...(params?.courier && params.courier !== "all" ? { courier: params.courier } : {}),
    page: params?.page ?? 1,
    limit: params?.pageSize ?? 10,
  };
}

async function loadDetail(id: string): Promise<ShopOrderItem> {
  const response = await axiosClient.get<APIEnvelope<BackendShopOrder>>(
    `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}`
  );
  return mapBackendShopOrder(response.data.data);
}

export const shopOrderApi = {
  async fetchShopOrders(
    params?: ShopOrderFilterParams
  ): Promise<{ orders: ShopOrderItem[]; total: number }> {
    const response = await axiosClient.get<APIEnvelope<SellerOrderList>>(
      "/api/v1/seller/orders",
      { params: queryParams(params) }
    );
    const rawOrders = response.data?.data?.orders;
    const total = response.data?.data?.pagination?.total ?? 0;
    const orders = Array.isArray(rawOrders) ? rawOrders.map(mapBackendShopOrder) : [];
    return { orders, total };
  },

  async fetchShopOrderCounts(): Promise<ShopOrderStatusCounts> {
    const response = await axiosClient.get<APIEnvelope<SellerOrderList>>(
      "/api/v1/seller/orders",
      { params: { limit: 1 } }
    );
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
    await axiosClient.patch(
      `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/confirm`
    );
    return loadDetail(id);
  },

  async startPacking(id: string): Promise<ShopOrderItem> {
    await axiosClient.patch(
      `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/pack`
    );
    return loadDetail(id);
  },

  async dispatchOrder(
    id: string,
    carrier: string,
    trackingCode: string
  ): Promise<ShopOrderItem> {
    await axiosClient.patch(
      `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/ship`,
      { carrier, tracking_code: trackingCode }
    );
    return loadDetail(id);
  },

  async cancelOrder(id: string, reason: string): Promise<ShopOrderItem> {
    await axiosClient.patch(
      `/api/v1/seller/orders/${encodeURIComponent(orderResourceID(id))}/cancel`,
      { reason }
    );
    return loadDetail(id);
  },

  async bulkConfirmOrders(ids: string[]): Promise<string[]> {
    const numericIDs = ids.map((id) => Number(orderResourceID(id)));
    if (numericIDs.some((id) => !Number.isSafeInteger(id) || id < 1)) {
      throw new Error("Đơn được chọn không có mã hợp lệ.");
    }
    const response = await axiosClient.post<
      APIEnvelope<{ confirmed_shop_order_ids: number[] }>
    >("/api/v1/seller/orders/bulk-confirm", { shop_order_ids: numericIDs });
    const confirmedIds = response.data?.data?.confirmed_shop_order_ids;
    return Array.isArray(confirmedIds) ? confirmedIds.map(String) : [];
  },

  async exportOrdersCsv(): Promise<string> {
    const first = await axiosClient.get<APIEnvelope<SellerOrderList>>(
      "/api/v1/seller/orders",
      { params: { page: 1, limit: 100 } }
    );
    const rawFirst = first.data?.data?.orders;
    const all: BackendShopOrder[] = Array.isArray(rawFirst) ? [...rawFirst] : [];
    const totalPages = first.data?.data?.pagination?.total_pages ?? 1;
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await axiosClient.get<APIEnvelope<SellerOrderList>>(
        "/api/v1/seller/orders",
        { params: { page, limit: 100 } }
      );
      const rawNext = next.data?.data?.orders;
      if (Array.isArray(rawNext)) {
        all.push(...rawNext);
      }
    }
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    return [
      [
        "Mã đơn shop",
        "Mã đơn tổng",
        "Ngày tạo",
        "Người nhận",
        "Số điện thoại",
        "Địa chỉ",
        "Trạng thái",
        "Tổng tiền",
        "Thực nhận",
      ]
        .map(quote)
        .join(","),
      ...all.map((order) =>
        [
          order.shop_order_code,
          order.parent_order_code,
          order.created_at,
          order.recipient_name,
          order.recipient_phone,
          order.shipping_address,
          order.status_label,
          order.total_amount,
          order.seller_payout,
        ]
          .map(quote)
          .join(",")
      ),
    ].join("\r\n");
  },
};

// Aliases for compatibility
export const mockShopOrderApi = shopOrderApi;
