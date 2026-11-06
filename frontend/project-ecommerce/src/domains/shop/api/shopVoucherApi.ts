import type { ShopVoucherItem } from "@/domains/shop/types/shopVoucher.types";

/**
 * Tạo dữ liệu mock mã giảm giá dựa trên thông tin gian hàng
 */
export const getMockShopVouchers = (_shopId?: number, shopName?: string): ShopVoucherItem[] => {
  const prefix = shopName
    ? shopName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4) || "SHOP"
    : "SHOP";

  return [
    {
      id: "voucher-1",
      code: `${prefix}30K`,
      title: "Giảm trực tiếp 30.000 ₫",
      type: "money",
      amountText: "GIẢM 30.000 ₫",
      minOrderAmount: 300000,
      minOrderText: "Đơn tối thiểu 300.000 ₫",
      discountValue: 30000,
      expiryText: "HSD: 31/12/2026",
      expiryDate: "2026-12-31",
      claimedByDefault: false,
      description: "Áp dụng cho tất cả sản phẩm của gian hàng khi đạt giá trị đơn tối thiểu 300.000 ₫.",
      badge: "Phổ biến",
      usagePercent: 68,
    },
    {
      id: "voucher-2",
      code: `${prefix}10PCT`,
      title: "Giảm 10% tối đa 50.000 ₫",
      type: "percent",
      amountText: "GIẢM 10% Tối đa 50k",
      minOrderAmount: 500000,
      minOrderText: "Đơn tối thiểu 500.000 ₫",
      discountValue: 10,
      maxDiscountAmount: 50000,
      expiryText: "HSD: 31/12/2026",
      expiryDate: "2026-12-31",
      claimedByDefault: false,
      description: "Giảm 10% tổng giá trị đơn hàng, giảm tối đa 50.000 ₫ cho đơn từ 500.000 ₫.",
      badge: "Bán chạy",
      usagePercent: 82,
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
      expiryText: "HSD: 15/01/2027",
      expiryDate: "2027-01-15",
      claimedByDefault: true,
      description: "Giảm tối đa 25.000 ₫ phí ship cho các đơn giao toàn quốc.",
      badge: "Freeship",
      usagePercent: 91,
    },
    {
      id: "voucher-4",
      code: `${prefix}VIP100`,
      title: "Ưu đãi khách hàng VIP giảm 100.000 ₫",
      type: "money",
      amountText: "GIẢM 100.000 ₫",
      minOrderAmount: 1200000,
      minOrderText: "Đơn tối thiểu 1.200.000 ₫",
      discountValue: 100000,
      expiryText: "HSD: 28/02/2027",
      expiryDate: "2027-02-28",
      claimedByDefault: false,
      description: "Ưu đãi đặc quyền dành cho đơn hàng giá trị cao từ 1.200.000 ₫ trở lên.",
      badge: "Độc quyền",
      usagePercent: 45,
    },
    {
      id: "voucher-5",
      code: `${prefix}FOLLOW20`,
      title: "Mã giảm giá cho Người theo dõi gian hàng",
      type: "percent",
      amountText: "GIẢM 15% Tối đa 40k",
      minOrderAmount: 250000,
      minOrderText: "Đơn tối thiểu 250.000 ₫",
      discountValue: 15,
      maxDiscountAmount: 40000,
      expiryText: "HSD: 30/06/2027",
      expiryDate: "2027-06-30",
      claimedByDefault: false,
      description: "Dành riêng cho khách hàng nhấn 'Theo dõi' gian hàng trên MarketPulse.",
      badge: "Người theo dõi",
      usagePercent: 30,
    },
    {
      id: "voucher-6",
      code: "FREESHIP50",
      title: "Miễn phí vận chuyển hỏa tốc toàn quốc",
      type: "shipping",
      amountText: "FREESHIP HỎA TỐC 50k",
      minOrderAmount: 600000,
      minOrderText: "Đơn tối thiểu 600.000 ₫",
      discountValue: 50000,
      expiryText: "HSD: 31/03/2027",
      expiryDate: "2027-03-31",
      claimedByDefault: false,
      description: "Hỗ trợ tới 50.000 ₫ phí vận chuyển nhanh cho các đơn hàng từ 600.000 ₫.",
      badge: "Freeship Extra",
      usagePercent: 54,
    },
  ];
};

export const shopVoucherApi = {
  /**
   * Mock API: Lấy tất cả mã giảm giá của gian hàng
   */
  async getShopVouchers(shopId?: number, shopName?: string): Promise<ShopVoucherItem[]> {
    // Giả lập network delay ngắn cho trải nghiệm mượt mà
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockShopVouchers(shopId, shopName);
  },

  /**
   * Mock API: Lưu mã giảm giá vào ví voucher của tài khoản
   */
  async claimShopVoucher(voucherId: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      success: true,
      message: `Đã lưu mã giảm giá #${voucherId} thành công vào ví ưu đãi!`,
    };
  },
};

