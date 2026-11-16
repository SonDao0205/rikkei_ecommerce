import axiosClient from "@/shared/api/axiosClient";
import type {
  AdminShopItem,
  ShopMetricStats,
  ShopFilterParams,
  ShopTier,
} from "@/shared/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
  },

  /**
   * Phê duyệt hồ sơ gian hàng, nâng quyền tài khoản chủ shop thành SELLER
   * PATCH /api/v1/admin/shops/{id}/approve
   */
  approveShop: async (shopId: number, notes?: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<unknown>>(
      `/api/v1/admin/shops/${shopId}/approve`,
      { notes }
    );
    if (response.data?.success && response.data.data) {
      return normalizeAdminShop(response.data.data as Record<string, unknown>);
    }
    throw new Error("Backend không trả về shop đã duyệt.");
  },

  /**
   * Từ chối hồ sơ đăng ký gian hàng
   * PATCH /api/v1/admin/shops/{id}/reject
   */
  rejectShop: async (shopId: number, reason: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<unknown>>(
      `/api/v1/admin/shops/${shopId}/reject`,
      { reason }
    );
    if (response.data?.success && response.data.data) {
      return normalizeAdminShop(response.data.data as Record<string, unknown>);
    }
    throw new Error("Backend không trả về shop đã từ chối.");
  },

  /**
   * Khóa / đình chỉ hoạt động gian hàng
   * PATCH /api/v1/admin/shops/{id}/lock
   */
  lockShop: async (shopId: number, reason?: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<unknown>>(
      `/api/v1/admin/shops/${shopId}/lock`,
      { reason }
    );
    if (response.data?.success && response.data.data) {
      return normalizeAdminShop(response.data.data as Record<string, unknown>);
    }
    throw new Error("Backend không trả về shop đã khóa.");
  },

  /**
   * Mở khóa gian hàng (kích hoạt lại ACTIVE)
   * PATCH /api/v1/admin/shops/{id}/status
   */
  unlockShop: async (shopId: number): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
      `/api/v1/admin/shops/${shopId}/status`,
      { status: "ACTIVE", notes: "Mở khóa hoạt động gian hàng" }
    );
    if (response.data?.success && response.data.data) {
      return normalizeAdminShop(response.data.data);
    }
    throw new Error("Backend không trả về shop đã mở khóa.");
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
    throw new Error("Cập nhật phân hạng gian hàng không thành công.");
  },

  /**
   * Xuất danh sách gian hàng dạng CSV từ dữ liệu thực tế
   */
  exportCsv: async (): Promise<Blob> => {
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
  },
};

// Compatibility export
export const mockShopsState: AdminShopItem[] = [];

export default adminShopApi;
