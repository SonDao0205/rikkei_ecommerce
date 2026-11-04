import axiosClient from "../axiosClient";
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

/**
 * Adapter chuẩn hóa dữ liệu từ ManagedShop của Go Backend sang AdminShopItem của UI
 */
export const normalizeAdminShop = (raw: Record<string, unknown>): AdminShopItem => {
  const id = Number(raw.id || 0);
  const statusStr = String(raw.status || "PENDING").toUpperCase();
  const status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" =
    statusStr === "ACTIVE" || statusStr === "SUSPENDED" || statusStr === "REJECTED"
      ? statusStr
      : "PENDING";

  const tier: ShopTier = (raw.tier as ShopTier) || "STANDARD";
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
  ): Promise<{ shops: AdminShopItem[]; total: number }> => {
    const cleanedParams = cleanAdminShopParams(params);
    const response = await axiosClient.get<
      ApiResponse<{ shops: Record<string, unknown>[]; total?: number; page?: number; pageSize?: number }>
    >("/api/v1/admin/shops", { params: cleanedParams });

    const rawList = response.data?.data?.shops || [];
    const normalized = rawList.map(normalizeAdminShop);
    const total = response.data?.data?.total ?? normalized.length;

    return {
      shops: normalized,
      total,
    };
  },

  /**
   * Tính toán số liệu thống kê thực tế từ Backend
   * Thực hiện truy vấn đếm theo từng tab trạng thái từ cơ sở dữ liệu MySQL
   */
  fetchShopMetrics: async (): Promise<ShopMetricStats> => {
    try {
      const [allRes, activeRes, pendingRes, suspendedRes] = await Promise.all([
        axiosClient.get<ApiResponse<{ total: number }>>("/api/v1/admin/shops", {
          params: { pageSize: 1 },
        }),
        axiosClient.get<ApiResponse<{ total: number }>>("/api/v1/admin/shops", {
          params: { statusTab: "active", pageSize: 1 },
        }),
        axiosClient.get<ApiResponse<{ total: number }>>("/api/v1/admin/shops", {
          params: { statusTab: "pending", pageSize: 1 },
        }),
        axiosClient.get<ApiResponse<{ total: number }>>("/api/v1/admin/shops", {
          params: { statusTab: "suspended", pageSize: 1 },
        }),
      ]);

      const totalShops = allRes.data?.data?.total || 0;
      const activeShops = activeRes.data?.data?.total || 0;
      const pendingCount = pendingRes.data?.data?.total || 0;
      const suspendedCount = suspendedRes.data?.data?.total || 0;
      const activeRate =
        totalShops > 0 ? Math.round((activeShops / totalShops) * 100) : 100;

      return {
        totalShops,
        activeShops,
        activeRateText: `${activeRate}% tỷ lệ hoạt động`,
        pendingKycCount: pendingCount,
        pendingActionRequired: pendingCount,
        suspendedCount,
        suspendedNote: "Đang tạm ngưng",
        totalGmvFormatted: "₫ 0",
        totalGmvChange: "0% MoM",
        statusCounts: {
          all: totalShops,
          active: activeShops,
          pending: pendingCount,
          suspended: suspendedCount,
        },
        totalActive: activeShops,
        activeGrowth: `${activeShops} gian hàng`,
        pendingKyc: pendingCount,
        suspended: suspendedCount,
        totalGmv: 0,
        formattedGmv: "0 ₫",
        gmvGrowth: "0%",
      };
    } catch {
      // Fallback khi chưa có mạng
      return {
        totalShops: 0,
        activeShops: 0,
        activeRateText: "100% active rate",
        pendingKycCount: 0,
        pendingActionRequired: 0,
        suspendedCount: 0,
        suspendedNote: "",
        totalGmvFormatted: "₫ 0",
        totalGmvChange: "0%",
        statusCounts: { all: 0, active: 0, pending: 0, suspended: 0 },
        totalActive: 0,
        activeGrowth: "0",
        pendingKyc: 0,
        suspended: 0,
        totalGmv: 0,
        formattedGmv: "0 ₫",
        gmvGrowth: "0%",
      };
    }
  },

  /**
   * Phê duyệt hồ sơ gian hàng, nâng quyền tài khoản chủ shop thành SELLER
   * PATCH /api/v1/admin/shops/{id}/approve
   */
  approveShop: async (shopId: number, notes?: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
      `/api/v1/admin/shops/${shopId}/approve`,
      { notes: notes || "" }
    );
    return normalizeAdminShop(response.data.data);
  },

  /**
   * Từ chối hồ sơ đăng ký gian hàng
   * PATCH /api/v1/admin/shops/{id}/reject
   */
  rejectShop: async (shopId: number, reason: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
      `/api/v1/admin/shops/${shopId}/reject`,
      { reason: reason.trim() }
    );
    return normalizeAdminShop(response.data.data);
  },

  /**
   * Khóa / đình chỉ hoạt động gian hàng
   * PATCH /api/v1/admin/shops/{id}/lock
   */
  lockShop: async (shopId: number, reason?: string): Promise<AdminShopItem> => {
    const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
      `/api/v1/admin/shops/${shopId}/lock`,
      { reason: (reason || "Khóa bởi Quản trị viên sàn").trim() }
    );
    return normalizeAdminShop(response.data.data);
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
    return normalizeAdminShop(response.data.data);
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
    // Schema hiện tại chưa lưu tier/commission riêng, lưu tạm ghi chú duyệt
    try {
      const response = await axiosClient.patch<ApiResponse<Record<string, unknown>>>(
        `/api/v1/admin/shops/${shopId}/status`,
        { status: "ACTIVE", notes: `Cập nhật phân hạng ${tier} (${rate}%)` }
      );
      const normalized = normalizeAdminShop(response.data.data);
      return {
        ...normalized,
        tier,
        commission_rate: rate,
        commission_tier_label: `${rate}% ${tier === "MALL" ? "Mall Tier" : "Tiêu chuẩn"}`,
      };
    } catch {
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
    }
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

export default adminShopApi;
