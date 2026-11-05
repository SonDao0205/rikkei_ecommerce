import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { wishlistApi } from "@/domains/customer/api/wishlistApi";
import type { WishlistItem, WishlistResponse } from "@/domains/customer/types/cart.types";

interface WishlistState {
  items: WishlistItem[];
  total: number;
  loading: boolean;
  mutatingIds: number[];
  error: string | null;
  fetchRequestId: string | null;
  mutationRequestIds: Record<number, string>;
}

const initialState: WishlistState = { items: [], total: 0, loading: false, mutatingIds: [], error: null, fetchRequestId: null, mutationRequestIds: {} };
const message = (error: unknown) => error instanceof Error ? error.message : "Không thể cập nhật danh sách yêu thích.";

export const fetchWishlist = createAsyncThunk<WishlistResponse, void, { rejectValue: string; state: { wishlist: WishlistState } }>(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try { return await wishlistApi.getWishlist(); }
    catch (error) { return rejectWithValue(message(error)); }
  },
);

export const toggleWishlistItem = createAsyncThunk<WishlistResponse, number, { rejectValue: string; state: { wishlist: WishlistState }; }>(
  "wishlist/toggle",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const exists = getState().wishlist.items.some((item) => item.product_id === productId);
      if (exists) await wishlistApi.removeItem(productId);
      else await wishlistApi.addItem(productId);
      return await wishlistApi.getWishlist();
    } catch (error) { return rejectWithValue(message(error)); }
  },
  { condition: (productId, { getState }) => !getState().wishlist.mutatingIds.includes(productId) },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlist: () => initialState,
    clearWishlistError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state, action) => { state.loading = true; state.error = null; state.fetchRequestId = action.meta.requestId; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.items = action.payload.items ?? []; state.total = action.payload.total ?? state.items.length; state.loading = false; state.fetchRequestId = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.loading = false; state.fetchRequestId = null; state.error = action.payload ?? "Không thể tải danh sách yêu thích.";
      })
      .addCase(toggleWishlistItem.pending, (state, action) => { state.mutatingIds.push(action.meta.arg); state.mutationRequestIds[action.meta.arg] = action.meta.requestId; state.error = null; })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        if (state.mutationRequestIds[action.meta.arg] !== action.meta.requestId) return;
        state.items = action.payload.items ?? []; state.total = action.payload.total ?? state.items.length; state.mutatingIds = state.mutatingIds.filter((id) => id !== action.meta.arg); delete state.mutationRequestIds[action.meta.arg];
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        if (state.mutationRequestIds[action.meta.arg] !== action.meta.requestId) return;
        state.mutatingIds = state.mutatingIds.filter((id) => id !== action.meta.arg); delete state.mutationRequestIds[action.meta.arg]; state.error = action.payload ?? "Không thể cập nhật danh sách yêu thích.";
      });
  },
});

export const { resetWishlist, clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
