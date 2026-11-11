import axiosClient from "@/shared/api/axiosClient";
import type {
  UserOrder,
  UserOrderStatusCounts,
  UserOrderFilterParams,
  UserOrderStatusTab,
  UserOrderItem,
  UserOrderShop,
  UserOrderTimelineLog,
} from "@/domains/order/types";

export interface BackendOrderItem {
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
}

export interface BackendShopOrder {
  id: number;
  order_id: number;
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
  confirmed_at?: string;
  packed_at?: string;
  shipped_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
}

export interface BackendCustomerOrderSummary {
  id: number;
  order_code: string;
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
  shops: BackendShopOrder[];
}

export interface BackendCustomerOrderDetail extends BackendCustomerOrderSummary {
  note?: string;
  updated_at: string;
  payment: {
    id: number;
    payment_method_code: string;
    payment_method_name: string;
    amount: number;
    status: string;
    transaction_ref?: string;
    paid_at?: string;
  };
  refund_info?: {
    refund_status: string;
    refund_message: string;
    refund_amount?: number;
  };
  timeline: Array<{
    id: number;
    time: string;
    title: string;
    subtitle?: string;
    note?: string;
    created_at: string;
  }>;
  return_requests?: Array<{
    id: number;
    shop_order_id: number;
    shop_order_code?: string;
    user_id: number;
    user_name?: string;
    user_phone?: string;
    type: string;
    reason: string;
    status: string;
    refund_amount?: number;
    created_at: string;
    updated_at: string;
  }>;
}

interface BackendListOrdersResponse {
  success: boolean;
  data: {
    orders: BackendCustomerOrderSummary[];
    counts: {
      all: number;
      pending: number;
      confirmed: number;
      packing: number;
      shipping: number;
      completed: number;
      cancelled: number;
      returned: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}

export function mapBackendToUserOrder(
  backendOrder: BackendCustomerOrderSummary | BackendCustomerOrderDetail
): UserOrder {
  const statusStr = (backendOrder.status || "").toUpperCase();
  let mappedStatus: UserOrderStatusTab = "pending";
  if (statusStr === "CONFIRMED" || statusStr === "PENDING") {
    mappedStatus = "pending";
  } else if (statusStr === "PACKING") {
    mappedStatus = "packing";
  } else if (statusStr === "SHIPPING") {
    mappedStatus = "shipping";
  } else if (statusStr === "COMPLETED") {
    mappedStatus = "completed";
  } else if (statusStr === "CANCELLED") {
    mappedStatus = "cancelled";
  } else if (statusStr === "RETURNED") {
    mappedStatus = "returned";
  }

  const shops: UserOrderShop[] = (backendOrder.shops || []).map((s) => ({
    shopId: s.shop_id,
    shopName: s.shop_name,
    shopBadge: "MALL",
  }));

  const items: UserOrderItem[] = (backendOrder.shops || []).flatMap((s) =>
    (s.items || []).map((it) => ({
      id: it.id,
      shopId: s.shop_id,
      shopName: s.shop_name,
      shopBadge: "MALL",
      productId: it.product_id,
      productName: it.product_name,
      variantName: it.variant_name || "Mặc định",
      sku: it.sku,
      imageUrl: it.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      quantity: it.quantity,
      unitPrice: it.unit_price,
    }))
  );

  const firstShop = (backendOrder.shops || [])[0];
  const carrier = firstShop?.carrier || "Giao Hàng Nhanh (GHN Express)";
  const trackingCode = firstShop?.tracking_code || undefined;

  const pmCode = (
    backendOrder.payment_method_code ||
    (backendOrder as BackendCustomerOrderDetail).payment?.payment_method_code ||
    "COD"
  ).toUpperCase();
  let paymentMethod: "COD" | "MOMO" | "VISA" | "ZALOPAY" = "COD";
  if (pmCode === "MOMO") paymentMethod = "MOMO";
  else if (pmCode === "VISA" || pmCode === "CARD") paymentMethod = "VISA";
  else if (pmCode === "ZALOPAY") paymentMethod = "ZALOPAY";

  const pmName =
    backendOrder.payment_method_name ||
    (backendOrder as BackendCustomerOrderDetail).payment?.payment_method_name ||
    pmCode;
  const payStatus =
    backendOrder.payment_status ||
    (backendOrder as BackendCustomerOrderDetail).payment?.status;
  const paymentStatusText = `${pmName} (${payStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"})`;

  const timelineLogs: UserOrderTimelineLog[] = (
    (backendOrder as BackendCustomerOrderDetail).timeline || []
  ).map((t, idx) => ({
    id: String(t.id || idx),
    time: t.time || (t.created_at ? new Date(t.created_at).toLocaleString("vi-VN") : ""),
    title: t.title,
    subtitle: t.subtitle || t.note || undefined,
    isLatest: idx === 0,
  }));

  const note = (backendOrder as BackendCustomerOrderDetail).note || undefined;

  return {
    id: backendOrder.id,
    orderCode: backendOrder.order_code,
    userId: 0,
    status: mappedStatus,
    statusLabel: backendOrder.status_label || statusStr,
    subtotal: backendOrder.subtotal,
    shippingFee: backendOrder.shipping_fee,
    shippingDiscount: backendOrder.platform_discount,
    shopDiscount: backendOrder.shop_discount_total,
    totalAmount: backendOrder.total_amount,
    shippingCarrier: carrier,
    paymentMethod,
    paymentStatusText,
    shippingInfoText: `${backendOrder.status_label || statusStr} • ${carrier}`,
    courierName: carrier,
    trackingCode,
    createdAt: backendOrder.created_at
      ? new Date(backendOrder.created_at).toLocaleString("vi-VN")
      : "",
    note,
    cancelReason: firstShop?.cancel_reason,
    items,
    shops,
    recipient: {
      name: backendOrder.recipient_name,
      phone: backendOrder.recipient_phone,
      address: backendOrder.shipping_address,
      addressType: "Địa chỉ giao hàng",
      note,
      notes: note,
    },
    timeline: timelineLogs.length > 0 ? timelineLogs : undefined,
  };
}

export const mockUserOrders: UserOrder[] = [];

export const userOrderApi = {
  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại (lọc theo tab, tìm kiếm, phân trang)
   */
  fetchUserOrders: async (
    params?: UserOrderFilterParams
  ): Promise<{ orders: UserOrder[]; total: number }> => {
    const queryParams: Record<string, string | number> = {
      page: params?.page || 1,
      limit: params?.pageSize || 6,
    };

    if (params?.tab && params.tab !== "all") {
      queryParams.tab = params.tab;
    }

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    const res = await axiosClient.get<BackendListOrdersResponse>("/api/v1/orders", {
      params: queryParams,
    });

    const ordersData = res.data?.data?.orders || [];
    const total = res.data?.data?.pagination?.total ?? ordersData.length;

    return {
      orders: ordersData.map(mapBackendToUserOrder),
      total,
    };
  },

  /**
   * Lấy số lượng đơn hàng theo từng trạng thái (để hiển thị badge đếm trên tab)
   */
  fetchUserOrderStatusCounts: async (): Promise<UserOrderStatusCounts> => {
    const res = await axiosClient.get<BackendListOrdersResponse>("/api/v1/orders", {
      params: { tab: "all", limit: 1 },
    });

    const counts = res.data?.data?.counts;
    if (!counts) {
      return {
        all: 0,
        pending: 0,
        packing: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0,
        returned: 0,
      };
    }

    return {
      all: counts.all ?? 0,
      pending: (counts.pending ?? 0) + (counts.confirmed ?? 0),
      packing: counts.packing ?? 0,
      shipping: counts.shipping ?? 0,
      completed: counts.completed ?? 0,
      cancelled: counts.cancelled ?? 0,
      returned: counts.returned ?? 0,
    };
  },

  /**
   * Người mua yêu cầu hủy đơn hàng (khi đơn còn ở trạng thái Chờ xác nhận)
   */
  cancelUserOrder: async (
    orderId: number | string,
    cancelReason: string
  ): Promise<UserOrder> => {
    const cleanId = String(orderId).replace(/^#/, "").trim();
    await axiosClient.post(`/api/v1/orders/${cleanId}/cancel`, {
      reason: cancelReason,
    });

    return await userOrderApi.fetchUserOrderDetail(cleanId);
  },

  /**
   * Xác nhận đã nhận được hàng (khi đơn đang vận chuyển)
   */
  confirmOrderReceived: async (orderId: number | string): Promise<UserOrder> => {
    const cleanId = String(orderId).replace(/^#/, "").trim();
    await axiosClient.post(`/api/v1/orders/${cleanId}/received`);
    return await userOrderApi.fetchUserOrderDetail(cleanId);
  },

  /**
   * Lấy chi tiết đơn hàng theo ID hoặc Mã đơn
   */
  fetchUserOrderDetail: async (
    orderIdOrCode: string | number
  ): Promise<UserOrder> => {
    const cleanParam = String(orderIdOrCode).replace(/^#/, "").trim();
    const res = await axiosClient.get<{ success: boolean; data: BackendCustomerOrderDetail }>(
      `/api/v1/orders/${cleanParam}`
    );

    if (!res.data?.data) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return mapBackendToUserOrder(res.data.data);
  },

  /**
   * Yêu cầu đổi/trả/hoàn tiền
   */
  createReturnRequest: async (
    orderId: number,
    payload: {
      shop_order_id: number;
      type: "RETURN" | "EXCHANGE" | "REFUND";
      reason: string;
      refund_amount?: number;
    }
  ): Promise<{ success: boolean; message?: string; data?: unknown }> => {
    const res = await axiosClient.post(`/api/v1/orders/${orderId}/returns`, payload);
    return res.data;
  },
};
