import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import adminShopApi from "../../../api/admin/adminShopApi";
import type {
  AdminShopItem,
  ShopMetricStats,
  ShopFilterParams,
  ShopTier,
  AdminShopStatus,
} from "../../../types";

interface AdminShopState {
  shops: AdminShopItem[];
  metrics: ShopMetricStats;
  selectedIds: number[];
  selectedShopForKyc: AdminShopItem | null;
  isKycDrawerOpen: boolean;
  filters: ShopFilterParams;
  currentPage: number;
  pageSize: number;
  totalShops: number;
  isLoading: boolean;
  shopsRequestId: string | null;
  isActionLoading: boolean;
  isExporting: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AdminShopState = {
  shops: [],
  metrics: {
    totalShops: 0,
    activeShops: 0,
    activeRateText: "Đang tải dữ liệu từ BE",
    pendingKycCount: 0,
    pendingActionRequired: 0,
    suspendedCount: 0,
    suspendedNote: "Theo trạng thái từ BE",
    totalGmvFormatted: "Chưa có dữ liệu",
    totalGmvChange: "BE chưa hỗ trợ API doanh thu",
    statusCounts: {
      all: 0,
      draft: 0,
      active: 0,
      pending: 0,
      needs_info: 0,
      suspended: 0,
      rejected: 0,
    },
  },
  selectedIds: [],
  selectedShopForKyc: null,
  isKycDrawerOpen: false,
  filters: {
    statusTab: "all",
    search: "",
    category: "all",
    commissionTier: "all",
    rating: "all",
  },
  currentPage: 1,
  pageSize: 5,
  totalShops: 0,
  isLoading: false,
  shopsRequestId: null,
  isActionLoading: false,
  isExporting: false,
  error: null,
  successMessage: null,
};

export const getAdminShops = createAsyncThunk<
  {
    shops: AdminShopItem[];
    total: number;
    statusCounts: NonNullable<ShopMetricStats["statusCounts"]>;
    page: number;
  },
  ShopFilterParams | void,
  { rejectValue: string }
>("adminShop/getAdminShops", async (params, { getState, rejectWithValue }) => {
  try {
    const filter = (params || {}) as ShopFilterParams;
    const state = (getState() as { adminShop: AdminShopState }).adminShop;
    const effectiveParams: ShopFilterParams = {
      statusTab: filter.statusTab !== undefined ? filter.statusTab : state.filters.statusTab,
      search: filter.search !== undefined ? filter.search : state.filters.search,
      category: filter.category !== undefined ? filter.category : state.filters.category,
      commissionTier:
        filter.commissionTier !== undefined
          ? filter.commissionTier
          : state.filters.commissionTier,
      rating: filter.rating !== undefined ? filter.rating : state.filters.rating,
      page: filter.page || state.currentPage,
      pageSize: filter.pageSize || state.pageSize,
    };
    const result = await adminShopApi.fetchShops(effectiveParams);
    const requestedPage = effectiveParams.page ?? 1;
    const pageSize = effectiveParams.pageSize ?? state.pageSize;
    const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
    const page = Math.min(requestedPage, lastPage);
    if (page !== requestedPage) {
      return { ...(await adminShopApi.fetchShops({ ...effectiveParams, page })), page };
    }
    return { ...result, page };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Không thể tải danh sách cửa hàng");
  }
});

export const approveShopThunk = createAsyncThunk<
  AdminShopItem,
  { shopId: number; notes?: string },
  { rejectValue: string }
>("adminShop/approveShop", async ({ shopId, notes }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminShopApi.approveShop(shopId, notes);
    dispatch(getAdminShops());
    return res;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Phê duyệt cửa hàng thất bại");
  }
});

export const rejectShopThunk = createAsyncThunk<
  AdminShopItem,
  { shopId: number; reason: string },
  { rejectValue: string }
>("adminShop/rejectShop", async ({ shopId, reason }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminShopApi.rejectShop(shopId, reason);
    dispatch(getAdminShops());
    return res;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Từ chối cửa hàng thất bại");
  }
});

export const toggleShopLiveThunk = createAsyncThunk<
  AdminShopItem,
  { shopId: number; is_live: boolean },
  { rejectValue: string }
>("adminShop/toggleShopLive", async ({ shopId, is_live }, { rejectWithValue }) => {
  try {
    return await adminShopApi.toggleShopLive(shopId, is_live);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Bật/Tắt hiển thị gian hàng thất bại");
  }
});

export const lockShopThunk = createAsyncThunk<
  AdminShopItem,
  { shopId: number; reason: string },
  { rejectValue: string }
>("adminShop/lockShop", async ({ shopId, reason }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminShopApi.lockShop(shopId, reason);
    dispatch(getAdminShops());
    return res;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Khóa cửa hàng thất bại");
  }
});

export const unlockShopThunk = createAsyncThunk<
  AdminShopItem,
  number,
  { rejectValue: string }
>("adminShop/unlockShop", async (shopId, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminShopApi.unlockShop(shopId);
    dispatch(getAdminShops());
    return res;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Mở khóa cửa hàng thất bại");
  }
});

export const updateCommissionTierThunk = createAsyncThunk<
  AdminShopItem,
  { shopId: number; tier: ShopTier; rate: number },
  { rejectValue: string }
>("adminShop/updateCommissionTier", async ({ shopId, tier, rate }, { rejectWithValue }) => {
  try {
    return await adminShopApi.updateCommissionTier(shopId, tier, rate);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Cập nhật phí hoa hồng thất bại");
  }
});

export const exportShopsCsvThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("adminShop/exportShopsCsv", async (_, { rejectWithValue }) => {
  try {
    const blob = await adminShopApi.exportCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shops-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Xuất CSV thất bại");
  }
});

const adminShopSlice = createSlice({
  name: "adminShop",
  initialState,
  reducers: {
    setStatusTab: (
      state,
      action: PayloadAction<AdminShopStatus>
    ) => {
      state.filters.statusTab = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.currentPage = 1;
    },
    setCommissionFilter: (state, action: PayloadAction<string>) => {
      state.filters.commissionTier = action.payload;
      state.currentPage = 1;
    },
    setRatingFilter: (state, action: PayloadAction<string>) => {
      state.filters.rating = action.payload;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {
        statusTab: "all",
        search: "",
        category: "all",
        commissionTier: "all",
        rating: "all",
      };
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    toggleSelectShop: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    toggleSelectAllShops: (state) => {
      if (state.selectedIds.length === state.shops.length) {
        state.selectedIds = [];
      } else {
        state.selectedIds = state.shops.map((s) => s.id);
      }
    },
    openKycDrawer: (state, action: PayloadAction<AdminShopItem>) => {
      state.selectedShopForKyc = action.payload;
      state.isKycDrawerOpen = true;
    },
    closeKycDrawer: (state) => {
      state.isKycDrawerOpen = false;
      state.selectedShopForKyc = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // getAdminShops
    builder.addCase(getAdminShops.pending, (state, action) => {
      state.isLoading = true;
      state.shopsRequestId = action.meta.requestId;
      state.error = null;
    });
    builder.addCase(getAdminShops.fulfilled, (state, action) => {
      if (state.shopsRequestId !== action.meta.requestId) return;
      state.isLoading = false;
      state.shopsRequestId = null;
      state.shops = action.payload.shops;
      state.totalShops = action.payload.total;
      state.currentPage = action.payload.page;
      const counts = action.payload.statusCounts;
      state.metrics = {
        ...state.metrics,
        totalShops: counts.all,
        activeShops: counts.active,
        activeRateText: counts.all
          ? `${Math.round((counts.active / counts.all) * 100)}% tổng số shop`
          : "Chưa có shop hoạt động",
        pendingKycCount: counts.pending,
        pendingActionRequired: counts.needs_info,
        suspendedCount: counts.suspended,
        suspendedNote: "Theo trạng thái từ BE",
        totalGmvFormatted: "Chưa có dữ liệu",
        totalGmvChange: "BE chưa hỗ trợ API doanh thu",
        statusCounts: counts,
      };
    });
    builder.addCase(getAdminShops.rejected, (state, action) => {
      if (state.shopsRequestId !== action.meta.requestId) return;
      state.isLoading = false;
      state.shopsRequestId = null;
      state.error = action.payload || "Không thể tải danh sách cửa hàng";
    });

    // approveShopThunk
    builder.addCase(approveShopThunk.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(approveShopThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.successMessage = `Đã duyệt hồ sơ KYC của shop "${action.payload.name}" thành công!`;
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx] = action.payload;
      }
      if (state.selectedShopForKyc?.id === action.payload.id) {
        state.selectedShopForKyc = action.payload;
      }
    });
    builder.addCase(approveShopThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload || "Phê duyệt thất bại";
    });

    // rejectShopThunk
    builder.addCase(rejectShopThunk.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(rejectShopThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.successMessage = `Đã từ chối đơn đăng ký shop "${action.payload.name}"!`;
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx] = action.payload;
      }
      if (state.selectedShopForKyc?.id === action.payload.id) {
        state.selectedShopForKyc = action.payload;
      }
    });
    builder.addCase(rejectShopThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload || "Từ chối thất bại";
    });

    // toggleShopLiveThunk
    builder.addCase(toggleShopLiveThunk.fulfilled, (state, action) => {
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx].is_live = action.payload.is_live;
      }
      state.successMessage = action.payload.is_live
        ? `Đã kích hoạt hiển thị gian hàng "${action.payload.name}".`
        : `Đã tạm ẩn gian hàng "${action.payload.name}".`;
    });

    // lockShopThunk
    builder.addCase(lockShopThunk.fulfilled, (state, action) => {
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx] = action.payload;
      }
      state.successMessage = `Đã khóa gian hàng "${action.payload.name}" do vi phạm chính sách sàn!`;
    });

    // unlockShopThunk
    builder.addCase(unlockShopThunk.fulfilled, (state, action) => {
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx] = action.payload;
      }
      state.successMessage = `Đã gỡ đình chỉ gian hàng "${action.payload.name}".`;
    });

    // updateCommissionTierThunk
    builder.addCase(updateCommissionTierThunk.fulfilled, (state, action) => {
      const idx = state.shops.findIndex((s) => s.id === action.payload.id);
      if (idx !== -1) {
        state.shops[idx] = action.payload;
      }
      state.successMessage = `Đã cập nhật mức hoa hồng cho shop "${action.payload.name}".`;
    });

    // exportShopsCsvThunk
    builder.addCase(exportShopsCsvThunk.pending, (state) => {
      state.isExporting = true;
    });
    builder.addCase(exportShopsCsvThunk.fulfilled, (state) => {
      state.isExporting = false;
      state.successMessage = "Xuất danh sách cửa hàng ra CSV thành công!";
    });
    builder.addCase(exportShopsCsvThunk.rejected, (state, action) => {
      state.isExporting = false;
      state.error = action.payload || "Lỗi khi xuất CSV";
    });
  },
});

export const {
  setStatusTab,
  setSearchQuery,
  setCategoryFilter,
  setCommissionFilter,
  setRatingFilter,
  clearFilters,
  setCurrentPage,
  toggleSelectShop,
  toggleSelectAllShops,
  openKycDrawer,
  closeKycDrawer,
  clearMessages,
} = adminShopSlice.actions;

export default adminShopSlice.reducer;
