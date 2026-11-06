import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { wishlistApi, INITIAL_RECOMMENDATIONS } from "@/domains/customer/api/wishlistApi";
import type {
  WishlistResponse,
  WishlistState,
  WishlistFilterType,
  WishlistSortType,
} from "@/domains/customer/types/wishlist.types";

const initialState: WishlistState = {
  items: [],
  total: 0,
  recommendations: INITIAL_RECOMMENDATIONS,
  filter: "all",
  sortBy: "recent",
  searchQuery: "",
  loading: false,
  isLoading: false,
  isInitialized: false,
  mutatingIds: [],
  error: null,
  fetchRequestId: null,
  mutationRequestIds: {},
};

const errorMessage = (error: unknown, fallback: string = "Không thể cập nhật danh sách yêu thích.") =>
  error instanceof Error ? error.message : fallback;

export const fetchWishlist = createAsyncThunk<
  WishlistResponse,
  void,
  { rejectValue: string; state: { wishlist: WishlistState } }
>("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    return await wishlistApi.getWishlist();
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Không thể tải danh sách yêu thích."));
  }
});

export const addToWishlist = createAsyncThunk<
  WishlistResponse,
  number | { product_id: number; [key: string]: unknown },
  { rejectValue: string }
>("wishlist/addToWishlist", async (payload, { rejectWithValue }) => {
  try {
    const productId = typeof payload === "number" ? payload : payload.product_id;
    await wishlistApi.addItem(productId);
    return await wishlistApi.getWishlist();
  } catch (err: unknown) {
    return rejectWithValue(errorMessage(err, "Thêm vào danh sách yêu thích thất bại"));
  }
});

export const removeFromWishlist = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("wishlist/removeFromWishlist", async (productId, { rejectWithValue }) => {
  try {
    await wishlistApi.removeItem(productId);
    return productId;
  } catch (err: unknown) {
    return rejectWithValue(errorMessage(err, "Xóa khỏi danh sách yêu thích thất bại"));
  }
});

export const toggleWishlistItem = createAsyncThunk<
  WishlistResponse,
  number,
  { rejectValue: string; state: { wishlist: WishlistState } }
>(
  "wishlist/toggle",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const exists = getState().wishlist.items.some((item) => item.product_id === productId);
      if (exists) {
        await wishlistApi.removeItem(productId);
      } else {
        await wishlistApi.addItem(productId);
      }
      return await wishlistApi.getWishlist();
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
  { condition: (productId, { getState }) => !getState().wishlist.mutatingIds.includes(productId) }
);

export const clearWishlist = createAsyncThunk<
  void,
  void,
  { rejectValue: string; state: { wishlist: WishlistState } }
>("wishlist/clearWishlist", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().wishlist;
    const ids = state.items.map((it) => it.product_id);
    await wishlistApi.clearAll(ids);
  } catch (err: unknown) {
    return rejectWithValue(errorMessage(err, "Xóa toàn bộ danh sách thất bại"));
  }
});

const wishlistSlice = createSlice({
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
    resetWishlist: () => initialState,
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Auth session reset
    builder.addCase("auth/logoutUser/fulfilled", () => initialState);
    builder.addCase("auth/sessionExpired", () => initialState);

    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state, action) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
        state.fetchRequestId = action.meta.requestId;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.items = action.payload.items ?? [];
        state.total = action.payload.total ?? state.items.length;
        if (action.payload.recommendations) {
          state.recommendations = action.payload.recommendations;
        }
        state.loading = false;
        state.isLoading = false;
        state.isInitialized = true;
        state.fetchRequestId = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.isLoading = false;
        state.isInitialized = true;
        state.fetchRequestId = null;
        state.error = action.payload ?? "Không thể tải danh sách yêu thích.";
      });

    // addToWishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload.items ?? [];
        state.total = action.payload.total ?? state.items.length;
        if (action.payload.recommendations) {
          state.recommendations = action.payload.recommendations;
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload ?? "Thêm vào danh sách yêu thích thất bại";
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
        state.total = state.items.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload ?? "Xóa khỏi danh sách yêu thích thất bại";
      });

    // toggleWishlistItem
    builder
      .addCase(toggleWishlistItem.pending, (state, action) => {
        state.mutatingIds.push(action.meta.arg);
        state.mutationRequestIds[action.meta.arg] = action.meta.requestId;
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        if (state.mutationRequestIds[action.meta.arg] !== action.meta.requestId) return;
        state.items = action.payload.items ?? [];
        state.total = action.payload.total ?? state.items.length;
        if (action.payload.recommendations) {
          state.recommendations = action.payload.recommendations;
        }
        state.mutatingIds = state.mutatingIds.filter((id) => id !== action.meta.arg);
        delete state.mutationRequestIds[action.meta.arg];
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        if (state.mutationRequestIds[action.meta.arg] !== action.meta.requestId) return;
        state.mutatingIds = state.mutatingIds.filter((id) => id !== action.meta.arg);
        delete state.mutationRequestIds[action.meta.arg];
        state.error = action.payload ?? "Không thể cập nhật danh sách yêu thích.";
      });

    // clearWishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.error = action.payload ?? "Xóa toàn bộ danh sách thất bại";
      });
  },
});

export const {
  setWishlistFilter,
  setWishlistSort,
  setWishlistSearchQuery,
  resetWishlist,
  clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
