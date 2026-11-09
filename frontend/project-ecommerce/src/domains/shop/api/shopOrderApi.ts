import type {
  ShopOrderItem,
  ShopOrderStatusCounts,
  ShopOrderFilterParams,
} from "@/domains/shop/types/shopOrder.types";

export let mockShopOrdersState: ShopOrderItem[] = [
  {
    id: "#ORD-9821",
    orderCode: "ORD-9821",
    createdAt: "08/11/2026",
    createdAtTime: "14:18",
    timeAgo: "15 phút trước",
    status: "pending",
    statusLabel: "Chờ xác nhận",
    isUrgent: true,
    customer: {
      name: "Nguyễn Văn An",
      phone: "0909 123 456",
      address: "142 Võ Thị Sáu, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh",
      email: "vanan.nguyen@gmail.com",
      avatarText: "VA",
      buyerNote: "Giao giờ hành chính, gọi trước khi giao giúp mình.",
      orderCount: 8,
      tier: "Khách hàng Thân thiết (Gold)",
    },
    items: [
      {
        id: "item-1",
        productId: 101,
        name: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
        variant: "Đen Tuyền - Size 41",
        sku: "RR-V2-BLK-41",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        price: 890000,
        formattedPrice: "890.000 ₫",
        quantity: 1,
        total: 890000,
        formattedTotal: "890.000 ₫",
        warehouseStock: 40,
      },
      {
        id: "item-2",
        productId: 102,
        name: "Vớ Thể Thao Dệt Sợi Tre Kháng Khuẩn Ortho Cushion",
        variant: "Trắng Ngà - Set 3 đôi",
        sku: "SOX-BAMBOO-SET3",
        imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600",
        price: 150000,
        formattedPrice: "150.000 ₫",
        quantity: 2,
        total: 300000,
        formattedTotal: "300.000 ₫",
        warehouseStock: 120,
      },
    ],
    productSummary: "Giày Sneaker Retro Runner V2 + 2 món",
    totalQuantity: 3,
    financial: {
      subtotal: 1190000,
      shopDiscount: 50000,
      shippingFee: 28000,
      platformDiscount: 20000,
      grandTotal: 1148000,
      platformFee: 57400, // 5%
      shopPayout: 1082600,
      formattedShopPayout: "1.082.600 ₫",
      paymentMethod: "COD",
      paymentStatus: "cod_pending",
      paymentStatusLabel: "Thu hộ COD khi nhận hàng",
    },
    shipping: {
      courier: "GHN",
      courierLabel: "Giao Hàng Nhanh (GHN Express)",
      trackingCode: "GHN-VN882190",
      servicePackage: "Chuyển phát tiêu chuẩn đường bộ",
      estimatedDeliveryDate: "10/11/2026",
      weightGram: 850,
      dimensionsText: "32 x 22 x 14 cm",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã được tạo thành công",
          time: "14:18 - 08/11/2026",
          description: "Người mua đã hoàn tất đặt đơn hàng trên hệ thống MarketPulse.",
          status: "completed",
        },
        {
          step: 2,
          title: "Chờ gian hàng xác nhận đơn",
          time: "14:19 - 08/11/2026",
          description: "Shop cần chuẩn bị hàng và xác nhận trước 14:00 ngày 09/11/2026 (SLA 24h).",
          status: "current",
        },
        {
          step: 3,
          title: "Bàn giao cho đơn vị vận chuyển",
          time: "Dự kiến 09/11/2026",
          description: "Shipper GHN sẽ đến lấy hàng tại kho của gian hàng.",
          status: "pending",
        },
        {
          step: 4,
          title: "Đang trung chuyển & giao hàng",
          time: "Dự kiến 09 - 10/11/2026",
          description: "Bưu kiện trên đường giao đến người nhận.",
          status: "pending",
        },
        {
          step: 5,
          title: "Giao hàng thành công",
          time: "Dự kiến 10/11/2026",
          description: "Người mua kiểm tra và ký nhận hàng.",
          status: "pending",
        },
      ],
    },
  },
  {
    id: "#ORD-9820",
    orderCode: "ORD-9820",
    createdAt: "08/11/2026",
    createdAtTime: "11:30",
    timeAgo: "3 giờ trước",
    status: "packing",
    statusLabel: "Đang chuẩn bị hàng",
    customer: {
      name: "Trần Thị Thuỷ Tiên",
      phone: "0988 345 221",
      address: "Số 25 ngõ 180 Triều Khúc, Phường Thanh Xuân Nam, Quận Thanh Xuân, Hà Nội",
      email: "thuytien.tran@gmail.com",
      avatarText: "TT",
      buyerNote: "Đóng gói bọc kỹ bằng xốp chống va đập giúp mình nhé.",
      orderCount: 3,
      tier: "Khách hàng Mới",
    },
    items: [
      {
        id: "item-3",
        productId: 103,
        name: "Áo Khoác Bomber Kaki Washed Vintage Unisex",
        variant: "Xanh Rêu - Size L",
        sku: "JKT-BMB-GRN-L",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600",
        price: 650000,
        formattedPrice: "650.000 ₫",
        quantity: 1,
        total: 650000,
        formattedTotal: "650.000 ₫",
        warehouseStock: 18,
      },
    ],
    productSummary: "Áo Khoác Bomber Kaki Washed Vintage Unisex",
    totalQuantity: 1,
    financial: {
      subtotal: 650000,
      shopDiscount: 0,
      shippingFee: 32000,
      platformDiscount: 15000,
      grandTotal: 667000,
      platformFee: 32500,
      shopPayout: 617500,
      formattedShopPayout: "617.500 ₫",
      paymentMethod: "MOMO",
      paymentStatus: "paid",
      paymentStatusLabel: "Đã thanh toán qua Ví MoMo",
    },
    shipping: {
      courier: "VIETTEL_POST",
      courierLabel: "Viettel Post Nhanh",
      trackingCode: "VTP-HN99201",
      servicePackage: "Chuyển phát nhanh bưu kiện",
      estimatedDeliveryDate: "11/11/2026",
      weightGram: 700,
      dimensionsText: "30 x 20 x 10 cm",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã được tạo thành công",
          time: "11:30 - 08/11/2026",
          description: "Người mua đã thanh toán 100% qua ví MoMo.",
          status: "completed",
        },
        {
          step: 2,
          title: "Shop đã xác nhận đơn hàng",
          time: "11:45 - 08/11/2026",
          description: "Shop đang đóng gói bưu kiện, đã in phiếu xuất kho.",
          status: "completed",
        },
        {
          step: 3,
          title: "Chờ bưu tá Viettel Post đến lấy hàng",
          time: "13:00 - 08/11/2026",
          description: "Đã điều phối bưu tá hẹn lấy trước 17:00 hôm nay.",
          status: "current",
        },
        {
          step: 4,
          title: "Vận chuyển đến bưu cục phát",
          time: "Dự kiến 09/11/2026",
          description: "Bưu kiện trên đường trung chuyển Hà Nội.",
          status: "pending",
        },
        {
          step: 5,
          title: "Giao hàng thành công",
          time: "Dự kiến 11/11/2026",
          description: "Giao tận tay người nhận.",
          status: "pending",
        },
      ],
    },
  },
  {
    id: "#ORD-9818",
    orderCode: "ORD-9818",
    createdAt: "07/11/2026",
    createdAtTime: "10:15",
    timeAgo: "1 ngày trước",
    status: "shipping",
    statusLabel: "Đang giao hàng",
    customer: {
      name: "Lê Hoàng Nam",
      phone: "0912 884 102",
      address: "Chung cư Hoàng Anh Gia Lai, 72 Hàm Nghi, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng",
      email: "nam.lehoang@yahoo.com",
      avatarText: "LN",
      orderCount: 12,
      tier: "Khách hàng VIP (Diamond)",
    },
    items: [
      {
        id: "item-4",
        productId: 104,
        name: "Bình Gốm Men Hoả Biến Nghệ Thuật Vuông Cổ Tròn",
        variant: "Hỏa Biến Hổ Phách - Size M (25cm)",
        sku: "CER-AMBER-25",
        imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600",
        price: 480000,
        formattedPrice: "480.000 ₫",
        quantity: 1,
        total: 480000,
        formattedTotal: "480.000 ₫",
        warehouseStock: 9,
      },
      {
        id: "item-5",
        productId: 105,
        name: "Đế Gỗ Tự Nhiên Kê Bình Gốm Khắc Tay",
        variant: "Gỗ Óc Chó 15cm",
        sku: "WOOD-BASE-15",
        imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
        price: 140000,
        formattedPrice: "140.000 ₫",
        quantity: 1,
        total: 140000,
        formattedTotal: "140.000 ₫",
        warehouseStock: 25,
      },
    ],
    productSummary: "Bình Gốm Men Hoả Biến + 1 món",
    totalQuantity: 2,
    financial: {
      subtotal: 620000,
      shopDiscount: 30000,
      shippingFee: 40000,
      platformDiscount: 0,
      grandTotal: 630000,
      platformFee: 29500,
      shopPayout: 560500,
      formattedShopPayout: "560.500 ₫",
      paymentMethod: "VISA",
      paymentStatus: "paid",
      paymentStatusLabel: "Đã thanh toán thẻ Quốc tế Visa",
    },
    shipping: {
      courier: "SPX",
      courierLabel: "SPX Express Nhanh",
      trackingCode: "SPX-DN77312",
      servicePackage: "Vận chuyển Hàng dễ vỡ đặc biệt",
      estimatedDeliveryDate: "09/11/2026",
      weightGram: 1200,
      dimensionsText: "28 x 28 x 35 cm",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã được tạo thành công",
          time: "10:15 - 07/11/2026",
          description: "Thanh toán thành công qua thẻ Visa.",
          status: "completed",
        },
        {
          step: 2,
          title: "Shop đã đóng gói và dán tem hàng dễ vỡ",
          time: "11:30 - 07/11/2026",
          description: "Kiện hàng được bọc 3 lớp bóng khí và nẹp góc mút xốp.",
          status: "completed",
        },
        {
          step: 3,
          title: "SPX Express đã lấy hàng thành công",
          time: "15:00 - 07/11/2026",
          description: "Bưu kiện đã nhập kho phân loại Tân Bình.",
          status: "completed",
        },
        {
          step: 4,
          title: "Đang trên đường bay tới Đà Nẵng",
          time: "06:30 - 08/11/2026",
          description: "Dự kiến đến kho trung chuyển Đà Nẵng vào chiều nay.",
          status: "current",
        },
        {
          step: 5,
          title: "Giao hàng thành công",
          time: "Dự kiến 09/11/2026",
          description: "Giao tận tay người nhận.",
          status: "pending",
        },
      ],
    },
  },
  {
    id: "#ORD-9815",
    orderCode: "ORD-9815",
    createdAt: "05/11/2026",
    createdAtTime: "09:00",
    timeAgo: "3 ngày trước",
    status: "delivered",
    statusLabel: "Đã giao hàng thành công",
    customer: {
      name: "Phạm Hải Yến",
      phone: "0934 567 890",
      address: "Tòa S2.05 Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
      email: "haiyen.pham@gmail.com",
      avatarText: "PY",
      orderCount: 5,
      tier: "Khách hàng Thân thiết (Silver)",
    },
    items: [
      {
        id: "item-6",
        productId: 101,
        name: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
        variant: "Trắng Kem - Size 40",
        sku: "RR-V2-WHT-40",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        price: 890000,
        formattedPrice: "890.000 ₫",
        quantity: 1,
        total: 890000,
        formattedTotal: "890.000 ₫",
        warehouseStock: 35,
      },
    ],
    productSummary: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
    totalQuantity: 1,
    financial: {
      subtotal: 890000,
      shopDiscount: 40000,
      shippingFee: 30000,
      platformDiscount: 20000,
      grandTotal: 860000,
      platformFee: 42500,
      shopPayout: 807500,
      formattedShopPayout: "807.500 ₫",
      paymentMethod: "COD",
      paymentStatus: "paid",
      paymentStatusLabel: "Đã thanh toán & Bưu tá đã đối soát COD",
    },
    shipping: {
      courier: "GHN",
      courierLabel: "Giao Hàng Nhanh (GHN Express)",
      trackingCode: "GHN-HN881511",
      servicePackage: "Chuyển phát tiêu chuẩn đường bộ",
      estimatedDeliveryDate: "07/11/2026",
      weightGram: 850,
      dimensionsText: "32 x 22 x 14 cm",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã được tạo thành công",
          time: "09:00 - 05/11/2026",
          description: "Người mua chọn thanh toán khi nhận hàng COD.",
          status: "completed",
        },
        {
          step: 2,
          title: "Shop đã gửi hàng cho GHN",
          time: "14:00 - 05/11/2026",
          description: "Hàng đã xuất khỏi kho gian hàng.",
          status: "completed",
        },
        {
          step: 3,
          title: "Đang giao hàng",
          time: "08:30 - 07/11/2026",
          description: "Shipper GHN đang trên đường giao bưu kiện.",
          status: "completed",
        },
        {
          step: 4,
          title: "Giao hàng thành công",
          time: "10:45 - 07/11/2026",
          description: "Khách hàng đã nhận bưu phẩm và thanh toán đủ 860.000 ₫.",
          status: "completed",
        },
      ],
    },
  },
  {
    id: "#ORD-9812",
    orderCode: "ORD-9812",
    createdAt: "03/11/2026",
    createdAtTime: "16:20",
    timeAgo: "5 ngày trước",
    status: "cancelled",
    statusLabel: "Đã huỷ đơn",
    cancelReason: "Người mua đổi ý muốn đổi sang mẫu giày khác",
    customer: {
      name: "Đặng Minh Quân",
      phone: "0977 112 334",
      address: "Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ",
      email: "minhquan@gmail.com",
      avatarText: "MQ",
      orderCount: 2,
      tier: "Khách hàng Mới",
    },
    items: [
      {
        id: "item-7",
        productId: 101,
        name: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
        variant: "Xám Khói - Size 41",
        sku: "RR-V2-GRY-41",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        price: 890000,
        formattedPrice: "890.000 ₫",
        quantity: 1,
        total: 890000,
        formattedTotal: "890.000 ₫",
        warehouseStock: 15,
      },
    ],
    productSummary: "Giày Sneaker Retro Runner V2 Da Lộn Thủ Công",
    totalQuantity: 1,
    financial: {
      subtotal: 890000,
      shopDiscount: 0,
      shippingFee: 35000,
      platformDiscount: 0,
      grandTotal: 925000,
      platformFee: 0,
      shopPayout: 0,
      formattedShopPayout: "0 ₫",
      paymentMethod: "COD",
      paymentStatus: "unpaid",
      paymentStatusLabel: "Đã huỷ trước khi giao hàng",
    },
    shipping: {
      courier: "GHTK",
      courierLabel: "Giao Hàng Tiết Kiệm (GHTK)",
      trackingCode: "GHTK-CT9812",
      servicePackage: "Giao hàng tiêu chuẩn",
      estimatedDeliveryDate: "--",
      weightGram: 850,
      dimensionsText: "32 x 22 x 14 cm",
      timeline: [
        {
          step: 1,
          title: "Đơn hàng đã được tạo thành công",
          time: "16:20 - 03/11/2026",
          description: "Đơn hàng khởi tạo.",
          status: "completed",
        },
        {
          step: 2,
          title: "Đơn hàng đã bị huỷ",
          time: "17:05 - 03/11/2026",
          description: "Lý do: Người mua đổi ý muốn đổi sang mẫu giày khác.",
          status: "completed",
        },
      ],
    },
  },
];

export const shopOrderApi = {
  fetchShopOrders: async (
    params?: ShopOrderFilterParams
  ): Promise<{ orders: ShopOrderItem[]; total: number }> => {
    await new Promise((res) => setTimeout(res, 200));

    let result = [...mockShopOrdersState];

    if (params?.statusTab && params.statusTab !== "all") {
      result = result.filter((o) => o.status === params.statusTab);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.orderCode.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.productSummary.toLowerCase().includes(q) ||
          o.shipping.trackingCode.toLowerCase().includes(q)
      );
    }

    if (params?.paymentMethod && params.paymentMethod !== "all") {
      result = result.filter((o) => o.financial.paymentMethod === params.paymentMethod);
    }

    if (params?.courier && params.courier !== "all") {
      result = result.filter((o) => o.shipping.courier === params.courier);
    }

    return {
      orders: result,
      total: result.length,
    };
  },

  fetchShopOrderCounts: async (): Promise<ShopOrderStatusCounts> => {
    await new Promise((res) => setTimeout(res, 100));
    const all = mockShopOrdersState.length;
    const pending = mockShopOrdersState.filter((o) => o.status === "pending").length;
    const packing = mockShopOrdersState.filter((o) => o.status === "packing").length;
    const shipping = mockShopOrdersState.filter((o) => o.status === "shipping").length;
    const delivered = mockShopOrdersState.filter((o) => o.status === "delivered").length;
    const cancelled = mockShopOrdersState.filter((o) => o.status === "cancelled").length;
    const returned = mockShopOrdersState.filter((o) => o.status === "returned").length;

    return { all, pending, packing, shipping, delivered, cancelled, returned };
  },

  getShopOrderDetail: async (id: string): Promise<ShopOrderItem | null> => {
    await new Promise((res) => setTimeout(res, 150));
    const normalizedId = id.startsWith("#") ? id : `#${id}`;
    const order = mockShopOrdersState.find(
      (o) => o.id === normalizedId || o.orderCode === id.replace("#", "")
    );
    return order || mockShopOrdersState[0] || null;
  },

  confirmOrder: async (orderId: string): Promise<ShopOrderItem> => {
    await new Promise((res) => setTimeout(res, 200));
    const normalizedId = orderId.startsWith("#") ? orderId : `#${orderId}`;
    const idx = mockShopOrdersState.findIndex((o) => o.id === normalizedId);
    if (idx !== -1) {
      const order = mockShopOrdersState[idx];
      const updated: ShopOrderItem = {
        ...order,
        status: "packing",
        statusLabel: "Đang chuẩn bị hàng",
        shipping: {
          ...order.shipping,
          timeline: [
            ...order.shipping.timeline,
            {
              step: order.shipping.timeline.length + 1,
              title: "Shop đã xác nhận đơn hàng",
              time: "Vừa xong",
              description: "Shop bắt đầu đóng gói và chuẩn bị giao cho bưu tá.",
              status: "completed",
            },
          ],
        },
      };
      mockShopOrdersState[idx] = updated;
      return updated;
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  dispatchOrder: async (orderId: string): Promise<ShopOrderItem> => {
    await new Promise((res) => setTimeout(res, 200));
    const normalizedId = orderId.startsWith("#") ? orderId : `#${orderId}`;
    const idx = mockShopOrdersState.findIndex((o) => o.id === normalizedId);
    if (idx !== -1) {
      const order = mockShopOrdersState[idx];
      const updated: ShopOrderItem = {
        ...order,
        status: "shipping",
        statusLabel: "Đang giao hàng",
        shipping: {
          ...order.shipping,
          timeline: [
            ...order.shipping.timeline,
            {
              step: order.shipping.timeline.length + 1,
              title: "Đã bàn giao cho đơn vị vận chuyển",
              time: "Vừa xong",
              description: `Kiện hàng đã được nhân viên ${order.shipping.courierLabel} quét nhận.`,
              status: "completed",
            },
          ],
        },
      };
      mockShopOrdersState[idx] = updated;
      return updated;
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  cancelOrder: async (orderId: string, reason: string): Promise<ShopOrderItem> => {
    await new Promise((res) => setTimeout(res, 200));
    const normalizedId = orderId.startsWith("#") ? orderId : `#${orderId}`;
    const idx = mockShopOrdersState.findIndex((o) => o.id === normalizedId);
    if (idx !== -1) {
      const order = mockShopOrdersState[idx];
      const updated: ShopOrderItem = {
        ...order,
        status: "cancelled",
        statusLabel: "Đã huỷ đơn",
        cancelReason: reason,
        financial: {
          ...order.financial,
          shopPayout: 0,
          formattedShopPayout: "0 ₫",
        },
      };
      mockShopOrdersState[idx] = updated;
      return updated;
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  bulkConfirmOrders: async (orderIds: string[]): Promise<string[]> => {
    await new Promise((res) => setTimeout(res, 300));
    mockShopOrdersState = mockShopOrdersState.map((o) => {
      if (orderIds.includes(o.id) && o.status === "pending") {
        return {
          ...o,
          status: "packing",
          statusLabel: "Đang chuẩn bị hàng",
        };
      }
      return o;
    });
    return orderIds;
  },

  exportOrdersCsv: async (): Promise<string> => {
    await new Promise((res) => setTimeout(res, 400));
    const header = "Mã đơn hàng,Ngày tạo,Người nhận,Số điện thoại,Địa chỉ,Sản phẩm,Tổng tiền,Thực nhận,Trạng thái\n";
    const rows = mockShopOrdersState
      .map(
        (o) =>
          `"${o.id}","${o.createdAt} ${o.createdAtTime}","${o.customer.name}","${o.customer.phone}","${o.customer.address}","${o.productSummary}",${o.financial.grandTotal},${o.financial.shopPayout},"${o.statusLabel}"`
      )
      .join("\n");
    return header + rows;
  },
};

