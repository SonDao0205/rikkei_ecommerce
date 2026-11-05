import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  WishlistState,
  WishlistItem,
  WishlistFilterType,
  WishlistSortType,
} from "../../../types/wishlist/wishlist.types";
import { wishlistApi } from "../../../api/wishlist/wishlistApi";

const initialState: WishlistState = {
  items: [],
  recommendations: [],
  filter: "all",
  sortBy: "recent",
  searchQuery: "",
  isLoading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    const res = await wishlistApi.getWishlist();
    return res;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (id: number) => {
    const updated = await wishlistApi.removeItem(id);
    return updated;
  }
);

export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async () => {
    const updated = await wishlistApi.clearAll();
    return updated;
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (item: Omit<WishlistItem, "id" | "added_at">) => {
    const updated = await wishlistApi.addItem(item);
    return updated;
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
  },
  extraReducers: (builder) => {
    // fetchWishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.recommendations = action.payload.recommendations;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Không thể tải danh sách yêu thích";
      });

    // removeFromWishlist
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // clearWishlist
    builder.addCase(clearWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });

    // addToWishlist
    builder.addCase(addToWishlist.fulfilled, (state, action) => {
      state.items = action.payload;
    });
  },
});

export const {
  setWishlistFilter,
  setWishlistSort,
  setWishlistSearchQuery,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

