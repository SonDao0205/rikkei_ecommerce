import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopVoucherApi } from "@/domains/shop/api/shopVoucherApi";
import type {
  ShopVoucherItem,
  ShopVoucherStatus,
  VoucherFilterCategory,
  ShopVoucherStats,
  CreateShopVoucherPayload,
} from "@/domains/shop/types/shopVoucher.types";

interface ShopVoucherState {
  vouchers: ShopVoucherItem[];
  stats: ShopVoucherStats;
  filters: {
    statusTab: ShopVoucherStatus;
    typeFilter: VoucherFilterCategory;
    search: string;
  };
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingVoucher: ShopVoucherItem | null;
}

const initialStats: ShopVoucherStats = {
  activeCount: 0,
  totalUsage: 0,
  voucherRevenue: 0,
  discountSpent: 0,
};

const initialState: ShopVoucherState = {
  vouchers: [],
  stats: initialStats,
  filters: {
    statusTab: "all",
    typeFilter: "all",
    search: "",
  },
  isLoading: false,
  isSaving: false,
  error: null,
  isModalOpen: false,
  editingVoucher: null,
};

export const fetchShopVoucherList = createAsyncThunk<
  ShopVoucherItem[],
  void,
  { rejectValue: string }
>("shopVoucher/fetchList", async (_, { rejectWithValue }) => {
  try {
    const list = await shopVoucherApi.getShopVouchers();
    return list;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tải voucher";
    return rejectWithValue(errorMsg);
  }
});

export const fetchShopVoucherStatsThunk = createAsyncThunk<
  ShopVoucherStats,
  void,
  { rejectValue: string }
>("shopVoucher/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const stats = await shopVoucherApi.getShopVoucherStats();
    return stats;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tải thống kê";
    return rejectWithValue(errorMsg);
  }
});

export const createShopVoucherThunk = createAsyncThunk<
  ShopVoucherItem,
  CreateShopVoucherPayload,
  { rejectValue: string }
>("shopVoucher/create", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopVoucherApi.createShopVoucher(payload);
    dispatch(fetchShopVoucherStatsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tạo voucher";
    return rejectWithValue(errorMsg);
  }
});

export const updateShopVoucherThunk = createAsyncThunk<
  ShopVoucherItem,
  { id: string; payload: Partial<ShopVoucherItem> },
  { rejectValue: string }
>("shopVoucher/update", async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopVoucherApi.updateShopVoucher(id, payload);
    dispatch(fetchShopVoucherStatsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi cập nhật voucher";
    return rejectWithValue(errorMsg);
  }
});

export const deleteShopVoucherThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("shopVoucher/delete", async (id, { dispatch, rejectWithValue }) => {
  try {
    await shopVoucherApi.deleteShopVoucher(id);
    dispatch(fetchShopVoucherStatsThunk());
    return id;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xoá voucher";
    return rejectWithValue(errorMsg);
  }
});

export const toggleShopVoucherStatusThunk = createAsyncThunk<
  ShopVoucherItem,
  string,
  { rejectValue: string }
>("shopVoucher/toggleStatus", async (id, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopVoucherApi.toggleShopVoucherStatus(id);
    dispatch(fetchShopVoucherStatsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi đổi trạng thái voucher";
    return rejectWithValue(errorMsg);
  }
});

export const shopVoucherSlice = createSlice({
  name: "shopVoucher",
  initialState,
  reducers: {
    setStatusTab: (state, action: PayloadAction<ShopVoucherStatus>) => {
      state.filters.statusTab = action.payload;
    },
    setTypeFilter: (state, action: PayloadAction<VoucherFilterCategory>) => {
      state.filters.typeFilter = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    openCreateModal: (state) => {
      state.editingVoucher = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action: PayloadAction<ShopVoucherItem>) => {
      state.editingVoucher = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingVoucher = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder.addCase(fetchShopVoucherList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchShopVoucherList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.vouchers = action.payload;
    });
    builder.addCase(fetchShopVoucherList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Lỗi tải voucher";
    });

    // Stats
    builder.addCase(fetchShopVoucherStatsThunk.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create
    builder.addCase(createShopVoucherThunk.pending, (state) => {
      state.isSaving = true;
    });
    builder.addCase(createShopVoucherThunk.fulfilled, (state, action) => {
      state.isSaving = false;
      state.vouchers.unshift(action.payload);
      state.isModalOpen = false;
    });
    builder.addCase(createShopVoucherThunk.rejected, (state, action) => {
      state.isSaving = false;
      state.error = action.payload || "Lỗi tạo voucher";
    });

    // Update
    builder.addCase(updateShopVoucherThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.vouchers = state.vouchers.map((v) => (v.id === updated.id ? updated : v));
      state.isModalOpen = false;
      state.editingVoucher = null;
    });

    // Delete
    builder.addCase(deleteShopVoucherThunk.fulfilled, (state, action) => {
      state.vouchers = state.vouchers.filter((v) => v.id !== action.payload);
    });

    // Toggle
    builder.addCase(toggleShopVoucherStatusThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.vouchers = state.vouchers.map((v) => (v.id === updated.id ? updated : v));
    });
  },
});

export const {
  setStatusTab,
  setTypeFilter,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeModal,
} = shopVoucherSlice.actions;

export default shopVoucherSlice.reducer;

