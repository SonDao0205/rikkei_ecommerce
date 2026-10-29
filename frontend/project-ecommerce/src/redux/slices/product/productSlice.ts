import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { productApi } from "../../../api/product/productApi";
import type { Category, ProductItem } from "../../../types/ecommerce";

interface ProductState {
  categories: Category[];
  flashSaleProducts: ProductItem[];
  catalogProducts: ProductItem[];
  totalCatalogProducts: number;
  selectedCategoryId: number;
  sortBy: string;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  categories: [],
  flashSaleProducts: [],
  catalogProducts: [],
  totalCatalogProducts: 0,
  selectedCategoryId: 0,
  sortBy: "Best Selling",
  loading: false,
  error: null,
};

export const getCategories = createAsyncThunk(
  "products/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await productApi.fetchCategories();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load categories");
    }
  }
);

export const getFlashSaleProducts = createAsyncThunk(
  "products/getFlashSaleProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productApi.fetchFlashSaleProducts();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load flash sale products");
    }
  }
);

export const getCatalogProducts = createAsyncThunk(
  "products/getCatalogProducts",
  async (
    params: { categoryId?: number; sort?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await productApi.fetchCatalogProducts(params);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load catalog products");
    }
  }
);

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<number>) => {
      state.selectedCategoryId = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Flash Sale
      .addCase(getFlashSaleProducts.fulfilled, (state, action) => {
        state.flashSaleProducts = action.payload;
      })
      // Catalog
      .addCase(getCatalogProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCatalogProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.catalogProducts = action.payload.products;
        state.totalCatalogProducts = action.payload.total;
      })
      .addCase(getCatalogProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, setSortBy } = productSlice.actions;
export default productSlice.reducer;
