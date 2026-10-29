import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { productApi } from "../../../api/product/productApi";
import type { AdminProductItem, InventoryStats } from "../../../types/ecommerce";

interface AdminProductState {
  products: AdminProductItem[];
  stats: InventoryStats | null;
  totalProducts: number;
  loading: boolean;
  error: string | null;

  // Filters & Controls
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: string;
  vendorFilter: string;
  sortBy: string;

  // Row selection for bulk actions
  selectedIds: number[];

  // Pagination
  currentPage: number;
  pageSize: number;
}

const initialState: AdminProductState = {
  products: [],
  stats: null,
  totalProducts: 124,
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
    params: {
      search?: string;
      category?: string;
      stockStatus?: string;
      vendor?: string;
      sortBy?: string;
    } | undefined,
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
  async (productId: number, { rejectWithValue }) => {
    try {
      return await productApi.toggleAdminProductStatus(productId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to toggle status");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (productId: number, { rejectWithValue }) => {
    try {
      await productApi.deleteAdminProduct(productId);
      return productId;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to delete product");
    }
  }
);

export const executeBulkAction = createAsyncThunk(
  "adminProducts/executeBulkAction",
  async (
    payload: { action: string; productIds: number[] },
    { rejectWithValue }
  ) => {
    try {
      return await productApi.bulkAdminAction(payload.action, payload.productIds);
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
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    setStockStatusFilter: (state, action: PayloadAction<string>) => {
      state.stockStatusFilter = action.payload;
    },
    setVendorFilter: (state, action: PayloadAction<string>) => {
      state.vendorFilter = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    clearAllFilters: (state) => {
      state.searchQuery = "";
      state.categoryFilter = "";
      state.stockStatusFilter = "";
      state.vendorFilter = "";
      state.sortBy = "newest";
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
      })
      .addCase(getAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.total;
      })
      .addCase(getAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Toggle Status
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.products.findIndex((p) => p.id === updated.id);
        if (index !== -1) {
          state.products[index] = updated;
        }
      })
      // Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.products = state.products.filter((p) => p.id !== deletedId);
        state.selectedIds = state.selectedIds.filter((id) => id !== deletedId);
      })
      // Bulk Action
      .addCase(executeBulkAction.fulfilled, (state, action) => {
        const { action: bulkAct } = action.payload;
        if (bulkAct === "activate") {
          state.products = state.products.map((p) =>
            state.selectedIds.includes(p.id)
              ? { ...p, is_active: true, status: "ACTIVE" }
              : p
          );
        } else if (bulkAct === "deactivate") {
          state.products = state.products.map((p) =>
            state.selectedIds.includes(p.id)
              ? { ...p, is_active: false, status: "INACTIVE" }
              : p
          );
        } else if (bulkAct === "delete") {
          state.products = state.products.filter(
            (p) => !state.selectedIds.includes(p.id)
          );
          state.selectedIds = [];
        }
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
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
