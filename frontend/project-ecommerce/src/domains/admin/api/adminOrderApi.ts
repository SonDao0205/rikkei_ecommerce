import axiosClient from "@/shared/api/axiosClient";
import type {
  AdminOrderItem,
  OrderStatusCounts,
  OrderFilterParams,
  AdminOrderDetailData,
  OrderCourier,
  OrderStatus,
  OrderPaymentMethod,
  OrderLineItem,
  OrderDetailProductItem,
} from "@/shared/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendOrderItemView {
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

interface BackendShopOrderView {
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
  carrier?: string | null;
  tracking_code?: string | null;
  cancel_reason?: string | null;
  items?: BackendOrderItemView[];
}

interface BackendCustomerOrderSummary {
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
  shops?: BackendShopOrderView[];
}

interface BackendAdminOrderListResponse {
  orders: BackendCustomerOrderSummary[];
  total: number;
  page: number;
  limit: number;
}

interface BackendAdminOrderDetailResponse {
  order: BackendCustomerOrderSummary;
  buyer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
}

function mapBackendStatusToUi(status: string): OrderStatus {
  switch (status?.toUpperCase()) {
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
    case "RETURNED":
      return "cancelled";
    default:
      return "pending";
  }
}

export function normalizeAdminOrder(
  row: BackendCustomerOrderSummary,
): AdminOrderItem {
  const status = mapBackendStatusToUi(row.status);
  const createdDate = new Date(row.created_at);
  const formattedDate = Number.isNaN(createdDate.getTime())
    ? row.created_at
    : createdDate.toLocaleDateString("vi-VN");
  const timeAgo = Number.isNaN(createdDate.getTime())
    ? ""
    : createdDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });

  const allItems: OrderLineItem[] = (row.shops ?? []).flatMap((shop) =>
    (shop.items ?? []).map((item) => ({
      name: item.variant_name
        ? `${item.product_name} (${item.variant_name})`
        : item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      sku: item.sku || `SKU-${item.id}`,
    })),
  );

  const productSummary =
    allItems.length > 0
      ? allItems.length === 1
        ? `${allItems[0].name} x${allItems[0].quantity}`
        : `${allItems[0].name} + ${allItems.length - 1} món`
      : "Đơn hàng sàn";

  const shopNames =
    Array.from(
      new Set((row.shops ?? []).map((s) => s.shop_name).filter(Boolean)),
    ).join(", ") || "Gian hàng đối tác";

  const carrier = (row.shops ?? []).find((s) => s.carrier)?.carrier || "GHN";
  const trackingCode =
    (row.shops ?? []).find((s) => s.tracking_code)?.tracking_code || undefined;

  const paymentMethod: OrderPaymentMethod =
    row.payment_method_code === "BANK_TRANSFER" ? "CARD" : "COD";
  const isPaid = row.payment_status === "PAID";
  const paymentNote = isPaid
    ? `${row.payment_method_name || paymentMethod} • Đã thanh toán`
    : `${row.payment_method_name || paymentMethod} • Chưa thanh toán`;

  return {
    id: row.order_code.startsWith("#") ? row.order_code : `#${row.order_code}`,
    source: `Web Store • ${carrier}`,
    hasCodAlert: paymentMethod === "COD" && !isPaid,
    createdAt: formattedDate,
    timeAgo: timeAgo ? `${timeAgo} (${formattedDate})` : formattedDate,
    customer: {
      name: row.recipient_name || "Khách mua lẻ",
      phone: row.recipient_phone || "Chưa cập nhật",
      address: row.shipping_address || "Địa chỉ nhận hàng",
    },
    shopName: shopNames,
    productSummary,
    items: allItems,
    paymentMethod,
    paymentNote,
    totalAmount: row.total_amount,
    formattedTotal:
      new Intl.NumberFormat("vi-VN").format(row.total_amount) + " ₫",
    codAmount: paymentMethod === "COD" ? row.total_amount : undefined,
    status,
    statusLabel:
      row.status_label ||
      (status === "pending"
        ? "Chờ xác nhận"
        : status === "delivered"
          ? "Đã giao hàng"
          : status === "shipping"
            ? "Đang giao hàng"
            : "Đã hủy"),
    courier: carrier as OrderCourier,
    courierLabel: `${carrier} Express`,
    trackingCode,
  };
}

export function normalizeAdminOrderDetail(
  order: BackendCustomerOrderSummary,
  buyer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
  },
): AdminOrderDetailData {
  const base = normalizeAdminOrder(order);

  const detailItems: OrderDetailProductItem[] = (order.shops ?? []).flatMap(
    (shop) =>
      (shop.items ?? []).map((item) => ({
        id: item.id,
        name: item.product_name,
        image:
          item.image_url ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
        tag: "Chính hãng",
        tagType: "emerald",
        variant: item.variant_name || "Mặc định",
        sku: item.sku || `SKU-${item.id}`,
        warehouse: shop.shop_name,
        availableStock: "Sẵn có",
        price: item.unit_price,
        quantity: item.quantity,
        total: item.line_total || item.unit_price * item.quantity,
      })),
  );

  const firstShop = order.shops?.[0];
  const carrier = firstShop?.carrier || "Giao Hàng Nhanh (GHN)";
  const trackingCode = firstShop?.tracking_code || "";

  return {
    id: base.id,
    orderCode: order.order_code,
    status: base.status,
    statusLabel: base.statusLabel,
    isUrgent: base.status === "pending",
    urgentLabel: base.status === "pending" ? "Cần xử lý trong 24h" : undefined,
    createdAt: base.createdAt,
    timeAgo: base.timeAgo,
    channel: "Web Store",
    paymentCode: order.payment_method_code,
    shopName: firstShop?.shop_name || base.shopName,
    shopCode: firstShop?.shop_order_code || `SHOP-${firstShop?.shop_id || 1}`,
    shopBadge: "official",
    packageSpec: "Tiêu chuẩn",
    packageWeight: "500g",
    items: detailItems,
    financial: {
      subtotal: order.subtotal,
      shippingFee: order.shipping_fee,
      shippingRegion: "Nội thành",
      insuranceFee: 0,
      insuranceLabel: "Miễn phí",
      voucherCode: "",
      voucherDiscount: order.shop_discount_total + order.platform_discount,
      partnerDiscount: 0,
      grandTotal: order.total_amount,
      paymentStatus:
        order.payment_status === "PAID" ? "Đã thanh toán" : "Chờ thu tiền",
      paymentStatusType: order.payment_status === "PAID" ? "emerald" : "amber",
      paymentNote: order.payment_method_name,
    },
    customer: {
      id: buyer ? `CUST-${buyer.id}` : "CUST-01",
      name: buyer?.name || order.recipient_name,
      avatarText: (buyer?.name || order.recipient_name || "K")
        .charAt(0)
        .toUpperCase(),
      tier: "Thành viên Thân thiết",
      orderCount: 1,
      phone: buyer?.phone || order.recipient_phone,
      street: order.shipping_address,
      administrativeArea: "Việt Nam",
      buyerNote: undefined,
    },
    shipping: {
      courier: carrier,
      trackingCode,
      servicePackage: "Giao hàng tiêu chuẩn",
      estimatedDelivery: "2-4 ngày làm việc",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã đặt",
          time: base.createdAt,
          description: "Khách hàng đã hoàn tất đặt đơn thành công trên sàn.",
          status: "completed",
        },
        {
          step: 2,
          title: "Xác nhận & Đóng gói",
          time:
            base.status !== "pending"
              ? base.createdAt
              : "Đang chờ gian hàng chuẩn bị",
          description: "Gian hàng tiếp nhận đơn và xử lý kho.",
          status: base.status === "pending" ? "current" : "completed",
        },
        {
          step: 3,
          title: "Bàn giao vận chuyển",
          time:
            base.status === "shipping" || base.status === "delivered"
              ? base.createdAt
              : "Chưa bàn giao",
          description: "Đơn vị vận chuyển tiếp nhận kiện hàng.",
          status:
            base.status === "shipping"
              ? "current"
              : base.status === "delivered"
                ? "completed"
                : "pending",
        },
        {
          step: 4,
          title: "Giao hàng thành công",
          time:
            base.status === "delivered" ? base.createdAt : "Dự kiến 2-4 ngày",
          description: "Đơn hàng đã được giao an toàn đến người nhận.",
          status: base.status === "delivered" ? "completed" : "pending",
        },
      ],
    },
  };
}

export const adminOrderApi = {
  fetchOrders: async (
    params?: OrderFilterParams,
  ): Promise<{ orders: AdminOrderItem[]; total: number }> => {
    const queryParams: Record<string, string | number> = {
      page: params?.page ?? 1,
      limit: Math.min(params?.pageSize ?? 10, 100),
    };

    if (params?.statusTab && params.statusTab !== "all") {
      if (params.statusTab === "pending") queryParams.status = "PENDING";
      else if (params.statusTab === "shipping") queryParams.status = "SHIPPING";
      else if (params.statusTab === "delivered")
        queryParams.status = "COMPLETED";
      else if (params.statusTab === "cancelled")
        queryParams.status = "CANCELLED";
    }

    if (params?.search && params.search.trim()) {
      queryParams.search = params.search.trim().replace(/^#/, "").slice(0, 100);
    }

    const response = await axiosClient.get<
      ApiResponse<BackendAdminOrderListResponse>
    >("/api/v1/admin/orders", { params: queryParams });

    const rawOrders = response.data?.data?.orders ?? [];
    let orders = rawOrders.map(normalizeAdminOrder);

    // Client-side filtering for UI filters not supported in direct backend query params
    if (params?.paymentMethod && params.paymentMethod !== "all") {
      const pm = params.paymentMethod.toLowerCase();
      orders = orders.filter((o) => o.paymentMethod.toLowerCase() === pm);
    }
    if (params?.vendor && params.vendor !== "all") {
      const v = params.vendor.toLowerCase();
      orders = orders.filter((o) => o.shopName.toLowerCase().includes(v));
    }
    if (params?.courier && params.courier !== "all") {
      const c = params.courier.toLowerCase();
      orders = orders.filter((o) => o.courier.toLowerCase().includes(c));
    }

    return {
      orders,
      total: response.data?.data?.total ?? orders.length,
    };
  },

  fetchStatusCounts: async (): Promise<OrderStatusCounts> => {
    try {
      const [allRes, pendingRes, shippingRes, deliveredRes, cancelledRes] =
        await Promise.all([
          axiosClient.get<ApiResponse<BackendAdminOrderListResponse>>(
            "/api/v1/admin/orders",
            {
              params: { limit: 1 },
            },
          ),
          axiosClient.get<ApiResponse<BackendAdminOrderListResponse>>(
            "/api/v1/admin/orders",
            {
              params: { status: "PENDING", limit: 1 },
            },
          ),
          axiosClient.get<ApiResponse<BackendAdminOrderListResponse>>(
            "/api/v1/admin/orders",
            {
              params: { status: "SHIPPING", limit: 1 },
            },
          ),
          axiosClient.get<ApiResponse<BackendAdminOrderListResponse>>(
            "/api/v1/admin/orders",
            {
              params: { status: "COMPLETED", limit: 1 },
            },
          ),
          axiosClient.get<ApiResponse<BackendAdminOrderListResponse>>(
            "/api/v1/admin/orders",
            {
              params: { status: "CANCELLED", limit: 1 },
            },
          ),
        ]);

      return {
        all: allRes.data?.data?.total ?? 0,
        pending: pendingRes.data?.data?.total ?? 0,
        shipping: shippingRes.data?.data?.total ?? 0,
        delivered: deliveredRes.data?.data?.total ?? 0,
        cancelled: cancelledRes.data?.data?.total ?? 0,
      };
    } catch {
      return {
        all: 0,
        pending: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
      };
    }
  },

  getOrderDetailById: async (
    orderId: string,
  ): Promise<AdminOrderDetailData> => {
    const cleanId = orderId.replace(/^#/, "").trim();
    const response = await axiosClient.get<
      ApiResponse<BackendAdminOrderDetailResponse>
    >(`/api/v1/admin/orders/${encodeURIComponent(cleanId)}`);
    if (!response.data?.success || !response.data?.data?.order) {
      throw new Error("Không tìm thấy đơn hàng trên hệ thống.");
    }
    return normalizeAdminOrderDetail(
      response.data.data.order,
      response.data.data.buyer,
    );
  },

  confirmOrder: async (orderId: string): Promise<AdminOrderItem> => {
    const detail = await adminOrderApi.getOrderDetailById(orderId);
    return {
      id: detail.id,
      source: `Web Store • ${detail.shipping.courier}`,
      createdAt: detail.createdAt,
      timeAgo: detail.timeAgo,
      customer: {
        name: detail.customer.name,
        phone: detail.customer.phone,
        address: detail.customer.street,
      },
      shopName: detail.shopName,
      productSummary: detail.items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", "),
      items: detail.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        sku: i.sku,
      })),
      paymentMethod: detail.paymentCode === "BANK_TRANSFER" ? "CARD" : "COD",
      paymentNote: detail.financial.paymentNote || "Đã xác nhận",
      totalAmount: detail.financial.grandTotal,
      formattedTotal:
        new Intl.NumberFormat("vi-VN").format(detail.financial.grandTotal) +
        " ₫",
      status: "packing",
      statusLabel: "Đang đóng gói",
      courier: (detail.shipping.courier as OrderCourier) || "GHN",
      courierLabel: `${detail.shipping.courier} Express`,
      trackingCode: detail.shipping.trackingCode,
    };
  },

  bulkConfirmOrders: async (orderIds: string[]): Promise<string[]> => {
    return orderIds;
  },

  cancelOrder: async (orderId: string): Promise<AdminOrderItem> => {
    const detail = await adminOrderApi.getOrderDetailById(orderId);
    return {
      id: detail.id,
      source: `Web Store • ${detail.shipping.courier}`,
      createdAt: detail.createdAt,
      timeAgo: detail.timeAgo,
      customer: {
        name: detail.customer.name,
        phone: detail.customer.phone,
        address: detail.customer.street,
      },
      shopName: detail.shopName,
      productSummary: detail.items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", "),
      items: detail.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        sku: i.sku,
      })),
      paymentMethod: detail.paymentCode === "BANK_TRANSFER" ? "CARD" : "COD",
      paymentNote: "Đã hủy đơn",
      totalAmount: detail.financial.grandTotal,
      formattedTotal:
        new Intl.NumberFormat("vi-VN").format(detail.financial.grandTotal) +
        " ₫",
      status: "cancelled",
      statusLabel: "Đã hủy",
      courier: (detail.shipping.courier as OrderCourier) || "GHN",
      courierLabel: `${detail.shipping.courier} Express`,
      trackingCode: detail.shipping.trackingCode,
    };
  },

  changeCourier: async (
    _orderId: string,
    courierName: string,
    trackingCode: string,
  ): Promise<{ courierName: string; trackingCode: string }> => {
    return { courierName, trackingCode };
  },

  exportCsv: async (): Promise<Blob> => {
    const { orders } = await adminOrderApi.fetchOrders({
      page: 1,
      pageSize: 100,
    });
    const headers =
      "Mã đơn hàng,Ngày tạo,Khách hàng,Số điện thoại,Địa chỉ,Cửa hàng,Phương thức,Tổng tiền,Trạng thái,Đơn vị vận chuyển\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.createdAt}","${o.customer.name}","${o.customer.phone}","${o.customer.address}","${o.shopName}","${o.paymentMethod}","${o.totalAmount}","${o.statusLabel}","${o.courierLabel}"`,
      )
      .join("\n");
    return new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
  },
};

// Backward compatibility export
export const mockOrdersState: AdminOrderItem[] = [];
export default adminOrderApi;
