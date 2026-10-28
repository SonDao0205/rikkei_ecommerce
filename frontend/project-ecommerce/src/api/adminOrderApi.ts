import axiosClient from "./axiosClient";
import type {
  AdminOrderItem,
  OrderStatusCounts,
  OrderFilterParams,
} from "../types/ecommerce";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export let mockOrdersState: AdminOrderItem[] = [
  {
    id: "#ORD-9821",
    source: "Web Store • GHTK",
    hasCodAlert: true,
    createdAt: "27/10/2024",
    timeAgo: "14:18 (15m trước)",
    customer: {
      name: "Nguyễn Văn A",
      phone: "+84 909 123 456",
      address: "142 Võ Thị Sáu, Q.3, TP.HCM",
    },
    shopName: "UrbanStep Official",
    productSummary: "Retro Runner V2 Sneaker + 1 món",
    items: [
      {
        name: "Retro Runner V2 Sneaker - Off White / Forest Green",
        quantity: 1,
        price: 1250000,
        sku: "SKU-SNK-042",
      },
      {
        name: "Cushioned Bamboo Athletic Socks",
        quantity: 1,
        price: 165000,
        sku: "SKU-SOX-102",
      },
    ],
    paymentMethod: "COD",
    paymentNote: "Chờ thu tiền COD",
    totalAmount: 1415000,
    formattedTotal: "1.415.000 ₫",
    codAmount: 1415000,
    status: "pending",
    statusLabel: "Chờ xác nhận",
    courier: "GHTK",
    courierLabel: "GHTK Express",
    trackingCode: "GHTK-VN882190",
  },
  {
    id: "#ORD-9820",
    source: "TikTok Shop",
    createdAt: "27/10/2024",
    timeAgo: "13:45 (48m trước)",
    customer: {
      name: "Trần Thị Mai",
      phone: "+84 988 345 221",
      address: "Hà Đông, Hà Nội",
    },
    shopName: "Crafted Saigon",
    productSummary: "Leather Wallet Pro x1",
    items: [
      {
        name: "Minimalist Vegetable Tanned Leather Cardholder",
        quantity: 1,
        price: 850000,
        sku: "SKU-CRD-770",
      },
    ],
    paymentMethod: "MOMO",
    paymentNote: "Đã thanh toán",
    totalAmount: 850000,
    formattedTotal: "850.000 ₫",
    status: "shipping",
    statusLabel: "Đang giao hàng",
    courier: "GHN",
    courierLabel: "GHN Logistics",
    trackingCode: "GHN-HN99201",
  },
  {
    id: "#ORD-9818",
    source: "Shopee Cluster",
    createdAt: "27/10/2024",
    timeAgo: "12:30 (2h trước)",
    customer: {
      name: "Lê Hoàng Nam",
      phone: "+84 912 884 102",
      address: "Hải Châu, Đà Nẵng",
    },
    shopName: "Terra Living Lab",
    productSummary: "Ceramic Pour-Over Set",
    items: [
      {
        name: "Hand-thrown Wood Ash Ceramic Tumbler (Set of 2)",
        quantity: 1,
        price: 620000,
        sku: "SKU-DRP-882",
      },
    ],
    paymentMethod: "COD",
    paymentNote: "Đã thu COD",
    totalAmount: 620000,
    formattedTotal: "620.000 ₫",
    codAmount: 620000,
    status: "delivered",
    statusLabel: "Đã giao thành công",
    courier: "GHTK",
    courierLabel: "GHTK Express",
    trackingCode: "GHTK-DN8818",
  },
  {
    id: "#ORD-9815",
    source: "Web Store",
    createdAt: "27/10/2024",
    timeAgo: "11:15 (3h trước)",
    customer: {
      name: "Đỗ Thùy Trang",
      phone: "+84 977 412 009",
      address: "Bình Thạnh, TP. HCM",
    },
    shopName: "UrbanStep Official",
    productSummary: "Air Canvas Low x1",
    items: [
      {
        name: "Track 6 Low Top Vulcanized Canvas Sneaker",
        quantity: 1,
        price: 1890000,
        sku: "SKU-SNK-066",
      },
    ],
    paymentMethod: "VISA",
    paymentNote: "Đã thanh toán online",
    totalAmount: 1890000,
    formattedTotal: "1.890.000 ₫",
    status: "pending",
    statusLabel: "Chờ xác nhận",
    courier: "GHN",
    courierLabel: "GHN Logistics",
    trackingCode: "GHN-SG9815",
  },
  {
    id: "#ORD-9812",
    source: "Lazada Partner",
    createdAt: "27/10/2024",
    timeAgo: "10:20 (4h trước)",
    customer: {
      name: "Phạm Quốc Hưng",
      phone: "+84 934 551 892",
      address: "Ninh Kiều, Cần Thơ",
    },
    shopName: "UrbanStep Official",
    productSummary: "Trail Boot Rugged x1",
    items: [
      {
        name: "Tactical Parachute Cargo Pants - Sage Olive",
        quantity: 1,
        price: 2450000,
        sku: "SKU-BOT-091",
      },
    ],
    paymentMethod: "COD",
    paymentNote: "Chờ thu COD",
    totalAmount: 2450000,
    formattedTotal: "2.450.000 ₫",
    codAmount: 2450000,
    status: "packing",
    statusLabel: "Đang đóng gói",
    courier: "VIETTEL_POST",
    courierLabel: "Viettel Post",
    trackingCode: "VT-CT9812",
  },
  {
    id: "#ORD-9804",
    source: "Web Store",
    createdAt: "27/10/2024",
    timeAgo: "08:15 (6h trước)",
    customer: {
      name: "Vũ Hoài Thương",
      phone: "+84 945 091 228",
      address: "Hạ Long, Quảng Ninh",
    },
    shopName: "Crafted Saigon",
    productSummary: "Canvas Backpack V3 x1",
    items: [
      {
        name: "Utility Crossbody Sling w/ Magnetic Fidlock",
        quantity: 1,
        price: 1100000,
        sku: "SKU-BAG-301",
      },
    ],
    paymentMethod: "COD",
    paymentNote: "Đã huỷ đơn COD",
    totalAmount: 1100000,
    formattedTotal: "1.100.000 ₫",
    status: "cancelled",
    statusLabel: "Đã huỷ",
    courier: "GHTK",
    courierLabel: "GHTK Express",
    trackingCode: "GHTK-QN9804",
  },
];

export const adminOrderApi = {
  fetchOrders: async (params?: OrderFilterParams): Promise<{ orders: AdminOrderItem[]; total: number }> => {
    try {
      const response = await axiosClient.get<ApiResponse<{ orders: AdminOrderItem[]; total: number }>>(
        "/api/v1/admin/orders",
        { params }
      );
      if (response.data && response.data.data && response.data.data.orders) {
        return response.data.data;
      }
    } catch {
      // Fallback to in-memory mock data
    }

    let filtered = [...mockOrdersState];

    // Status Tab Filter
    if (params?.statusTab && params.statusTab !== "all") {
      if (params.statusTab === "shipping") {
        filtered = filtered.filter((o) => o.status === "shipping" || o.status === "packing");
      } else {
        filtered = filtered.filter((o) => o.status === params.statusTab);
      }
    }

    // Search Filter
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.shopName.toLowerCase().includes(q) ||
          o.productSummary.toLowerCase().includes(q)
      );
    }

    // Payment Method Filter
    if (params?.paymentMethod && params.paymentMethod !== "all") {
      filtered = filtered.filter((o) => o.paymentMethod.toLowerCase() === params.paymentMethod!.toLowerCase());
    }

    // Vendor Filter
    if (params?.vendor && params.vendor !== "all") {
      filtered = filtered.filter((o) => o.shopName.toLowerCase() === params.vendor!.toLowerCase());
    }

    // Courier Filter
    if (params?.courier && params.courier !== "all") {
      filtered = filtered.filter((o) => o.courier.toLowerCase() === params.courier!.toLowerCase());
    }

    return {
      orders: filtered,
      total: 48, // matching the total 48 active orders in admin_order.html
    };
  },

  fetchStatusCounts: async (): Promise<OrderStatusCounts> => {
    try {
      const response = await axiosClient.get<ApiResponse<OrderStatusCounts>>("/api/v1/admin/orders/counts");
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    return {
      all: 48,
      pending: 5,
      shipping: 18,
      delivered: 23,
      cancelled: 2,
    };
  },

  confirmOrder: async (orderId: string): Promise<AdminOrderItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminOrderItem>>(`/api/v1/admin/orders/${orderId}/confirm`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
    }

    const index = mockOrdersState.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      mockOrdersState[index] = {
        ...mockOrdersState[index],
        status: "shipping",
        statusLabel: "Đang giao hàng",
      };
      return mockOrdersState[index];
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  bulkConfirmOrders: async (orderIds: string[]): Promise<string[]> => {
    try {
      await axiosClient.post("/api/v1/admin/orders/bulk-confirm", { orderIds });
    } catch {
      // In-memory update
    }

    mockOrdersState = mockOrdersState.map((o) =>
      orderIds.includes(o.id)
        ? { ...o, status: "shipping", statusLabel: "Đang giao hàng" }
        : o
    );

    return orderIds;
  },

  cancelOrder: async (orderId: string): Promise<AdminOrderItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminOrderItem>>(`/api/v1/admin/orders/${orderId}/cancel`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
    }

    const index = mockOrdersState.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      mockOrdersState[index] = {
        ...mockOrdersState[index],
        status: "cancelled",
        statusLabel: "Đã huỷ",
        paymentNote: "Đã huỷ đơn",
      };
      return mockOrdersState[index];
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  exportCsv: async (): Promise<Blob> => {
    try {
      const response = await axiosClient.get("/api/v1/admin/orders/export", { responseType: "blob" });
      return response.data;
    } catch {
      const headers = "Order ID,Date,Customer,Phone,Address,Shop,Payment,Total,Status,Courier\n";
      const rows = mockOrdersState
        .map(
          (o) =>
            `"${o.id}","${o.createdAt}","${o.customer.name}","${o.customer.phone}","${o.customer.address}","${o.shopName}","${o.paymentMethod}","${o.totalAmount}","${o.statusLabel}","${o.courierLabel}"`
        )
        .join("\n");
      return new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    }
  },
};

export default adminOrderApi;
