import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { productApi } from "../../../api/product/productApi";
import type {
  AdminProductItem,
  InventoryStats,
  AdminProductQueryParams,
  AdminProductSortOption,
  AdminStockStatus,
} from "../../../types";

interface AdminProductState {
  products: AdminProductItem[];
  stats: InventoryStats | null;
  totalProducts: number;
  loading: boolean;
  error: string | null;

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
      // Cập nhật lại số liệu thống kê kho hàng
      dispatch(getInventoryStats());
      return result;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to toggle status");
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
    payload: { action: "activate" | "deactivate" | "delete"; productIds: number[] },
    { dispatch, rejectWithValue }
  ) => {
    try {
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
        state.products = action.payload.products;
        state.totalProducts = action.payload.total;
        state.selectedIds = state.selectedIds.filter((id) =>
          action.payload.products.some((p) => p.id === id)
        );
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Status
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const { id, is_active, status } = action.payload;
        const index = state.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.products[index].is_active = is_active;
          state.products[index].status = status as "ACTIVE" | "INACTIVE";
        }
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
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Bulk Action
      .addCase(executeBulkAction.fulfilled, (state, action) => {
        const { action: bulkAct, productIds } = action.payload;
        if (bulkAct === "activate") {
          state.products = state.products.map((p) =>
            productIds.includes(p.id)
              ? { ...p, is_active: true, status: "ACTIVE" }
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
      })
      .addCase(executeBulkAction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
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
