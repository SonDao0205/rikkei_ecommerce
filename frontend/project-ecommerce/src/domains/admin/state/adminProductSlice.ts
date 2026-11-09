import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { productApi } from "@/domains/storefront/api/productApi";
import type {
  AdminProductItem,
  InventoryStats,
  AdminProductQueryParams,
  AdminProductSortOption,
  AdminStockStatus,
  AdminProductStatusTab,
  ProductStatusCounts,
  ProductApprovalStatus,
} from "@/shared/types";

const MODERATION_KEY = "admin_product_moderation_map";
const SEED_PENDING_IDS = [960003, 960023];

const getStoredModeration = (): Record<
  number,
  { status: ProductApprovalStatus; reject_reason?: string }
> => {
  try {
    const raw = localStorage.getItem(MODERATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveModerationItem = (
  id: number,
  status: ProductApprovalStatus,
  reject_reason?: string
) => {
  try {
    const current = getStoredModeration();
    current[id] = { status, reject_reason };
    localStorage.setItem(MODERATION_KEY, JSON.stringify(current));
  } catch {
    // ignore storage quota error
  }
};

const computeStatusCounts = (products: AdminProductItem[]): ProductStatusCounts => {
  let pending = 0;
  let active = 0;
  let inactive = 0;
  let rejected = 0;

  for (const p of products) {
    if (p.status === "PENDING") {
      pending++;
    } else if (p.status === "REJECTED") {
      rejected++;
    } else if (p.status === "ACTIVE" || p.is_active) {
      active++;
    } else {
      inactive++;
    }
  }

  return {
    all: products.length,
    pending,
    active,
    inactive,
    rejected,
  };
};

interface AdminProductState {
  products: AdminProductItem[];
  stats: InventoryStats | null;
  totalProducts: number;
  loading: boolean;
  error: string | null;

  // Filter & Status Tabs
  statusTab: AdminProductStatusTab;
  statusCounts: ProductStatusCounts;

  // Filters & Controls
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: AdminStockStatus | "";
  vendorFilter: string;
  sortBy: AdminProductSortOption;

  // Row selection for bulk actions
  selectedIds: number[];

  // Pagination
  currentPage: number;
  pageSize: number;
}

const initialState: AdminProductState = {
  products: [],
  stats: null,
  totalProducts: 0,
  loading: false,
  error: null,

  statusTab: "all",
  statusCounts: {
    all: 0,
    pending: 0,
    active: 0,
    inactive: 0,
    rejected: 0,
  },

  searchQuery: "",
  categoryFilter: "",
  stockStatusFilter: "",
  vendorFilter: "",
  sortBy: "newest",

  selectedIds: [],

  currentPage: 1,
  pageSize: 10,
};

export const getInventoryStats = createAsyncThunk(
  "adminProducts/getInventoryStats",
  async (_, { rejectWithValue }) => {
    try {
      return await productApi.fetchInventoryStats();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load stats");
    }
  }
);

export const getAdminProducts = createAsyncThunk(
  "adminProducts/getAdminProducts",
  async (
    params: AdminProductQueryParams | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await productApi.fetchAdminProducts(params);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load admin products");
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  "adminProducts/toggleProductStatus",
  async (productId: number, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { adminProduct: AdminProductState };
      const current = state.adminProduct.products.find((p) => p.id === productId);
      const newActive = current ? !current.is_active : true;
      const result = await productApi.toggleAdminProductStatus(productId, newActive);
      saveModerationItem(productId, newActive ? "ACTIVE" : "INACTIVE");
      dispatch(getInventoryStats());
      return result;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to toggle status");
    }
  }
);

export const approveProduct = createAsyncThunk(
  "adminProducts/approveProduct",
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await productApi.approveAdminProduct(productId);
      saveModerationItem(productId, "ACTIVE");
      dispatch(getInventoryStats());
      return { id: productId, status: "ACTIVE" as const, is_active: true };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to approve product");
    }
  }
);

export const rejectProduct = createAsyncThunk(
  "adminProducts/rejectProduct",
  async (
    payload: { productId: number; reason: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await productApi.rejectAdminProduct(payload.productId, payload.reason);
      saveModerationItem(payload.productId, "REJECTED", payload.reason);
      dispatch(getInventoryStats());
      return {
        id: payload.productId,
        status: "REJECTED" as const,
        is_active: false,
        reason: payload.reason,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to reject product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (productId: number, { dispatch, rejectWithValue }) => {
    try {
      await productApi.deleteAdminProduct(productId);
      dispatch(getInventoryStats());
      return productId;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete product");
    }
  }
);

export const executeBulkAction = createAsyncThunk(
  "adminProducts/executeBulkAction",
  async (
    payload: {
      action: "activate" | "deactivate" | "delete" | "approve";
      productIds: number[];
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (payload.action === "approve") {
        for (const id of payload.productIds) {
          saveModerationItem(id, "ACTIVE");
        }
        dispatch(getInventoryStats());
        return { action: "approve", count: payload.productIds.length, productIds: payload.productIds };
      }
      const result = await productApi.bulkAdminAction(payload.action, payload.productIds);
      dispatch(getInventoryStats());
      return { ...result, productIds: payload.productIds };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to execute bulk action");
    }
  }
);

export const adminProductSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {
    setStatusTab: (state, action: PayloadAction<AdminProductStatusTab>) => {
      state.statusTab = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setStockStatusFilter: (state, action: PayloadAction<AdminStockStatus | "">) => {
      state.stockStatusFilter = action.payload;
      state.currentPage = 1;
    },
    setVendorFilter: (state, action: PayloadAction<string>) => {
      state.vendorFilter = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<AdminProductSortOption>) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    clearAllFilters: (state) => {
      state.searchQuery = "";
      state.categoryFilter = "";
      state.stockStatusFilter = "";
      state.vendorFilter = "";
      state.sortBy = "newest";
      state.currentPage = 1;
    },
    toggleSelectProduct: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllProducts: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedIds = state.products.map((p) => p.id);
      } else {
        state.selectedIds = [];
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearAdminProductError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(getInventoryStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Admin Products
      .addCase(getAdminProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        const storedModeration = getStoredModeration();

        // Apply moderation status mapping
        const mappedProducts = (action.payload.products || []).map((prod) => {
          const mod = storedModeration[prod.id];
          if (mod) {
            return {
              ...prod,
              status: mod.status,
              reject_reason: mod.reject_reason || prod.reject_reason,
              is_active: mod.status === "ACTIVE",
            };
          }
          if (SEED_PENDING_IDS.includes(prod.id) || prod.status === "PENDING") {
            return {
              ...prod,
              status: "PENDING" as const,
              is_active: false,
            };
          }
          const isActive = prod.is_active || prod.status === "ACTIVE";
          return {
            ...prod,
            status: isActive ? ("ACTIVE" as const) : ("INACTIVE" as const),
            is_active: isActive,
          };
        });

        state.products = mappedProducts;
        state.totalProducts = action.payload.total || mappedProducts.length;
        state.statusCounts = computeStatusCounts(mappedProducts);
        state.selectedIds = state.selectedIds.filter((id) =>
          mappedProducts.some((p) => p.id === id)
        );
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve Product
      .addCase(approveProduct.fulfilled, (state, action) => {
        const { id } = action.payload;
        const target = state.products.find((p) => p.id === id);
        if (target) {
          target.status = "ACTIVE";
          target.is_active = true;
          target.reject_reason = undefined;
        }
        state.statusCounts = computeStatusCounts(state.products);
      })
      .addCase(approveProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Reject Product
      .addCase(rejectProduct.fulfilled, (state, action) => {
        const { id, reason } = action.payload;
        const target = state.products.find((p) => p.id === id);
        if (target) {
          target.status = "REJECTED";
          target.is_active = false;
          target.reject_reason = reason;
        }
        state.statusCounts = computeStatusCounts(state.products);
      })
      .addCase(rejectProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Toggle Status
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const { id, is_active } = action.payload;
        const index = state.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.products[index].is_active = is_active;
          state.products[index].status = is_active ? "ACTIVE" : "INACTIVE";
        }
        state.statusCounts = computeStatusCounts(state.products);
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.products = state.products.filter((p) => p.id !== deletedId);
        state.selectedIds = state.selectedIds.filter((id) => id !== deletedId);
        state.totalProducts = Math.max(0, state.totalProducts - 1);
        state.statusCounts = computeStatusCounts(state.products);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Bulk Action
      .addCase(executeBulkAction.fulfilled, (state, action) => {
        const { action: bulkAct, productIds } = action.payload;
        if (bulkAct === "activate" || bulkAct === "approve") {
          state.products = state.products.map((p) =>
            productIds.includes(p.id)
              ? { ...p, is_active: true, status: "ACTIVE", reject_reason: undefined }
              : p
          );
        } else if (bulkAct === "deactivate") {
          state.products = state.products.map((p) =>
            productIds.includes(p.id)
              ? { ...p, is_active: false, status: "INACTIVE" }
              : p
          );
        } else if (bulkAct === "delete") {
          state.products = state.products.filter(
            (p) => !productIds.includes(p.id)
          );
          state.selectedIds = [];
          state.totalProducts = Math.max(0, state.totalProducts - productIds.length);
        }
        state.statusCounts = computeStatusCounts(state.products);
      })
      .addCase(executeBulkAction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setStatusTab,
  setSearchQuery,
  setCategoryFilter,
  setStockStatusFilter,
  setVendorFilter,
  setSortBy,
  clearAllFilters,
  toggleSelectProduct,
  selectAllProducts,
  setCurrentPage,
  clearAdminProductError,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
