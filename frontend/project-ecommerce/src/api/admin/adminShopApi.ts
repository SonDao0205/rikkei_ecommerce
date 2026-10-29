import axiosClient from "../axiosClient";
import type {
  AdminShopItem,
  ShopMetricStats,
  ShopFilterParams,
  ShopTier,
} from "../../types/ecommerce";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export let mockShopsState: AdminShopItem[] = [
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

export const adminShopApi = {
  fetchShops: async (
    params?: ShopFilterParams
  ): Promise<{ shops: AdminShopItem[]; total: number }> => {
    try {
      const response = await axiosClient.get<
        ApiResponse<{ shops: AdminShopItem[]; total: number }>
      >("/api/v1/admin/shops", { params });
      if (response.data && response.data.data && response.data.data.shops) {
        return response.data.data;
      }
    } catch {
      // In-memory fallback
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

    return {
      shops: paginated.length > 0 ? paginated : filtered,
      total: filtered.length,
    };
  },

  fetchShopMetrics: async (): Promise<ShopMetricStats> => {
    try {
      const response = await axiosClient.get<ApiResponse<ShopMetricStats>>(
        "/api/v1/admin/shops/metrics"
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    return {
      totalShops: 55,
      activeShops: 48,
      activeRateText: "92% active rate",
      pendingKycCount: 5,
      pendingActionRequired: 3,
      suspendedCount: 2,
      suspendedNote: "Policy violations",
      totalGmvFormatted: "₫ 842.500.000",
      totalGmvChange: "+14.2% MoM",
      statusCounts: {
        all: 55,
        active: 48,
        pending: 5,
        suspended: 2,
      },
      totalActive: 48,
      activeGrowth: "+3 this month",
      pendingKyc: 5,
      suspended: 2,
      totalGmv: 128450000,
      formattedGmv: "128.450.000 ₫",
      gmvGrowth: "+14.2% vs last month",
    };
  },

  approveShop: async (shopId: number, notes?: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/approve`,
        { notes }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
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

  rejectShop: async (shopId: number, reason: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/reject`,
        { reason }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
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

  toggleShopLive: async (shopId: number, is_live?: boolean): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/toggle-live`,
        { is_live }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      const newLive = is_live !== undefined ? is_live : !mockShopsState[idx].is_live;
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        is_live: newLive,
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  lockShop: async (shopId: number, reason?: string): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/lock`,
        { reason }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
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

  unlockShop: async (shopId: number): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/unlock`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
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

  updateCommissionTier: async (
    shopId: number,
    tier: ShopTier,
    rate: number
  ): Promise<AdminShopItem> => {
    try {
      const response = await axiosClient.patch<ApiResponse<AdminShopItem>>(
        `/api/v1/admin/shops/${shopId}/commission`,
        { tier, rate }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // In-memory update
    }

    const idx = mockShopsState.findIndex((s) => s.id === shopId);
    if (idx !== -1) {
      mockShopsState[idx] = {
        ...mockShopsState[idx],
        tier,
        commission_rate: rate,
        commission_tier_label: `${rate}% ${tier === "MALL" ? "Mall Tier" : "Tier"}`,
      };
      return mockShopsState[idx];
    }
    throw new Error("Không tìm thấy cửa hàng");
  },

  exportCsv: async (): Promise<Blob> => {
    try {
      const response = await axiosClient.get("/api/v1/admin/shops/export", {
        responseType: "blob",
      });
      return response.data;
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
