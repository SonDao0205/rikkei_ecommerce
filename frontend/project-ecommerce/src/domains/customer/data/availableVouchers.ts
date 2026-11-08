export interface AvailableVoucher {
  id: number;
  code: string;
  scope: "PLATFORM" | "SHOP";
  shopId?: number;
  shopName?: string;
  title: string;
  description: string;
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  endAt: string;
  badge?: string;
  highlightText: string;
}

/**
 * Danh sách các Voucher toàn sàn (Platform Vouchers) có sẵn
 * Mã SEED-WELCOME khớp với dữ liệu seed trong backend
 */
export const AVAILABLE_PLATFORM_VOUCHERS: AvailableVoucher[] = [
  {
    id: 981001,
    code: "SEED-WELCOME",
    scope: "PLATFORM",
    title: "Chào mừng thành viên mới",
    description: "Giảm trực tiếp 50.000₫ cho đơn hàng từ 300.000₫ toàn sàn",
    discountType: "FIXED",
    discountValue: 50000,
    minOrderValue: 300000,
    endAt: "31/12/2026",
    badge: "Phổ biến",
    highlightText: "GIẢM 50K",
  },
  {
    id: 981003,
    code: "RETRO50",
    scope: "PLATFORM",
    title: "Ưu đãi Đơn Hàng Lớn",
    description: "Giảm ngay 50.000₫ cho đơn hàng đạt từ 500.000₫",
    discountType: "FIXED",
    discountValue: 50000,
    minOrderValue: 500000,
    endAt: "31/12/2026",
    badge: "Hot",
    highlightText: "GIẢM 50K",
  },
  {
    id: 981004,
    code: "MPFREESHIP",
    scope: "PLATFORM",
    title: "Hỗ trợ phí vận chuyển",
    description: "Miễn phí vận chuyển 30.000₫ cho đơn hàng từ 150.000₫",
    discountType: "FIXED",
    discountValue: 30000,
    minOrderValue: 150000,
    endAt: "31/12/2026",
    badge: "Freeship",
    highlightText: "FREESHIP 30K",
  },
  {
    id: 981005,
    code: "MP100",
    scope: "PLATFORM",
    title: "Đại tiệc Mua Sắm Siêu Sale",
    description: "Giảm 100.000₫ cho đơn hàng giá trị từ 1.000.000₫",
    discountType: "FIXED",
    discountValue: 100000,
    minOrderValue: 1000000,
    endAt: "31/12/2026",
    badge: "Độc quyền",
    highlightText: "GIẢM 100K",
  },
];

/**
 * Danh sách các Voucher Gian hàng (Shop Vouchers) có sẵn
 * Mã SEED-MAY10 khớp với shop 920001 (An Nhiên Living) trong backend seed
 */
export const AVAILABLE_SHOP_VOUCHERS: AvailableVoucher[] = [
  {
    id: 981002,
    code: "SEED-MAY10",
    scope: "SHOP",
    shopId: 920001,
    shopName: "An Nhiên Living",
    title: "Ưu đãi thành viên An Nhiên Living",
    description: "Giảm 10% tối đa 40.000₫ cho đơn từ 200.000₫ của shop",
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscountAmount: 40000,
    minOrderValue: 200000,
    endAt: "31/12/2026",
    badge: "Bán chạy",
    highlightText: "GIẢM 10%",
  },
  {
    id: 982001,
    code: "SHOP30K",
    scope: "SHOP",
    title: "Tri ân khách hàng thân thiết",
    description: "Giảm trực tiếp 30.000₫ cho đơn mua tại shop từ 300.000₫",
    discountType: "FIXED",
    discountValue: 30000,
    minOrderValue: 300000,
    endAt: "31/12/2026",
    badge: "Phổ biến",
    highlightText: "GIẢM 30K",
  },
  {
    id: 982002,
    code: "SHOP10PCT",
    scope: "SHOP",
    title: "Giảm giá theo % đơn hàng",
    description: "Giảm 10% tổng giá trị đơn hàng, giảm tối đa 50.000₫ từ 500.000₫",
    discountType: "PERCENT",
    discountValue: 10,
    maxDiscountAmount: 50000,
    minOrderValue: 500000,
    endAt: "31/12/2026",
    badge: "Tiết kiệm",
    highlightText: "GIẢM 10%",
  },
  {
    id: 982003,
    code: "FREESHIP25",
    scope: "SHOP",
    title: "Shop tài trợ phí ship",
    description: "Hỗ trợ 25.000₫ phí giao hàng cho đơn từ 200.000₫ của shop",
    discountType: "FIXED",
    discountValue: 25000,
    minOrderValue: 200000,
    endAt: "31/12/2026",
    badge: "Freeship",
    highlightText: "FREESHIP 25K",
  },
  {
    id: 982004,
    code: "SHOPVIP100",
    scope: "SHOP",
    title: "Đặc quyền mua sắm VIP",
    description: "Giảm ngay 100.000₫ cho đơn mua số lượng lớn từ 1.200.000₫",
    discountType: "FIXED",
    discountValue: 100000,
    minOrderValue: 1200000,
    endAt: "31/12/2026",
    badge: "Độc quyền",
    highlightText: "GIẢM 100K",
  },
];

/**
 * Lấy danh sách voucher shop phù hợp cho một shop ID cụ thể
 */
export function getAvailableShopVouchers(shopId?: number): AvailableVoucher[] {
  if (!shopId) return AVAILABLE_SHOP_VOUCHERS;
  const specific = AVAILABLE_SHOP_VOUCHERS.filter(
    (v) => v.shopId === shopId || v.shopId === undefined
  );
  return specific.length > 0 ? specific : AVAILABLE_SHOP_VOUCHERS;
}

