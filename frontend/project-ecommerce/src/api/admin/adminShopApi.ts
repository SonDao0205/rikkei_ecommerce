import axiosClient, { shouldFallbackToMock } from "../axiosClient";
import type {
  AdminShopItem,
  ShopMetricStats,
  ShopFilterParams,
  ShopTier,
} from "../../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const mockShopsState: AdminShopItem[] = [
  {
    id: 1,
    code: "#VN-8821",
    name: "The Craft Lab Saigon",
    logo_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB70IwPlGERDgiKV0g0luMTGcIUCiHPpRAyEKRrQscIxAFKpvhIgroKmKYe3GeUUHwuHwp9c-dKgO8m-V0nNbTDecfNKh1fkhO5rVT4BmMPnYuTckGnmXlOV46rv1Y0AgLTBIdPZPlpz12v6qbmuHxj9-LprBJkg4xyzeycYuBjTrpLA-2aKnodtldhlL6GbQqhZGd7KnMp5acEMdcOjUSO1VK3PRrtVP3hHP8nvdE",
    tier: "STANDARD",
    category: "Artisan Craft",
    category_icon: "palette",
    owner_name: "Lê Hoàng Nam",
    owner_phone: "+84 908 123 456",
    owner_email: "contact@craftlab.vn",
    location: "Quận 3, TP. Hồ Chí Minh",
    sku_count: 12,
    sku_label: "12 Draft SKUs",
    order_count: 0,
    order_label: "0 orders (New Registration)",
    rating_avg: 0,
    rating_count: 0,
    commission_rate: 8,
    commission_tier_label: "8% Tier",
    available_balance: 0,
    settlement_cycle: "Bi-weekly",
    status: "PENDING",
    status_label: "Pending Approval",
    is_live: false,
    tax_id: "0314892102",
    identity_card: "079094002819",
    business_license_url: "Giấy phép ĐKKD: 41C8019283 - TP.HCM",
    created_at: "26/10/2024",
  },
  {
    id: 2,
    code: "#VN-4019",
    name: "UrbanStep Official Store",
    logo_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-MWWVQJVhhjk8IAaCHRThmBhDJIxeD9WbV2OfAubxAOc0VoTKCRbSXCAf5udrXSDmUPiRaHZUec-u5EehSbiQm3QUG-vV9GCScGg4crIL2nn32whhrX20MmNs2tMiuJmwBSZ78pxAfKZW9kyS8_tnXSWKjz9SssC7g6dENa5uRswiJMS91q7iH5bq8EgX0Sjs-U2HzoWS1JeYLuac67QDwlwAmwhWUtfAfkGyTE4",
    tier: "MALL",
    category: "Footwear",
    category_icon: "sports_handball",
    owner_name: "Trần Văn Cường",
    owner_phone: "+84 918 888 999",
    owner_email: "cuong.tran@urbanstep.vn",
    location: "District 1, HCMC",
    sku_count: 86,
    sku_label: "86 SKUs",
    order_count: 1420,
    order_label: "1,420 orders (Lifetime)",
    rating_avg: 4.9,
    rating_count: 830,
    commission_rate: 12,
    commission_tier_label: "12% Mall Tier",
    available_balance: 48200000,
    settlement_cycle: "Pending Next Payout",
    status: "ACTIVE",
    status_label: "Active / Verified",
    is_live: true,
    tax_id: "0309982145",
    identity_card: "079088001192",
    business_license_url: "Giấy phép ĐKKD: 0309982145 - Sở KHĐT TP.HCM",
    created_at: "15/01/2024",
  },
  {
    id: 3,
    code: "#VN-1192",
    name: "Gốm Sứ Bát Tràng Di Sản",
    logo_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8Fr92az9TAzy4RjsL19W6SN_nclGOpS4PEgw7ok0HnkbxDgahA-nXpe-EAK0jvT72c9qR91dRkCs07cICv46d0HPj6oVX0KC9GEcUsaarFq5zYoMpv_kjxdVkdSYuprVbYaBNc05sNIIUZIxV-qClsYZ0pSg46z4jON1WRny0hihFYxGVImoRZs9aY902o0d6a2PG8Lc8OI0RcsSbjrGMfRYyYuvrjNHBvyp3e_U",
    tier: "OFFICIAL",
    category: "Artisan Craft",
    category_icon: "local_florist",
    owner_name: "Nguyễn Thị Mai",
    owner_phone: "+84 932 777 666",
    owner_email: "mai.nguyen@battrangcraft.vn",
    location: "Gia Lâm, Hà Nội",
    sku_count: 42,
    sku_label: "42 SKUs",
    order_count: 680,
    order_label: "680 orders",
    rating_avg: 4.8,
    rating_count: 312,
    commission_rate: 8,
    commission_tier_label: "8% Tier",
    available_balance: 15400000,
    settlement_cycle: "Settled Weekly",
    status: "ACTIVE",
    status_label: "Active / Verified",
    is_live: true,
    tax_id: "0108842109",
    identity_card: "001192004412",
    business_license_url: "Giấy chứng nhận làng nghề truyền thống",
    created_at: "10/03/2024",
  },
  {
    id: 4,
    code: "#VN-6720",
    name: "TechZone Gadget Hub",
    logo_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqL1EzXx40CFCelg-LBWBchGZhjhbHorygX-l85Bxi3rg7qYPwkr3jWELUFzVfduHGloIA01rZN2wQtt5Zi9FANWUBCgVc3hgX5F4xU6gmg_vSgcB8jIpc5U0oTfqJAwgqpWNGxxFtymmsSg1lmE4e7nCIqWrM71T_l50wld_xXIB6N1_4JeNckVWaevhPwx_rENYfKNRwfMMSiKxnpQXBo9E6SjNJ_pCF8eyrY0g",
    tier: "STANDARD",
    category: "Electronics",
    category_icon: "devices",
    owner_name: "Phạm Minh Đức",
    owner_phone: "+84 975 333 222",
    owner_email: "duc.pham@techzone.vn",
    location: "Cầu Giấy, Hà Nội",
    sku_count: 115,
    sku_label: "115 SKUs",
    order_count: 2150,
    order_label: "2,150 orders",
    rating_avg: 4.7,
    rating_count: 1190,
    commission_rate: 5,
    commission_tier_label: "5% Standard",
    available_balance: 28100000,
    settlement_cycle: "Processed Payouts",
    status: "ACTIVE",
    status_label: "Active / Verified",
    is_live: true,
    tax_id: "0106654101",
    identity_card: "001090001920",
    created_at: "20/02/2024",
  },
  {
    id: 5,
    code: "#VN-3091",
    name: "FastTrend Fast Fashion",
    logo_url:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJywWxPzLf_Nn_BZ-h_jNjUQFJAbW7i__tCULJAf4iopPBP9ucWM0yOSa3P0UD741LqB1EDxhGjBu2ev1r-f7w1wjfw3FxjqzLviWpnlqx8BgHVZrwMj9gG930-nYreISHpHsnvCzBp0-BJpg1GHmyyFnLsEXeTN-NJb9RkuEgJwQh_mTo5vaKR55_oe0e89oQaIanKNyKslLJOEJaG3V0SkzSp6oIA0JaYbA_KY4",
    tier: "STANDARD",
    category: "Apparel",
    category_icon: "apparel",
    owner_name: "Vũ Quốc Huy",
    owner_phone: "+84 903 444 555",
    owner_email: "huy.vu@fasttrend.vn",
    location: "Quận 7, TP. HCM",
    sku_count: 24,
    sku_label: "24 SKUs (Frozen)",
    order_count: 310,
    order_label: "310 orders",
    rating_avg: 2.4,
    rating_count: 45,
    commission_rate: 5,
    commission_tier_label: "5% Tier",
    available_balance: 0,
    settlement_cycle: "Locked / Dispute (Escrow: 4.800.000 ₫)",
    status: "SUSPENDED",
    status_label: "Suspended",
    is_live: false,
    reject_reason: "Chính sách vi phạm khiếu nại tỉ lệ cao",
    tax_id: "0311228899",
    identity_card: "079089004455",
    created_at: "05/04/2024",
  },
];

export interface BackendManagedShop {
  id: number;
  owner_id?: number;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  warehouse_address?: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  reject_reason?: string | null;
  approval_notes?: string | null;
  follower_count: number;
  approved_at?: string | null;
  created_at: string;
  updated_at?: string;
  owner_name?: string;
  owner_email?: string | null;
  owner_phone?: string;
}

const normalizeAdminShop = (raw: Record<string, unknown>): AdminShopItem => {
  const id = Number(raw.id);
  const rawStatus = typeof raw.status === "string" ? raw.status.toUpperCase() : "";
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof raw.name !== "string" ||
    typeof raw.status !== "string" ||
    !["DRAFT", "PENDING", "NEEDS_INFO", "ACTIVE", "SUSPENDED", "REJECTED"].includes(rawStatus)
  ) {
    throw new Error(
      rawStatus
        ? `Backend trả về trạng thái shop không được hỗ trợ: ${rawStatus}.`
        : "Backend trả về dữ liệu shop không hợp lệ."
    );
  }
  const status = rawStatus as AdminShopItem["status"];
  const rawTier = String(raw.tier || "STANDARD").toUpperCase();
  const tier = (
    rawTier === "MALL" || rawTier === "PREMIUM" ? rawTier : "STANDARD"
  ) as ShopTier;
  const skuCount = typeof raw.sku_count === "number" ? raw.sku_count : 0;
  const orderCount = typeof raw.order_count === "number" ? raw.order_count : 0;
  const ratingAvg = typeof raw.rating_avg === "number" ? raw.rating_avg : 5.0;
  const ratingCount = typeof raw.rating_count === "number" ? raw.rating_count : 0;
  const commissionRate = typeof raw.commission_rate === "number" ? raw.commission_rate : 8;
  const availableBalance = typeof raw.available_balance === "number" ? raw.available_balance : 0;

  return {
    id,
    code: `#SHOP-${String(id).padStart(4, "0")}`,
    name: String(raw.name || "Gian hàng"),
    description: typeof raw.description === "string" ? raw.description : undefined,
    logo_url: typeof raw.logo_url === "string" && raw.logo_url ? raw.logo_url : null,
    tier,
    category: String(raw.category || "Bán lẻ đa ngành"),
    category_icon: String(raw.category_icon || "storefront"),
    owner_name: String(raw.owner_name || "Chưa cập nhật"),
    owner_phone: String(raw.owner_phone || raw.phone || "Chưa cập nhật"),
    owner_email: String(raw.owner_email || "Chưa cập nhật"),
    location: String(raw.warehouse_address || raw.location || "Việt Nam"),
    sku_count: skuCount,
    sku_label: skuCount > 0 ? `${skuCount} SKUs` : "Chưa có sản phẩm",
    order_count: orderCount,
    order_label: orderCount > 0 ? `${orderCount} đơn hàng` : "Chưa có đơn",
    rating_avg: ratingAvg,
    rating_count: ratingCount,
    commission_rate: commissionRate,
    commission_tier_label: `${commissionRate}% Tiêu chuẩn`,
    available_balance: availableBalance,
    settlement_cycle: String(raw.settlement_cycle || "Hàng tuần"),
    status,
    status_label:
      status === "ACTIVE"
        ? "Active / Verified"
        : status === "SUSPENDED"
        ? "Suspended"
        : status === "REJECTED"
        ? "Rejected"
        : "Pending Approval",
    is_live: status === "ACTIVE",
    tax_id: typeof raw.tax_id === "string" ? raw.tax_id : undefined,
    identity_card: typeof raw.identity_card === "string" ? raw.identity_card : undefined,
    business_license_url:
      typeof raw.business_license_url === "string" ? raw.business_license_url : undefined,
    reject_reason: typeof raw.reject_reason === "string" ? raw.reject_reason : null,
    created_at: raw.created_at
      ? new Date(String(raw.created_at)).toLocaleDateString("vi-VN")
      : "Hôm nay",
  };
};

/**
 * Làm sạch query params gửi lên Backend Go:
 * Chỉ gửi các query hợp lệ: statusTab, search, page, pageSize.
 * Không gửi đồng thời pageSize và limit, không gửi các filter schema chưa lưu (category, commissionTier, rating != 'all').
 */
const cleanAdminShopParams = (params?: ShopFilterParams) => {
  const query: Record<string, string | number> = {};
  if (!params) return query;

  // Lọc theo trạng thái
  const rawStatus = (params.statusTab || "").trim().toLowerCase();
  if (rawStatus && rawStatus !== "all") {
    query.statusTab = rawStatus;
  }

  // Lọc theo tìm kiếm từ khóa
  if (params.search && params.search.trim()) {
    query.search = params.search.trim().slice(0, 100);
  }

  // Phân trang: dùng pageSize
  if (params.page && params.page > 0) {
    query.page = params.page;
  }
  if (params.pageSize && params.pageSize > 0) {
    query.pageSize = params.pageSize;
  }

  return query;
};

export const adminShopApi = {
  /**
   * Lấy danh sách gian hàng dành cho Quản trị viên
   * GET /api/v1/admin/shops
   */
  fetchShops: async (
    params?: ShopFilterParams
  ): Promise<{
    shops: AdminShopItem[];
    total: number;
    statusCounts: NonNullable<ShopMetricStats["statusCounts"]>;
  }> => {
    const unsupportedFilters = [
      params?.category && !["all", "all categories"].includes(params.category.toLowerCase()),
      params?.commissionTier && !["all", "all tiers"].includes(params.commissionTier.toLowerCase()),
      params?.rating && !["all", "all ratings"].includes(params.rating.toLowerCase()),
    ];
    if (unsupportedFilters.some(Boolean)) {
      throw new Error("Bộ lọc danh mục, hoa hồng và đánh giá chưa được backend hỗ trợ.");
    }

    try {
      const response = await axiosClient.get<
        ApiResponse<{
          shops: unknown[];
          total?: number;
          status_counts?: Record<string, unknown>;
        }>
      >("/api/v1/admin/shops", {
        params: cleanAdminShopParams(params),
      });
      const data = response.data?.data;
      if (!response.data?.success || !data || !Array.isArray(data.shops)) {
        throw new Error("Backend trả về danh sách shop không đúng định dạng.");
      }
      if (
        data.total !== undefined &&
        (typeof data.total !== "number" || !Number.isSafeInteger(data.total) || data.total < 0)
      ) {
        throw new Error("Backend trả về tổng số shop không hợp lệ.");
      }
      const normalized = data.shops.map((item) => {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          throw new Error("Backend trả về dữ liệu shop không hợp lệ.");
        }
        return normalizeAdminShop(item as Record<string, unknown>);
      });
      const rawCounts = (data.status_counts || {}) as Record<string, unknown>;
      const getCount = (status: string): number => {
        const val =
          rawCounts[status] ??
          rawCounts[status.toLowerCase()] ??
          rawCounts[status.toUpperCase()];
        return typeof val === "number" && Number.isSafeInteger(val) && val >= 0 ? val : 0;
      };

      const counts = {
        DRAFT: getCount("DRAFT"),
        PENDING: getCount("PENDING"),
        NEEDS_INFO: getCount("NEEDS_INFO"),
        ACTIVE: getCount("ACTIVE"),
        REJECTED: getCount("REJECTED"),
        SUSPENDED: getCount("SUSPENDED"),
      };

      // Nếu backend chưa trả status_counts, tự tính toán từ danh sách shops trả về
      if (Object.keys(rawCounts).length === 0 && normalized.length > 0) {
        normalized.forEach((shop) => {
          const s = shop.status.toUpperCase();
          if (s in counts) {
            counts[s as keyof typeof counts] += 1;
          }
        });
      }

      return {
        shops: normalized,
        total: typeof data.total === "number" ? data.total : normalized.length,
        statusCounts: {
          all: Object.values(counts).reduce((sum, count) => sum + count, 0),
          draft: counts.DRAFT,
          pending: counts.PENDING,
          needs_info: counts.NEEDS_INFO,
          active: counts.ACTIVE,
          rejected: counts.REJECTED,
          suspended: counts.SUSPENDED,
        },
      };
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    let filtered = [...mockShopsState];

    // Status Filter (handle both lowercase and uppercase like "all" / "ALL")
    if (params?.statusTab && params.statusTab.toUpperCase() !== "ALL") {
      filtered = filtered.filter(
        (s) => s.status.toUpperCase() === params.statusTab!.toUpperCase()
      );
    }

    // Search Filter
    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.owner_name.toLowerCase().includes(q) ||
          s.owner_email.toLowerCase().includes(q) ||
          s.owner_phone.toLowerCase().includes(q) ||
          (s.tax_id && s.tax_id.toLowerCase().includes(q))
      );
    }

    // Category Filter (Ignore "all" or "All Categories")
    if (
      params?.category &&
      params.category.toLowerCase() !== "all" &&
      params.category.toLowerCase() !== "all categories"
    ) {
      filtered = filtered.filter(
        (s) => s.category.toLowerCase().trim() === params.category!.toLowerCase().trim()
      );
    }

    // Commission Filter (Ignore "all" or "All Tiers")
    if (
      params?.commissionTier &&
      params.commissionTier.toLowerCase() !== "all" &&
      params.commissionTier.toLowerCase() !== "all tiers"
    ) {
      const tierQuery = params.commissionTier.toUpperCase();
      filtered = filtered.filter(
        (s) =>
          s.tier.toUpperCase() === tierQuery ||
          s.commission_tier_label.toUpperCase().includes(tierQuery)
      );
    }

    // Rating Filter (Ignore "all" or "All Ratings")
    if (
      params?.rating &&
      params.rating.toLowerCase() !== "all" &&
      params.rating.toLowerCase() !== "all ratings"
    ) {
      if (params.rating.includes("4.5")) {
        filtered = filtered.filter((s) => s.rating_avg >= 4.5);
      } else if (params.rating.includes("4.0")) {
        filtered = filtered.filter((s) => s.rating_avg >= 4.0 && s.rating_avg < 4.5);
      } else if (params.rating.toLowerCase().includes("unrated")) {
        filtered = filtered.filter((s) => s.rating_avg === 0);
      } else if (params.rating.toLowerCase().includes("low")) {
        filtered = filtered.filter((s) => s.rating_avg > 0 && s.rating_avg < 3.0);
      }
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 5;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);
    const statusCounts = mockShopsState.reduce(
      (counts, shop) => {
        counts[shop.status.toLowerCase() as keyof Omit<typeof counts, "all">] += 1;
        counts.all += 1;
        return counts;
      },
      {
        all: 0,
        draft: 0,
        active: 0,
        pending: 0,
        needs_info: 0,
        suspended: 0,
        rejected: 0,
      }
    );

    return {
      shops: paginated,
      total: filtered.length,
      statusCounts,
    };
  },

  /**
   * Phê duyệt hồ sơ gian hàng, nâng quyền tài khoản chủ shop thành SELLER
   * PATCH /api/v1/admin/shops/{id}/approve
   */
  approveShop: async (shopId: number, notes?: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<unknown>>(
        `/api/v1/admin/shops/${shopId}/approve`,
        { notes }
      );
      if (response.data?.success && response.data.data) {
        return normalizeAdminShop(response.data.data as Record<string, unknown>);
      }
      throw new Error("Backend không trả về shop đã duyệt.");
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        status: "ACTIVE",
        status_label: "Active / Verified",
        is_live: true,
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  /**
   * Từ chối hồ sơ đăng ký gian hàng
   * PATCH /api/v1/admin/shops/{id}/reject
   */
  rejectShop: async (shopId: number, reason: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<unknown>>(
        `/api/v1/admin/shops/${shopId}/reject`,
        { reason }
      );
      if (response.data?.success && response.data.data) {
        return normalizeAdminShop(response.data.data as Record<string, unknown>);
      }
      throw new Error("Backend không trả về shop đã từ chối.");
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        status: "REJECTED",
        status_label: "Rejected",
        is_live: false,
        reject_reason: reason,
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  /**
   * Khóa / đình chỉ hoạt động gian hàng
   * PATCH /api/v1/admin/shops/{id}/lock
   */
  lockShop: async (shopId: number, reason?: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<unknown>>(
        `/api/v1/admin/shops/${shopId}/lock`,
        { reason }
      );
      if (response.data?.success && response.data.data) {
        return normalizeAdminShop(response.data.data as Record<string, unknown>);
      }
      throw new Error("Backend không trả về shop đã khóa.");
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        status: "SUSPENDED",
        status_label: "Suspended",
        is_live: false,
        reject_reason: reason || "Khóa bởi Quản trị viên sàn",
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  /**
   * Mở khóa gian hàng (kích hoạt lại ACTIVE)
   * PATCH /api/v1/admin/shops/{id}/status
   */
  unlockShop: async (shopId: number): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
        `/api/v1/admin/shops/${shopId}/status`,
        { status: "ACTIVE", notes: "Mở khóa hoạt động gian hàng" }
      );
      if (response.data?.success && response.data.data) {
        return normalizeAdminShop(response.data.data);
      }
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        status: "ACTIVE",
        status_label: "Active / Verified",
        is_live: true,
        reject_reason: null,
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  /**
   * Bật / Tắt trạng thái hoạt động online của gian hàng
   */
  toggleShopLive: async (shopId: number, is_live?: boolean): Promise<AdminShopItem> => {
    if (is_live) {
      return adminShopApi.approveShop(shopId, "Kích hoạt hiển thị trực tuyến");
    }
    return adminShopApi.lockShop(shopId, "Tạm ẩn gian hàng khỏi sàn");
  },

  /**
   * Cập nhật phân hạng và mức chiết khấu
   */
  updateCommissionTier: async (
    shopId: number,
    tier: ShopTier,
    rate: number
  ): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
        `/api/v1/admin/shops/${shopId}/status`,
        { status: "ACTIVE", notes: `Cập nhật phân hạng ${tier} (${rate}%)` }
      );
      if (response.data?.success && response.data.data) {
        const normalized = normalizeAdminShop(response.data.data);
        return {
          ...normalized,
          tier,
          commission_rate: rate,
          commission_tier_label: `${rate}% ${tier === "MALL" ? "Mall Tier" : "Tiêu chuẩn"}`,
        };
      }
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error;
      }
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        tier,
        commission_rate: rate,
        commission_tier_label: `${rate}% ${tier === "MALL" ? "Mall Tier" : "Tiêu chuẩn"}`,
      };
      return mockShopsState[idx];
    }

    return {
      id: shopId,
      code: `#SHOP-${String(shopId).padStart(4, "0")}`,
      name: "Shop",
      logo_url: null,
      tier,
      category: "Bán lẻ đa ngành",
      owner_name: "",
      owner_phone: "",
      owner_email: "",
      location: "",
      sku_count: 0,
      order_count: 0,
      rating_avg: 5.0,
      rating_count: 0,
      commission_rate: rate,
      commission_tier_label: `${rate}% Tiêu chuẩn`,
      available_balance: 0,
      settlement_cycle: "Hàng tuần",
      status: "ACTIVE",
      status_label: "Active / Verified",
      is_live: true,
      created_at: new Date().toLocaleDateString("vi-VN"),
    };
  },

  /**
   * Xuất danh sách gian hàng dạng CSV từ dữ liệu thực tế
   */
  exportCsv: async (): Promise<Blob> => {
    try {
      const { shops } = await adminShopApi.fetchShops({ pageSize: 100 });
      const headers =
        "Mã Shop,Tên Gian Hàng,Phân Hạng,Ngành Hàng,Chủ Sở Hữu,Số Điện Thoại,Email,Địa Chỉ Kho,Số Lượng SKU,Đơn Hàng,Đánh Giá,Trạng Thái\n";
      const rows = shops
        .map(
          (s) =>
            `"${s.code}","${s.name}","${s.tier}","${s.category}","${s.owner_name}","${s.owner_phone}","${s.owner_email}","${s.location}","${s.sku_count}","${s.order_count}","${s.rating_avg}","${s.status_label}"`
        )
        .join("\n");
      return new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    } catch {
      const headers =
        "Shop Code,Shop Name,Tier,Category,Owner Name,Phone,Email,Location,SKUs,Orders,Rating,Commission,Balance,Status\n";
      const rows = mockShopsState
        .map(
          (s) =>
            `"${s.code}","${s.name}","${s.tier}","${s.category}","${s.owner_name}","${s.owner_phone}","${s.owner_email}","${s.location}","${s.sku_count}","${s.order_count}","${s.rating_avg}","${s.commission_tier_label}","${s.available_balance}","${s.status_label}"`
        )
        .join("\n");
      return new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    }
  },
};

export default adminShopApi;
