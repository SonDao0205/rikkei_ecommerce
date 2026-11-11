import axiosClient from "@/shared/api/axiosClient";
import type {
  ShopOrderItem,
  ShopOrderStatusCounts,
  ShopOrderFilterParams,
  ShopOrderStatus,
  ShopOrderProductItem,
  ShopOrderFinancial,
  ShopOrderShipping,
  ShopOrderCustomerInfo,
  ShopOrderTimelineStep,
} from "@/domains/shop/types/shopOrder.types";

export interface BackendSellerOrderItem {
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

export interface BackendSellerOrderView {
  id: number;
  shop_order_id: number;
  order_id: number;
  shop_id: number;
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
  confirmed_at?: string;
  packed_at?: string;
  shipped_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  items: BackendSellerOrderItem[];
}

export interface BackendSellerOrderDetail extends BackendSellerOrderView {
  buyer_note?: string;
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

interface BackendSellerOrdersListResponse {
  success: boolean;
  data: {
    orders: BackendSellerOrderView[];
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

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}

export function mapBackendToShopOrderItem(
  backendOrder: BackendSellerOrderView | BackendSellerOrderDetail
): ShopOrderItem {
  const statusUpper = (backendOrder.status || "").toUpperCase();
  let mappedStatus: ShopOrderStatus = "pending";
  if (statusUpper === "PENDING") {
    mappedStatus = "pending";
  } else if (statusUpper === "CONFIRMED" || statusUpper === "PACKING") {
    mappedStatus = "packing";
  } else if (statusUpper === "SHIPPING") {
    mappedStatus = "shipping";
  } else if (statusUpper === "COMPLETED") {
    mappedStatus = "delivered";
  } else if (statusUpper === "CANCELLED") {
    mappedStatus = "cancelled";
  } else if (statusUpper === "RETURNED") {
    mappedStatus = "returned";
  }

  const items: ShopOrderProductItem[] = (backendOrder.items || []).map((it) => ({
    id: it.id,
    productId: it.product_id,
    name: it.product_name,
    variant: it.variant_name || "Mặc định",
    sku: it.sku,
    imageUrl: it.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    price: it.unit_price,
    formattedPrice: `${(it.unit_price || 0).toLocaleString("vi-VN")} ₫`,
    quantity: it.quantity,
    total: it.line_total,
    formattedTotal: `${(it.line_total || 0).toLocaleString("vi-VN")} ₫`,
    warehouseStock: 50,
  }));

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const productSummary =
    items.length > 0
      ? items.length > 1
        ? `${items[0].name} + ${items.length - 1} món`
        : items[0].name
      : "Đơn hàng gian hàng";

  const pmCode = (backendOrder.payment_method_code || "COD").toUpperCase();
  const paymentMethod = (
    ["COD", "MOMO", "VISA", "ZALOPAY"].includes(pmCode) ? pmCode : "COD"
  ) as "COD" | "MOMO" | "VISA" | "ZALOPAY";

  const financial: ShopOrderFinancial = {
    subtotal: backendOrder.subtotal,
    shopDiscount: backendOrder.shop_discount,
    shippingFee: backendOrder.shipping_fee,
    platformDiscount: backendOrder.platform_discount,
    grandTotal: backendOrder.total_amount,
    platformFee: backendOrder.commission_amount,
    shopPayout: backendOrder.seller_payout,
    formattedShopPayout: `${(backendOrder.seller_payout || 0).toLocaleString("vi-VN")} ₫`,
    paymentMethod,
    paymentStatus:
      backendOrder.payment_status === "PAID"
        ? "paid"
        : pmCode === "COD"
        ? "cod_pending"
        : "unpaid",
    paymentStatusLabel: backendOrder.payment_method_name || pmCode,
  };

  const recipientName = backendOrder.recipient_name || "Khách mua hàng";
  const avatarText = recipientName
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const customer: ShopOrderCustomerInfo = {
    name: recipientName,
    phone: backendOrder.recipient_phone || "",
    address: backendOrder.shipping_address || "",
    avatarText,
    buyerNote: (backendOrder as BackendSellerOrderDetail).buyer_note || undefined,
    tier: "Khách hàng Thân thiết",
  };

  const timelineSteps: ShopOrderTimelineStep[] = (
    (backendOrder as BackendSellerOrderDetail).timeline || []
  ).map((t, idx) => ({
    step: idx + 1,
    title: t.title,
    time: t.time || (t.created_at ? new Date(t.created_at).toLocaleString("vi-VN") : ""),
    description: t.subtitle || t.note || "",
    status: idx === 0 ? "current" : "completed",
  }));

  const shipping: ShopOrderShipping = {
    courier: backendOrder.carrier?.includes("Viettel") ? "VIETTEL_POST" : "GHN",
    courierLabel: backendOrder.carrier || "Giao Hàng Nhanh (GHN Express)",
    trackingCode: backendOrder.tracking_code || `GHN${backendOrder.id}`,
    servicePackage: "Chuyển phát tiêu chuẩn đường bộ",
    estimatedDeliveryDate: "Dự kiến 2-3 ngày",
    weightGram: 500,
    dimensionsText: "30 x 20 x 10 cm",
    timeline: timelineSteps,
  };

  const createdAtDate = backendOrder.created_at ? new Date(backendOrder.created_at) : null;

  return {
    id: `#${backendOrder.shop_order_code}`,
    orderCode: backendOrder.shop_order_code,
    createdAt: createdAtDate ? createdAtDate.toLocaleDateString("vi-VN") : "",
    createdAtTime: createdAtDate
      ? createdAtDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "",
    timeAgo: formatRelativeTime(backendOrder.created_at),
    status: mappedStatus,
    statusLabel: backendOrder.status_label || statusUpper,
    customer,
    items,
    productSummary,
    totalQuantity,
    financial,
    shipping,
    cancelReason: backendOrder.cancel_reason || undefined,
  };
}

export let mockShopOrdersState: ShopOrderItem[] = [];

export const shopOrderApi = {
  fetchShopOrders: async (
    params?: ShopOrderFilterParams
  ): Promise<{ orders: ShopOrderItem[]; total: number }> => {
    const queryParams: Record<string, string | number> = {
      page: params?.page || 1,
      limit: params?.pageSize || 10,
    };

    if (params?.statusTab && params.statusTab !== "all") {
      switch (params.statusTab) {
        case "pending":
          queryParams.status = "PENDING";
          break;
        case "packing":
          queryParams.status = "PACKING";
          break;
        case "shipping":
          queryParams.status = "SHIPPING";
          break;
        case "delivered":
          queryParams.status = "COMPLETED";
          break;
        case "cancelled":
          queryParams.status = "CANCELLED";
          break;
        case "returned":
          queryParams.status = "RETURNED";
          break;
      }
    }

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    const res = await axiosClient.get<BackendSellerOrdersListResponse>(
      "/api/v1/seller/orders",
      {
        params: queryParams,
      }
    );

    const ordersData = res.data?.data?.orders || [];
    const total = res.data?.data?.pagination?.total ?? ordersData.length;

    const mapped = ordersData.map(mapBackendToShopOrderItem);
    mockShopOrdersState = mapped;

    return {
      orders: mapped,
      total,
    };
  },

  fetchShopOrderCounts: async (): Promise<ShopOrderStatusCounts> => {
    const res = await axiosClient.get<BackendSellerOrdersListResponse>(
      "/api/v1/seller/orders",
      {
        params: { status: "ALL", limit: 1 },
      }
    );

    const counts = res.data?.data?.counts;
    if (!counts) {
      return {
        all: 0,
        pending: 0,
        packing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
      };
    }

    return {
      all: counts.all ?? 0,
      pending: counts.pending ?? 0,
      packing: (counts.packing ?? 0) + (counts.confirmed ?? 0),
      shipping: counts.shipping ?? 0,
      delivered: counts.completed ?? 0,
      cancelled: counts.cancelled ?? 0,
      returned: counts.returned ?? 0,
    };
  },

  getShopOrderDetail: async (id: string): Promise<ShopOrderItem | null> => {
    const cleanId = id.replace(/^#/, "").trim();
    const res = await axiosClient.get<{ success: boolean; data: BackendSellerOrderDetail }>(
      `/api/v1/seller/orders/${cleanId}`
    );

    if (!res.data?.data) {
      return null;
    }

    return mapBackendToShopOrderItem(res.data.data);
  },

  confirmOrder: async (orderId: string): Promise<ShopOrderItem> => {
    const cleanId = orderId.replace(/^#/, "").trim();
    await axiosClient.patch(`/api/v1/seller/orders/${cleanId}/confirm`);

    const updated = await shopOrderApi.getShopOrderDetail(orderId);
    if (!updated) throw new Error("Không thể tải đơn hàng sau khi xác nhận");
    return updated;
  },

  dispatchOrder: async (orderId: string): Promise<ShopOrderItem> => {
    const cleanId = orderId.replace(/^#/, "").trim();
    const trackingCode = `GHN${Date.now().toString().slice(-8)}`;
    await axiosClient.patch(`/api/v1/seller/orders/${cleanId}/ship`, {
      carrier: "Giao Hàng Nhanh (GHN Express)",
      tracking_code: trackingCode,
    });

    const updated = await shopOrderApi.getShopOrderDetail(orderId);
    if (!updated) throw new Error("Không thể tải đơn hàng sau khi giao cho ĐVVC");
    return updated;
  },

  cancelOrder: async (orderId: string, reason: string): Promise<ShopOrderItem> => {
    const cleanId = orderId.replace(/^#/, "").trim();
    await axiosClient.patch(`/api/v1/seller/orders/${cleanId}/cancel`, {
      reason,
    });

    const updated = await shopOrderApi.getShopOrderDetail(orderId);
    if (!updated) throw new Error("Không thể tải đơn hàng sau khi hủy");
    return updated;
  },

  bulkConfirmOrders: async (orderIds: string[]): Promise<string[]> => {
    await Promise.all(
      orderIds.map((id) => shopOrderApi.confirmOrder(id).catch(() => null))
    );
    return orderIds;
  },

  exportOrdersCsv: async (): Promise<string> => {
    const res = await axiosClient.get<BackendSellerOrdersListResponse>(
      "/api/v1/seller/orders",
      {
        params: { status: "ALL", limit: 50 },
      }
    );

    const orders = (res.data?.data?.orders || []).map(mapBackendToShopOrderItem);
    const header =
      "Mã đơn hàng,Ngày tạo,Người nhận,Số điện thoại,Địa chỉ,Sản phẩm,Tổng tiền,Thực nhận,Trạng thái\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.createdAt} ${o.createdAtTime}","${o.customer.name}","${o.customer.phone}","${o.customer.address}","${o.productSummary}",${o.financial.grandTotal},${o.financial.shopPayout},"${o.statusLabel}"`
      )
      .join("\n");
    return header + rows;
  },
};
