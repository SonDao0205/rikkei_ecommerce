import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  WishlistState,
  WishlistFilterType,
  WishlistSortType,
} from "../../../types/wishlist/wishlist.types";
import { wishlistApi } from "../../../api/wishlist/wishlistApi";
import type { RootState } from "../../store";

const initialState: WishlistState = {
  items: [],
  recommendations: [],
  filter: "all",
  sortBy: "recent",
  searchQuery: "",
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.getWishlist();
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải danh sách yêu thích";
      return rejectWithValue(message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (
    payload: number | { product_id: number; [key: string]: any },
    { rejectWithValue }
  ) => {
    try {
      const productId = typeof payload === "number" ? payload : payload.product_id;
      await wishlistApi.addItem(productId);
      // Refresh the wishlist to get the latest product details from server
      const refreshed = await wishlistApi.getWishlist();
      return refreshed;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Thêm vào danh sách yêu thích thất bại";
      return rejectWithValue(message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistApi.removeItem(productId);
      return productId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xóa khỏi danh sách yêu thích thất bại";
      return rejectWithValue(message);
    }
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as RootState).wishlist;
      const ids = state.items.map((it) => it.product_id);
      await wishlistApi.clearAll(ids);
      return [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xóa toàn bộ danh sách thất bại";
      return rejectWithValue(message);
    }
  }
);

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistFilter(state, action: PayloadAction<WishlistFilterType>) {
      state.filter = action.payload;
    },
    setWishlistSort(state, action: PayloadAction<WishlistSortType>) {
      state.sortBy = action.payload;
    },
    setWishlistSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetWishlist(state) {
      state.items = [];
      state.recommendations = [];
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Tự động dọn sạch wishlist khi logout hoặc hết phiên
    builder.addCase("auth/logoutUser/fulfilled", (state) => {
      state.items = [];
      state.recommendations = [];
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
    });
    builder.addCase("auth/sessionExpired", (state) => {
      state.items = [];
      state.recommendations = [];
      state.isLoading = false;
      state.isInitialized = false;
      state.error = null;
    });

    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.items = action.payload.items;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = (action.payload as string) || "Không thể tải danh sách yêu thích";
      });

    // addToWishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = (action.payload as string) || "Thêm vào danh sách yêu thích thất bại";
      });

    // removeFromWishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(
          (it) => it.product_id !== action.payload && it.id !== action.payload
        );
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = (action.payload as string) || "Xóa khỏi danh sách yêu thích thất bại";
      });

    // clearWishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.error = (action.payload as string) || "Xóa toàn bộ danh sách thất bại";
      });
  },
});

export const {
  setWishlistFilter,
  setWishlistSort,
  setWishlistSearchQuery,
  resetWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
