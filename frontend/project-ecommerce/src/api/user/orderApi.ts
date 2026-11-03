import axiosClient from "../axiosClient";
import type {
  UserOrder,
  UserOrderStatusCounts,
  UserOrderFilterParams,
} from "../../types/order";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const mockUserOrders: UserOrder[] = [
  {
    id: 1,
    orderCode: "#ORD-9821",
    userId: 1,
    status: "shipping",
    statusLabel: "ĐANG VẬN CHUYỂN",
    subtotal: 1600000,
    shippingFee: 30000,
    shippingDiscount: 25000,
    shopDiscount: 50000,
    totalAmount: 1555000,
    paymentMethod: "COD",
    paymentStatusText: "COD - Thanh toán khi nhận hàng (Chưa thanh toán)",
    shippingInfoText: "Đang vận chuyển • GHN Express - Dự kiến giao 28/10/2026",
    estimatedDeliveryDate: "28/10/2026",
    courierName: "Giao Hàng Nhanh (GHN Express)",
    trackingCode: "GHN88391204VN",
    createdAt: "14:20, 26/10/2026",
    updatedAtText: "Cập nhật cách đây 12 phút",
    recipient: {
      name: "Nguyễn Văn A",
      phone: "(+84) 909 123 456",
      address: "Số 142/8 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
      addressType: "Nhà riêng",
      note: "Giao giờ hành chính, gọi trước 15 phút. Cho kiểm tra hàng (Đồng kiểm COD).",
    },
    timeline: [
      {
        id: "log-1",
        time: "27/10 08:15",
        title: "Bưu kiện đã rời kho trung chuyển Tân Bình và đang được điều phối về bưu cục phát Quận Bình Thạnh.",
        subtitle: "Bưu tá phụ trách: Trần Minh Quân - Dự kiến giao hôm nay",
        isLatest: true,
      },
      {
        id: "log-2",
        time: "26/10 21:40",
        title: "Đã nhập kho phân loại tổng Sài Gòn Hub (Khu công nghiệp Tân Bình).",
      },
      {
        id: "log-3",
        time: "26/10 19:10",
        title: "Đang luân chuyển liên quận - Xe trung chuyển GHN xuất phát từ kho Long Biên/Quận 7.",
      },
      {
        id: "log-4",
        time: "26/10 18:30",
        title: "Shipper GHN đã lấy hàng thành công từ các Shop (UrbanStep, Indochine Studio).",
      },
      {
        id: "log-5",
        time: "26/10 14:45",
        title: "Các Shop đã in mã vận đơn và chuẩn bị kiện hàng kèm tem niêm phong hàng dễ vỡ.",
      },
      {
        id: "log-6",
        time: "26/10 14:20",
        title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
      },
    ],
    shops: [
      {
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
        logoUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDLIVMTD3tN9t8DW2gRLuII8RtcJ1WtIBdCkzmYhY6-TYcHJOFc2giilqAtkBiRQIscRbEURiDZa67g61nobIRK_J_qGFR3Jku_Zens3U5GbUrDOnsyiDRMbBiWd6n6shGFvEr_QoMhconplZMQTAS06QeTNavQOeeTtaN2CWYxs_SwfMPIaEhBVzGqNRDhCs6MN81eLFF5g9jmKUkcV7zDmVaZS9BLftM_6JfcS1A",
      },
      {
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
      },
    ],
    items: [
      {
        id: 101,
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
        productId: 1,
        productName: "Sneaker Retro Runner V2 Cổ Thấp Da Lộn Thủ Công",
        variantName: "Size 42 • Màu: Đen Tuyền",
        sku: "SKU-SNK-042",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD_vsXgoRSZm5MzGXlOHy2-wZU4GIhBwAfm4CdRzn5GDmCWYIqnCXLBm3BkjUjzP4EjPMhAK9y5YUN5ymFYdIwt0Sue0CPn6-To6Qjn2LxmjOvJoAE7oLCuEFnSMOcVg8mOjP2jjJAt0BGSdlYdLH0Wx32WBcJQypII2uDZRrbS2z2wB-Ew1ezCm9c0GKWfeWnhWak02r1R8gkPujWaa7pey2iT5tASP-4k0w_-ajMZTV1zdz-KhtNS",
        quantity: 1,
        unitPrice: 850000,
      },
      {
        id: 102,
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
        productId: 2,
        productName: "Vớ Cổ Ngắn Bamboo Athletic Socks",
        variantName: "Size L • Combo 3 Đôi Trắng/Xám",
        sku: "SKU-SOX-001",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuD1fbtg3f7ZFidlp8MojgksmWMV6gEOuKq8x1FcIJ6Jw6V6b6Rm6bBG7irf8zsAIzPo44mRTuYDeKZ2woOW3zKnFTjdum-oh1hzkAJIU1QtxmSBdxi95gkrvul1j-a7utQ8o7T3wfie-o2cP8a8zwwfOvrOTyGr-DreOdTF81kD0BRuM27pSsXh10dTgLZeVYVWN9-7KiRe27RKlXzDLu1eZ_XdUutsc8AriL1thZZEt-AS6NdbU30B",
        quantity: 2,
        unitPrice: 350000,
        discountVoucherText: "-15% Shop Voucher",
      },
      {
        id: 103,
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
        productId: 10,
        productName: "Túi Tote Canvas vải mộc quai da thật",
        variantName: "Mộc Tự Nhiên • Khóa bấm đồng",
        sku: "SKU-TOT-010",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA9VeCyicOMYH_OrsudraV7bjzFX21LVv3tDHOtQb5kXvl51QcE9ZXPwcsvgPUEzzP5X6CQdmqpl4WXI-fQ3C1yoyHyGS-tyciPOV8dhOIrj3xWRMSZ3jgiI1OfmHRWFAvhoLiWqlx-KOqNaFFcPCHeXF8qwewj5UMMPfKbSOw1WGRofT5EXdmQn5tnzSnUrHnLTYhvQlhKvOxxg6ixfMyXc_yewwRf87ViAg14T4rYFguWoFMr0ZZY",
        quantity: 1,
        unitPrice: 420000,
      },
    ],
  },
  {
    id: 2,
    orderCode: "#ORD-9752",
    userId: 1,
    status: "completed",
    statusLabel: "HOÀN THÀNH",
    subtotal: 1880000,
    shippingFee: 0,
    totalAmount: 1880000,
    paymentMethod: "MOMO",
    paymentStatusText: "Đã thanh toán qua MoMo E-Wallet",
    shippingInfoText: "Giao hàng thành công ngày 20/10/2026",
    courierName: "GHTK Express",
    createdAt: "09:15 - 18/10/2026",
    shops: [
      {
        shopId: 2,
        shopName: "Gốm Bát Tràng Di Sản",
        shopBadge: "ARTISAN",
      },
      {
        shopId: 5,
        shopName: "Mộc Di Sản Đồng Kỵ",
        shopBadge: "ARTISAN",
      },
    ],
    items: [
      {
        id: 201,
        shopId: 2,
        shopName: "Gốm Bát Tràng Di Sản",
        shopBadge: "ARTISAN",
        productId: 3,
        productName: "Bình gốm mộc hoả biến vân rêu cổ trang trí phòng khách",
        variantName: "Kích thước L (Cao 32cm) • Men rêu thạch",
        sku: "SKU-VASE-001",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuByYpTLVSa4bNqICOMNSb8OQDws5YF60QfP9TjzRoHSe7fnhvyc9hwVeZsLaGxeo_slddXyxeJsDWYrhifFo-CQhnsOd52Bga70j2R3nHS5Tl1XGM9KRfsaA9HpufT-zAT7tp1FY6QVGT1oZ3C2OSeYaCs4860bso1MCDJdaMggxc9upe8mkrWEGpDj45Ss_P8bpqDNSjAB2SUMPJGlI1w4OQBbUfNvWWy4vVUaMw9b1x97CpNDSofR",
        quantity: 1,
        unitPrice: 1150000,
      },
      {
        id: 202,
        shopId: 2,
        shopName: "Gốm Bát Tràng Di Sản",
        shopBadge: "ARTISAN",
        productId: 12,
        productName: "Bộ 6 Ly Gốm Nung Tráng Men Tro Mộc",
        variantName: "Combo 6 ly • Dung tích 150ml",
        sku: "SKU-CUP-006",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA_lUHQFUIemftdU5or3cXphetJcZ383ap0u9O9zBjHp373bbT25SwI1fQIJH0fB6bvKYoZDnpDW4Cn9taa20Rf7bNQFsvjiHK8qOzQR8m5Lgd_ygw3adOmT-6Rc4dMSq-UhQq7g2GfRD8xiSzGgPcVy5GS5SP7oWgkmQraW6QsCrCp8vIPEyL1cUW1Ix6abCS_A9tIbLiTpeyieozNz1PxSce2mnogeixselK_Y8KM4klrbeFvPdIk",
        quantity: 1,
        unitPrice: 280000,
      },
      {
        id: 203,
        shopId: 5,
        shopName: "Mộc Di Sản Đồng Kỵ",
        shopBadge: "ARTISAN",
        productId: 15,
        productName: "Khay Trà Gỗ Hương Khắc Chìm Hoa Sen",
        variantName: "Gỗ Hương Đỏ • 35x25cm",
        sku: "SKU-TRAY-015",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCiK1ACxrAqhJiusftQGXjV28yO9xncYI8nmoNuSVCRN-Gzmth_r5wrAv4KrBl3FNt0heMuUEh_PkfyoD4mcPOXcsRzwDkv50guWn5pRUdW9kAWPyX-xH8QUpMog04jCpi3AKzigHRFYGaOYYMXviB5xYglRb7qqtjd6gMvFsxP92i13gQ6obpzW4SEvpYZOE73GP6Hf1UjjOJAEOx9gpv3NfAfFsO7YyddWczovXZS7YtCAQqPDerH",
        quantity: 1,
        unitPrice: 450000,
      },
    ],
  },
  {
    id: 3,
    orderCode: "#ORD-9840",
    userId: 1,
    status: "pending",
    statusLabel: "CHỜ XÁC NHẬN",
    subtotal: 860000,
    shippingFee: 0,
    totalAmount: 860000,
    paymentMethod: "COD",
    paymentStatusText: "COD - Thanh toán tiền mặt khi nhận hàng",
    shippingInfoText: "Người bán đang chuẩn bị đóng gói hàng",
    courierName: "GHTK Express",
    createdAt: "10:05 - 27/10/2026",
    shops: [
      {
        shopId: 3,
        shopName: "Sài Gòn Artisan Leather",
        shopBadge: "ARTISAN",
      },
      {
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
      },
    ],
    items: [
      {
        id: 301,
        shopId: 3,
        shopName: "Sài Gòn Artisan Leather",
        shopBadge: "ARTISAN",
        productId: 4,
        productName: "Ví Đựng Thẻ Da Bò Sáp Mộc Cardholder",
        variantName: "Màu Vàng Bò Tan • 6 ngăn thẻ",
        sku: "SKU-WLT-004",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCMOnI5A2CoWeagc_996Qwh2OW0SyQrBKm4wzn21gX1JiLK1wFjJ06RgYGsUJwlUXnl2XbWTIm7OSNVE1m6JAfEZ3KPa04M4b7SmL5irvs9dtmW1JeIMs_oINoYnXFr1refyVj-63obhJ5sWDvDZjxFF5YDXh5elksBF0DSToxf7dU-M9KnuNae0SISz1_d0J2v_8IY8hDrJNyr8x79BNSgPHREeqkAMhKYXr1YxdWEHDseLi-xcLZF",
        quantity: 1,
        unitPrice: 320000,
      },
      {
        id: 302,
        shopId: 3,
        shopName: "Sài Gòn Artisan Leather",
        shopBadge: "ARTISAN",
        productId: 5,
        productName: "Dây Nịt Da Bò Khóa Đồng Đúc Cổ Điển",
        variantName: "Bản 3.8cm • Màu Nâu Sáp",
        sku: "SKU-BLT-005",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCiK1ACxrAqhJiusftQGXjV28yO9xncYI8nmoNuSVCRN-Gzmth_r5wrAv4KrBl3FNt0heMuUEh_PkfyoD4mcPOXcsRzwDkv50guWn5pRUdW9kAWPyX-xH8QUpMog04jCpi3AKzigHRFYGaOYYMXviB5xYglRb7qqtjd6gMvFsxP92i13gQ6obpzW4SEvpYZOE73GP6Hf1UjjOJAEOx9gpv3NfAfFsO7YyddWczovXZS7YtCAQqPDerH",
        quantity: 1,
        unitPrice: 450000,
      },
      {
        id: 303,
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
        productId: 6,
        productName: "Dây Giày Streetwear Phản Quang 3M",
        variantName: "Màu Neon Cam • Dài 120cm",
        sku: "SKU-LCE-006",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAt9NXGtazFu_8LS8Fd2OiK8Zu1kPbxmnKljCq3vP-TrK6FJNor7g2KKv88y6QPXgpYm1KHlACBjGqfm99ww47WrdY2Pp9KxK_Zic5ix79KZTBZWM1ujyOVd8prAE5e2uMeQCm-m8ofKjgT-Hk2u23XA950INlTrJFrFxV0FQ9VNZU-6UEYqyAbpDt2tWOZ1DaBGOFfyiPzuhbGZmdcFxReeYl5MCP3HEa1XYx-bQM",
        quantity: 2,
        unitPrice: 45000,
      },
    ],
  },
  {
    id: 4,
    orderCode: "#ORD-9610",
    userId: 1,
    status: "cancelled",
    statusLabel: "ĐÃ HỦY",
    subtotal: 800000,
    shippingFee: 0,
    totalAmount: 800000,
    paymentMethod: "COD",
    paymentStatusText: "COD - Đã hủy",
    createdAt: "11:20 - 15/10/2026",
    cancelReason: "Đổi ý không muốn mua nữa",
    cancelledAt: "12:40, 15/10/2026",
    shops: [
      {
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
      },
      {
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
      },
    ],
    items: [
      {
        id: 401,
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
        productId: 10,
        productName: "Túi Tote Canvas vải mộc quai da thật",
        variantName: "Mộc Tự Nhiên • Khóa bấm đồng",
        sku: "SKU-TOT-010",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA9VeCyicOMYH_OrsudraV7bjzFX21LVv3tDHOtQb5kXvl51QcE9ZXPwcsvgPUEzzP5X6CQdmqpl4WXI-fQ3C1yoyHyGS-tyciPOV8dhOIrj3xWRMSZ3jgiI1OfmHRWFAvhoLiWqlx-KOqNaFFcPCHeXF8qwewj5UMMPfKbSOw1WGRofT5EXdmQn5tnzSnUrHnLTYhvQlhKvOxxg6ixfMyXc_yewwRf87ViAg14T4rYFguWoFMr0ZZY",
        quantity: 1,
        unitPrice: 420000,
      },
      {
        id: 402,
        shopId: 1,
        shopName: "UrbanStep Official Store",
        shopBadge: "MALL",
        productId: 8,
        productName: "Áo Thun Heavyweight Vintage Washed Boxy",
        variantName: "Màu Washed Grey • Size L",
        sku: "SKU-TEE-008",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCXGqeWsOSGJB-59Hbs43pb4fqcZNi7PwMfHt7WG66WlZqaJTtspBZAN1eObVrCPaMiEUIDs6tVXX7I63cCoQ1rUNgg2ad-0gCeHvaEGHjeaxvWO0FVxdAu6UqFZFHBzPQWzTETn48GK9ePeqeFmTX6qMUJ7HL4Nl9TXU_9s875AImYx19ZGjeX8b1Vx4uGgC-cUFZ502tD2EJiJUkjhAdjDmP0EEFZpvHO0CIWYKveDRNVvch0GZcA",
        quantity: 1,
        unitPrice: 380000,
      },
    ],
  },
  {
    id: 5,
    orderCode: "#ORD-9580",
    userId: 1,
    status: "packing",
    statusLabel: "CHỜ LẤY HÀNG",
    subtotal: 2360000,
    shippingFee: 0,
    totalAmount: 2360000,
    paymentMethod: "VISA",
    paymentStatusText: "Đã thanh toán qua Thẻ Tín dụng (Visa •••• 4242)",
    shippingInfoText: "Người bán đang chuẩn bị đóng gói hàng • GHTK Express",
    courierName: "GHTK Express",
    createdAt: "16:30 - 24/10/2026",
    shops: [
      {
        shopId: 6,
        shopName: "TechPulse Vietnam",
        shopBadge: "MALL",
      },
      {
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
      },
    ],
    items: [
      {
        id: 501,
        shopId: 6,
        shopName: "TechPulse Vietnam",
        shopBadge: "MALL",
        productId: 20,
        productName: "Tai Nghe Chống Ồn Thiết Kế Tối Giản ANC Wireless",
        variantName: "Màu Matte Slate Grey • Pin 40h",
        sku: "SKU-HDP-020",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDnQyZyuNWZZUPb_k3XM-ruGr3dvkO4wS5NBMkP3ogp_WLnd1ybVsfrraJt68lWuotdKeMu4egh2O7f-l4D2KfJegXS0OqNKhicRwyQ8cquxLg63AJjkFEWJh0cvs3oecyR6zREK4QCuq2e7wgnUZI_ibqEkiieTUZvSGr4gcFtbIHyy5l9UhBN7OPKUXnrSPdCNt0iKHPWH4T6LtocsXMy4sa6dVbi3BVx2IJ5iGgS8zZCM300g0wl",
        quantity: 1,
        unitPrice: 1890000,
      },
      {
        id: 502,
        shopId: 4,
        shopName: "Indochine Studio",
        shopBadge: "ARTISAN",
        productId: 21,
        productName: "Giá Treo Tai Nghe Gỗ Óc Chó Walnut Stand",
        variantName: "Gỗ Tự Nhiên Bắc Mỹ",
        sku: "SKU-WOD-021",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDEgHtCqlhutCLIQeAPrUQ6z8T4LNYDhol_IwHnzx6VC4SbLlCcHCyKqLxuAbMlXEE77KGZNel8F9aP3JOlxy6tHFZqo_mZrzew2bVZXC6rzMPwS17MLVfEM1mH5lxT9rfH_llb3BxdFFfASPWLmWSj38wI35RXkm2lawjFjpUTCepwPoS3myFo_ikMbGhwfk5xyY-g8xodJdXrwJDtIfm0TbhtqIMjAJsf9S49z2LYmMc9DJig6Ezw",
        quantity: 1,
        unitPrice: 320000,
      },
      {
        id: 503,
        shopId: 6,
        shopName: "TechPulse Vietnam",
        shopBadge: "MALL",
        productId: 22,
        productName: "Cáp Sạc Nhanh Bọc Dù Type-C to Type-C 100W",
        variantName: "Dài 1.5m • Màu Xám Đen",
        sku: "SKU-CBL-022",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCh7c9Wmqd9Mqq0BWHRpqJm9nMvOg70gi72thfKkzxkU_WkEx7G1rjNCSrFK2LhFUF33Zv2uXj51ECEmiHWgJ5i81EBwdtBWQUNyBQNj-NTWoyG49OmeTzZrZnEtRxWrMqW86pdvD5CD0n5lr4DmswW5lAK9koTBo09YVvVV02RxKBl3MWL8rpI4qqgoc-TNsVOAEZm1edBLKzVZZF5cJfoMuzCMska0UdSI8VQS08mTvvbWGbqOFgT",
        quantity: 1,
        unitPrice: 150000,
      },
    ],
  },
  {
    id: 6,
    orderCode: "#ORD-9502",
    userId: 1,
    status: "shipping",
    statusLabel: "ĐANG VẬN CHUYỂN",
    subtotal: 1115000,
    shippingFee: 0,
    totalAmount: 1115000,
    paymentMethod: "COD",
    paymentStatusText: "COD - Nhận hàng trả tiền (Chưa thanh toán)",
    shippingInfoText: "Đang vận chuyển • Viettel Post - Dự kiến giao 29/10/2026",
    courierName: "Viettel Post",
    createdAt: "08:10 - 26/10/2026",
    shops: [
      {
        shopId: 7,
        shopName: "SilverCraft Hà Nội",
        shopBadge: "ARTISAN",
      },
      {
        shopId: 5,
        shopName: "Mộc Di Sản Đồng Kỵ",
        shopBadge: "ARTISAN",
      },
    ],
    items: [
      {
        id: 601,
        shopId: 7,
        shopName: "SilverCraft Hà Nội",
        shopBadge: "ARTISAN",
        productId: 25,
        productName: "Nhẫn Bạc 925 Hoa Văn La Bàn Khắc Tay",
        variantName: "Bạc S925 • Size 18",
        sku: "SKU-RNG-025",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrCOmzIYBDKjjhCBpOIg2ppWNzdmO_Kxm-AcWniec5TKz9zawLSjlIhqBmCMZao2O0FdxA1yFqgYs3hvL1g3fXAciA5qfJFdDwSnWKgzxoqD-SgzMwNN7AqDkY6zFXPa5WAlPtZDC94EgScnW8XxPGlvP2jwVHUgKtuJBqZgmcIdQg_WpPoy4Xpj4ZKXOl8SxD-7aar7h4c5p9LumBpT7PmOEvEBdb7Lj2ftRjIM58egp9DBMWKCV",
        quantity: 1,
        unitPrice: 890000,
      },
      {
        id: 602,
        shopId: 7,
        shopName: "SilverCraft Hà Nội",
        shopBadge: "ARTISAN",
        productId: 26,
        productName: "Khăn Lau Sáng Bạc Chuyên Dụng Cao Cấp",
        variantName: "Set 3 Khăn • Cotton 100%",
        sku: "SKU-CLT-026",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAv8pR4zCIsUyVYGZt2-fJC6qdClbMdRcNjkTw1jvWiVmsKcXi_oDwvRKxRF21YqQ6ssyJDdqoFNtn6maP79Uc6_zRQyrfve8tazbChfGQNso8gVMbo-HKfGtKWfflBxY90hfqpj1G_AH4o_CinZmwAi9Yia8zuw--RFP7vYEy9GrwpxsBF7u5J0bGgwcv7xxx0l52C2Mn95HOzbN_bdipc3mCucqOHmwmdV-B2GCexz78SXketW-kf",
        quantity: 1,
        unitPrice: 45000,
      },
      {
        id: 603,
        shopId: 5,
        shopName: "Mộc Di Sản Đồng Kỵ",
        shopBadge: "ARTISAN",
        productId: 27,
        productName: "Hộp Quà Gỗ Sơn Mài Đựng Trang Sức",
        variantName: "Gỗ Hương • Lót Nhung Đỏ",
        sku: "SKU-BOX-027",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCiK1ACxrAqhJiusftQGXjV28yO9xncYI8nmoNuSVCRN-Gzmth_r5wrAv4KrBl3FNt0heMuUEh_PkfyoD4mcPOXcsRzwDkv50guWn5pRUdW9kAWPyX-xH8QUpMog04jCpi3AKzigHRFYGaOYYMXviB5xYglRb7qqtjd6gMvFsxP92i13gQ6obpzW4SEvpYZOE73GP6Hf1UjjOJAEOx9gpv3NfAfFsO7YyddWczovXZS7YtCAQqPDerH",
        quantity: 1,
        unitPrice: 180000,
      },
    ],
  },
  {
    id: 7,
    orderCode: "#ORD-9411",
    userId: 1,
    status: "returned",
    statusLabel: "TRẢ HÀNG / HOÀN TIỀN",
    subtotal: 650000,
    shippingFee: 0,
    totalAmount: 650000,
    paymentMethod: "MOMO",
    paymentStatusText: "Đã hoàn tiền qua Ví MoMo lúc 14:00, 12/10/2026",
    shippingInfoText: "Đã hoàn tất trả hàng và kiểm định chất lượng tại kho sàn",
    createdAt: "14:15 - 08/10/2026",
    cancelReason: "Không vừa kích cỡ chân, sản phẩm còn nguyên tem mác",
    cancelledAt: "12/10/2026",
    shops: [
      {
        shopId: 3,
        shopName: "Sài Gòn Artisan Leather",
        shopBadge: "ARTISAN",
      },
    ],
    items: [
      {
        id: 701,
        shopId: 3,
        shopName: "Sài Gòn Artisan Leather",
        shopBadge: "ARTISAN",
        productId: 30,
        productName: "Giày Lười Loafer Da Bò Dập Vân Cá Sấu",
        variantName: "Size 41 • Màu Đen Bóng",
        sku: "SKU-LFR-030",
        imageUrl:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCK4UarBaVhWmPtmjQNS1A4cjK61SFDsLw8jf7QOH1K1oTQ5V3Tnv6efkTB8q6E130NVUfw4tAPT8sDen7ndaZg271GgyGR6-SPnjrnXy1amf2Y5rhzXU5ZZzRg1Y5hewc-PymTEYnByi-nZIsi-iomAcDK8bpsHIeXHR6TC6WhR9OD7K7T3Gn33WHdkIwcH4W99D4P_2ubXt6KirDq2axOwC8PebCgc9IQCoHry0sKfMkWSkfJpyyk",
        quantity: 1,
        unitPrice: 650000,
      },
    ],
  },
];

export const userOrderApi = {
  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại (lọc theo tab, tìm kiếm, phân trang)
   */
  fetchUserOrders: async (
    params?: UserOrderFilterParams
  ): Promise<{ orders: UserOrder[]; total: number }> => {
    try {
      const response = await axiosClient.get<ApiResponse<{ orders: UserOrder[]; total: number }>>(
        "/api/v1/user/orders",
        { params }
      );
      if (response.data?.success && response.data?.data?.orders) {
        return response.data.data;
      }
    } catch {
      // Fallback về mock data
    }

    let filtered = [...mockUserOrders];

    // Lọc theo tab
    if (params?.tab && params.tab !== "all") {
      filtered = filtered.filter((order) => order.status === params.tab);
    }

    // Lọc theo tìm kiếm (mã đơn, tên sản phẩm, tên shop)
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderCode.toLowerCase().includes(q) ||
          order.items.some((item) => item.productName.toLowerCase().includes(q)) ||
          order.shops.some((shop) => shop.shopName.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 6;
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return {
      orders: paginated,
      total,
    };
  },

  /**
   * Lấy số lượng đơn hàng theo từng trạng thái (để hiển thị badge đếm trên tab)
   */
  fetchUserOrderStatusCounts: async (): Promise<UserOrderStatusCounts> => {
    try {
      const response = await axiosClient.get<ApiResponse<UserOrderStatusCounts>>(
        "/api/v1/user/orders/counts"
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback về mock data
    }

    const counts: UserOrderStatusCounts = {
      all: mockUserOrders.length,
      pending: mockUserOrders.filter((o) => o.status === "pending").length,
      packing: mockUserOrders.filter((o) => o.status === "packing").length,
      shipping: mockUserOrders.filter((o) => o.status === "shipping").length,
      completed: mockUserOrders.filter((o) => o.status === "completed").length,
      cancelled: mockUserOrders.filter((o) => o.status === "cancelled").length,
      returned: mockUserOrders.filter((o) => o.status === "returned").length,
    };

    return counts;
  },

  /**
   * Người mua yêu cầu hủy đơn hàng (khi đơn còn ở trạng thái Chờ xác nhận)
   */
  cancelUserOrder: async (
    orderId: number,
    cancelReason: string
  ): Promise<UserOrder> => {
    try {
      const response = await axiosClient.post<ApiResponse<UserOrder>>(
        `/api/v1/user/orders/${orderId}/cancel`,
        { cancelReason }
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback update mock data
    }

    const order = mockUserOrders.find((o) => o.id === orderId);
    if (order) {
      order.status = "cancelled";
      order.statusLabel = "ĐÃ HỦY";
      order.cancelReason = cancelReason;
      order.cancelledAt = new Date().toLocaleString("vi-VN");
      return { ...order };
    }
    throw new Error("Không tìm thấy đơn hàng để hủy");
  },

  /**
   * Xác nhận đã nhận được hàng (khi đơn đang vận chuyển)
   */
  confirmOrderReceived: async (orderId: number): Promise<UserOrder> => {
    try {
      const response = await axiosClient.post<ApiResponse<UserOrder>>(
        `/api/v1/user/orders/${orderId}/confirm-received`
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback update mock data
    }

    const order = mockUserOrders.find((o) => o.id === orderId);
    if (order) {
      order.status = "completed";
      order.statusLabel = "HOÀN THÀNH";
      order.shippingInfoText = "Giao hàng thành công (Đã xác nhận nhận hàng)";
      return { ...order };
    }
    throw new Error("Không tìm thấy đơn hàng");
  },

  /**
   * Lấy chi tiết đơn hàng theo ID hoặc Mã đơn (hỗ trợ cả multi-shop order)
   */
  fetchUserOrderDetail: async (
    orderIdOrCode: string | number
  ): Promise<UserOrder> => {
    try {
      const response = await axiosClient.get<ApiResponse<UserOrder>>(
        `/api/v1/user/orders/${orderIdOrCode}`
      );
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback update mock data
    }

    const cleanCode = String(orderIdOrCode).replace(/^#/, "").toLowerCase().trim();
    const order = mockUserOrders.find(
      (o) =>
        String(o.id) === String(orderIdOrCode).trim() ||
        o.orderCode.toLowerCase().replace(/^#/, "").trim() === cleanCode ||
        o.orderCode.toLowerCase().includes(cleanCode)
    );

    if (order) {
      // Ensure recipient exists
      const defaultRecipient = {
        name: "Nguyễn Văn A",
        phone: "(+84) 909 123 456",
        address: "Số 142/8 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh",
        addressType: "Nhà riêng",
        tag: "Nhà riêng",
        note: "Giao giờ hành chính, gọi trước 15 phút. Cho kiểm tra hàng (Đồng kiểm COD).",
        notes: "Giao giờ hành chính, gọi trước 15 phút. Cho kiểm tra hàng (Đồng kiểm COD).",
      };

      // Contextual timeline depending on status
      const defaultTimeline =
        order.status === "completed"
          ? [
              {
                id: "log-1",
                time: "20/10 16:30",
                title: "Giao hàng thành công. Người nhận đã ký nhận kiện hàng.",
                subtitle: "Bưu tá: Lê Văn Cường - GHTK Express",
                isLatest: true,
              },
              {
                id: "log-2",
                time: "20/10 08:30",
                title: "Bưu tá đang trên đường đi giao kiện hàng đến bạn.",
              },
              {
                id: "log-3",
                time: "19/10 20:15",
                title: "Kiện hàng đã đến bưu cục phát Quận Bình Thạnh.",
              },
              {
                id: "log-4",
                time: "18/10 14:20",
                title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
              },
            ]
          : order.status === "cancelled"
          ? [
              {
                id: "log-1",
                time: order.cancelledAt || "15/10 12:40",
                title: `Đơn hàng đã được hủy. Lý do: ${order.cancelReason || "Đổi ý không muốn mua nữa"}.`,
                isLatest: true,
              },
              {
                id: "log-2",
                time: "15/10 11:20",
                title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
              },
            ]
          : order.status === "pending"
          ? [
              {
                id: "log-1",
                time: order.createdAt || "27/10 10:05",
                title: "Đơn hàng đang chờ người bán xác nhận và đóng gói.",
                isLatest: true,
              },
              {
                id: "log-2",
                time: order.createdAt || "27/10 10:05",
                title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
              },
            ]
          : order.status === "packing"
          ? [
              {
                id: "log-1",
                time: "24/10 17:00",
                title: "Người bán đã đóng gói xong, đang chờ shipper đến lấy hàng.",
                isLatest: true,
              },
              {
                id: "log-2",
                time: order.createdAt || "24/10 16:30",
                title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
              },
            ]
          : [
              {
                id: "log-1",
                time: "27/10 08:15",
                title: "Bưu kiện đã rời kho trung chuyển Tân Bình và đang được điều phối về bưu cục phát Quận Bình Thạnh.",
                subtitle: "Bưu tá phụ trách: Trần Minh Quân - Dự kiến giao hôm nay",
                isLatest: true,
              },
              {
                id: "log-2",
                time: "26/10 21:40",
                title: "Đã nhập kho phân loại tổng Sài Gòn Hub (Khu công nghiệp Tân Bình).",
              },
              {
                id: "log-3",
                time: "26/10 18:30",
                title: "Shipper đã lấy hàng thành công từ các Shop trong đơn hàng.",
              },
              {
                id: "log-4",
                time: "26/10 14:20",
                title: "Đơn hàng được tạo thành công trên hệ thống MarketPulse.",
              },
            ];

      return {
        ...order,
        recipient: order.recipient || defaultRecipient,
        timeline: order.timeline || defaultTimeline,
        trackingCode: order.trackingCode || "GHN88391204VN",
        courierName: order.courierName || "Giao Hàng Nhanh (GHN Express)",
        estimatedDeliveryDate: order.estimatedDeliveryDate || "28/10/2026",
      };
    }

    // Default to the first order if none matched
    return mockUserOrders[0];
  },
};
