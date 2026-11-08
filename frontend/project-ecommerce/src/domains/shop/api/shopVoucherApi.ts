import type {
  ShopVoucherItem,
  ShopVoucherStats,
  CreateShopVoucherPayload,
} from "@/domains/shop/types/shopVoucher.types";

export let mockShopVouchersStore: ShopVoucherItem[] = [
  {
    id: "voucher-1",
    code: "SHOP30K",
    title: "Giảm trực tiếp 30.000 ₫",
    type: "money",
    amountText: "GIẢM 30.000 ₫",
    minOrderAmount: 300000,
    minOrderText: "Đơn tối thiểu 300.000 ₫",
    discountValue: 30000,
    startDate: "2026-10-01",
    expiryDate: "2026-12-31",
    expiryText: "HSD: 31/12/2026",
    claimedByDefault: false,
    description: "Áp dụng cho tất cả sản phẩm của gian hàng khi đạt giá trị đơn tối thiểu 300.000 ₫.",
    badge: "Phổ biến",
    usagePercent: 68,
    usageCount: 68,
    maxUsageCount: 100,
    status: "ongoing",
  },
  {
    id: "voucher-2",
    code: "SHOP10PCT",
    title: "Giảm 10% tối đa 50.000 ₫",
    type: "percent",
    amountText: "GIẢM 10% Tối đa 50k",
    minOrderAmount: 500000,
    minOrderText: "Đơn tối thiểu 500.000 ₫",
    discountValue: 10,
    maxDiscountAmount: 50000,
    startDate: "2026-10-15",
    expiryDate: "2026-12-31",
    expiryText: "HSD: 31/12/2026",
    claimedByDefault: false,
    description: "Giảm 10% tổng giá trị đơn hàng, giảm tối đa 50.000 ₫ cho đơn từ 500.000 ₫.",
    badge: "Bán chạy",
    usagePercent: 82,
    usageCount: 164,
    maxUsageCount: 200,
    status: "ongoing",
  },
  {
    id: "voucher-3",
    code: "FREESHIP25",
    title: "Hỗ trợ phí vận chuyển 25.000 ₫",
    type: "shipping",
    amountText: "FREESHIP EXTRA 25k",
    minOrderAmount: 200000,
    minOrderText: "Đơn tối thiểu 200.000 ₫",
    discountValue: 25000,
    startDate: "2026-11-01",
    expiryDate: "2027-01-15",
    expiryText: "HSD: 15/01/2027",
    claimedByDefault: true,
    description: "Giảm tối đa 25.000 ₫ phí ship cho các đơn giao toàn quốc.",
    badge: "Freeship",
    usagePercent: 91,
    usageCount: 273,
    maxUsageCount: 300,
    status: "ongoing",
  },
  {
    id: "voucher-4",
    code: "SHOPVIP100",
    title: "Ưu đãi khách hàng VIP giảm 100.000 ₫",
    type: "money",
    amountText: "GIẢM 100.000 ₫",
    minOrderAmount: 1200000,
    minOrderText: "Đơn tối thiểu 1.200.000 ₫",
    discountValue: 100000,
    startDate: "2026-11-01",
    expiryDate: "2027-02-28",
    expiryText: "HSD: 28/02/2027",
    claimedByDefault: false,
    description: "Ưu đãi đặc quyền dành cho đơn hàng giá trị cao từ 1.200.000 ₫ trở lên.",
    badge: "Độc quyền",
    usagePercent: 45,
    usageCount: 45,
    maxUsageCount: 100,
    status: "ongoing",
  },
  {
    id: "voucher-5",
    code: "BLACKFRIDAY",
    title: "Đại tiệc Black Friday giảm 20%",
    type: "percent",
    amountText: "GIẢM 20% Tối đa 150k",
    minOrderAmount: 800000,
    minOrderText: "Đơn tối thiểu 800.000 ₫",
    discountValue: 20,
    maxDiscountAmount: 150000,
    startDate: "2026-11-25",
    expiryDate: "2026-11-30",
    expiryText: "HSD: 30/11/2026",
    claimedByDefault: false,
    description: "Khuyến mãi mùa lễ hội Black Friday 2026.",
    badge: "Sự kiện",
    usagePercent: 0,
    usageCount: 0,
    maxUsageCount: 500,
    status: "upcoming",
  },
  {
    id: "voucher-6",
    code: "OCTOBER50",
    title: "Chào thu tháng 10 giảm 50.000 ₫",
    type: "money",
    amountText: "GIẢM 50.000 ₫",
    minOrderAmount: 400000,
    minOrderText: "Đơn tối thiểu 400.000 ₫",
    discountValue: 50000,
    startDate: "2026-10-01",
    expiryDate: "2026-10-31",
    expiryText: "HSD: 31/10/2026",
    claimedByDefault: false,
    description: "Chương trình chào thu đã kết thúc.",
    badge: "Đã hết hạn",
    usagePercent: 100,
    usageCount: 150,
    maxUsageCount: 150,
    status: "expired",
  },
];

export const getMockShopVouchers = (_shopId?: number, shopName?: string): ShopVoucherItem[] => {
  const prefix = shopName
    ? shopName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4) || "SHOP"
    : "SHOP";

  return mockShopVouchersStore.map((v) => ({
    ...v,
    code: v.code.startsWith("SHOP") ? v.code.replace("SHOP", prefix) : v.code,
  }));
};

export const shopVoucherApi = {
  async getShopVouchers(shopId?: number, shopName?: string): Promise<ShopVoucherItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockShopVouchers(shopId, shopName);
  },

  async getShopVoucherStats(): Promise<ShopVoucherStats> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const activeVouchers = mockShopVouchersStore.filter((v) => v.status === "ongoing");
    const totalUsage = mockShopVouchersStore.reduce((sum, v) => sum + (v.usageCount || 0), 0);
    const discountSpent = mockShopVouchersStore.reduce(
      (sum, v) => sum + (v.usageCount || 0) * (v.type === "money" ? v.discountValue : 35000),
      0
    );
    const voucherRevenue = totalUsage * 580000;

    return {
      activeCount: activeVouchers.length,
      totalUsage,
      voucherRevenue,
      discountSpent,
    };
  },

  async createShopVoucher(payload: CreateShopVoucherPayload): Promise<ShopVoucherItem> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const isPercent = payload.type === "percent";
    const isShipping = payload.type === "shipping";

    const amountText = isShipping
      ? `FREESHIP ${Math.round(payload.discountValue / 1000)}k`
      : isPercent
      ? `GIẢM ${payload.discountValue}% ${
          payload.maxDiscountAmount ? `Tối đa ${Math.round(payload.maxDiscountAmount / 1000)}k` : ""
        }`
      : `GIẢM ${payload.discountValue.toLocaleString("vi-VN")} ₫`;

    const newVoucher: ShopVoucherItem = {
      id: `voucher-${Date.now()}`,
      code: payload.code.toUpperCase().trim(),
      title: payload.title.trim(),
      type: payload.type,
      amountText,
      minOrderAmount: payload.minOrderAmount,
      minOrderText: `Đơn tối thiểu ${payload.minOrderAmount.toLocaleString("vi-VN")} ₫`,
      discountValue: payload.discountValue,
      maxDiscountAmount: payload.maxDiscountAmount,
      startDate: payload.startDate,
      expiryDate: payload.expiryDate,
      expiryText: `HSD: ${payload.expiryDate.split("-").reverse().join("/")}`,
      claimedByDefault: false,
      description: payload.description,
      badge: payload.badge || "Mới tạo",
      usagePercent: 0,
      usageCount: 0,
      maxUsageCount: payload.maxUsageCount || 100,
      status: "ongoing",
    };

    mockShopVouchersStore = [newVoucher, ...mockShopVouchersStore];
    return newVoucher;
  },

  async updateShopVoucher(
    id: string,
    payload: Partial<ShopVoucherItem>
  ): Promise<ShopVoucherItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const idx = mockShopVouchersStore.findIndex((v) => v.id === id);
    if (idx !== -1) {
      const updated = { ...mockShopVouchersStore[idx], ...payload };
      mockShopVouchersStore[idx] = updated;
      return updated;
    }
    throw new Error("Không tìm thấy voucher");
  },

  async deleteShopVoucher(id: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    mockShopVouchersStore = mockShopVouchersStore.filter((v) => v.id !== id);
    return id;
  },

  async toggleShopVoucherStatus(id: string): Promise<ShopVoucherItem> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = mockShopVouchersStore.findIndex((v) => v.id === id);
    if (idx !== -1) {
      const current = mockShopVouchersStore[idx];
      const nextStatus = current.status === "ongoing" ? "paused" : "ongoing";
      const updated: ShopVoucherItem = { ...current, status: nextStatus };
      mockShopVouchersStore[idx] = updated;
      return updated;
    }
    throw new Error("Không tìm thấy voucher");
  },

  async claimShopVoucher(voucherId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: `Đã lưu mã giảm giá #${voucherId} thành công vào ví ưu đãi!`,
    };
  },
};
