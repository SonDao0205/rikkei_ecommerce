import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  shopProductApi,
  initialShopProducts,
  initialShopProductStats,
} from "../../../api/shop/shopProductApi";
import type {
  ShopProductItem,
  ShopProductStats,
  ShopProductFilterState,
  ShopProductStatusTab,
  ShopProductPriceRange,
  ShopProductStockFilter,
} from "../../../types/shop/shopProduct.types";

interface ShopProductState {
  items: ShopProductItem[];
  total: number;
  stats: ShopProductStats;
  filters: ShopProductFilterState;
  selectedIds: string[];
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  editingProduct: ShopProductItem | null;
}

const initialFilters: ShopProductFilterState = {
  statusTab: "all",
  searchQuery: "",
  category: "all",
  priceRange: "all",
  stockLevel: "all",
  currentPage: 1,
  pageSize: 20,
};

const initialState: ShopProductState = {
  items: initialShopProducts,
  total: initialShopProducts.length,
  stats: initialShopProductStats,
  filters: initialFilters,
  selectedIds: [],
  isLoading: false,
  error: null,
  isModalOpen: false,
  editingProduct: null,
};

export const fetchShopProductList = createAsyncThunk<
  { items: ShopProductItem[]; total: number; stats: ShopProductStats },
  void,
  { rejectValue: string }
>("shopProduct/fetchShopProductList", async (_, { getState, rejectWithValue }) => {
  try {
    const { filters } = (getState() as { shopProduct: ShopProductState }).shopProduct;
    const [productsRes, statsRes] = await Promise.all([
      shopProductApi.fetchProducts(filters),
      shopProductApi.fetchStats(),
    ]);
    return {
      items: productsRes.items,
      total: productsRes.total,
      stats: statsRes,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tải danh sách sản phẩm";
    return rejectWithValue(errorMsg);
  }
});

export const removeShopProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("shopProduct/removeShopProduct", async (id, { rejectWithValue }) => {
  try {
    await shopProductApi.deleteProduct(id);
    return id;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xoá sản phẩm";
    return rejectWithValue(errorMsg);
  }
});

export const saveShopProductItem = createAsyncThunk<
  ShopProductItem,
  Partial<ShopProductItem>,
  { rejectValue: string }
>("shopProduct/saveShopProductItem", async (product, { rejectWithValue }) => {
  try {
    const result = await shopProductApi.saveProduct(product);
    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi lưu sản phẩm";
    return rejectWithValue(errorMsg);
  }
});

export const shopProductSlice = createSlice({
  name: "shopProduct",
  initialState,
  reducers: {
    setStatusTab: (state, action: PayloadAction<ShopProductStatusTab>) => {
      state.filters.statusTab = action.payload;
      state.filters.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      state.filters.currentPage = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.filters.currentPage = 1;
    },
    setPriceRange: (state, action: PayloadAction<ShopProductPriceRange>) => {
      state.filters.priceRange = action.payload;
      state.filters.currentPage = 1;
    },
    setStockLevel: (state, action: PayloadAction<ShopProductStockFilter>) => {
      state.filters.stockLevel = action.payload;
      state.filters.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload;
      state.filters.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
    },
    toggleSelectProduct: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllProducts: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedIds = state.items.map((i) => i.id);
      } else {
        state.selectedIds = [];
      }
    },
    openCreateModal: (state) => {
      state.editingProduct = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action: PayloadAction<ShopProductItem>) => {
      state.editingProduct = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchShopProductList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShopProductList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.stats = action.payload.stats;
      })
      .addCase(fetchShopProductList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Lỗi tải sản phẩm";
      })
      // Remove product
      .addCase(removeShopProduct.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((i) => i.id !== id);
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
        state.total = state.items.length;
      })
      // Save product
      .addCase(saveShopProductItem.fulfilled, (state, action) => {
        const saved = action.payload;
        const index = state.items.findIndex((i) => i.id === saved.id);
        if (index >= 0) {
          state.items[index] = saved;
        } else {
          state.items.unshift(saved);
        }
        state.isModalOpen = false;
        state.editingProduct = null;
        state.total = state.items.length;
      });
  },
});

export const {
  setStatusTab,
  setSearchQuery,
  setCategory,
  setPriceRange,
  setStockLevel,
  setCurrentPage,
  setPageSize,
  resetFilters,
  toggleSelectProduct,
  selectAllProducts,
  openCreateModal,
  openEditModal,
  closeModal,
} = shopProductSlice.actions;

export default shopProductSlice.reducer;

