import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { cartApi } from "@/domains/customer/api/cartApi";
import type { CartResponse } from "@/domains/customer/types/cart.types";

interface CartState extends CartResponse {
  loading: boolean;
  updating: boolean;
  error: string | null;
  fetchRequestId: string | null;
  mutationRequestId: string | null;
}

const emptyCart: CartResponse = {
  items: [],
  line_count: 0,
  item_count: 0,
  available_item_count: 0,
  subtotal: 0,
};

const initialState: CartState = { ...emptyCart, loading: false, updating: false, error: null, fetchRequestId: null, mutationRequestId: null };
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const fetchCart = createAsyncThunk<CartResponse, void, { rejectValue: string; state: { cart: CartState } }>(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try { return await cartApi.getCart(); }
    catch (error) { return rejectWithValue(errorMessage(error, "Không thể tải giỏ hàng.")); }
  },
);

export const addCartItem = createAsyncThunk<CartResponse, { variantId: number; quantity: number }, { rejectValue: string; state: { cart: CartState } }>(
  "cart/addItem",
  async (payload, { rejectWithValue }) => {
    try { return await cartApi.addItem(payload.variantId, payload.quantity); }
    catch (error) { return rejectWithValue(errorMessage(error, "Không thể thêm sản phẩm vào giỏ.")); }
  },
  { condition: (_, { getState }) => !getState().cart.updating },
);

export const updateCartItem = createAsyncThunk<CartResponse, { itemId: number; quantity: number }, { rejectValue: string; state: { cart: CartState } }>(
  "cart/updateItem",
  async (payload, { rejectWithValue }) => {
    try { return await cartApi.updateQuantity(payload.itemId, payload.quantity); }
    catch (error) { return rejectWithValue(errorMessage(error, "Không thể cập nhật số lượng.")); }
  },
  { condition: (_, { getState }) => !getState().cart.updating },
);

export const removeCartItem = createAsyncThunk<CartResponse, number, { rejectValue: string; state: { cart: CartState } }>(
  "cart/removeItem",
  async (id, { rejectWithValue }) => {
    try { return await cartApi.removeItem(id); }
    catch (error) { return rejectWithValue(errorMessage(error, "Không thể xóa sản phẩm.")); }
  },
  { condition: (_, { getState }) => !getState().cart.updating },
);

export const clearCart = createAsyncThunk<CartResponse, void, { rejectValue: string; state: { cart: CartState } }>(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try { return await cartApi.clearCart(); }
    catch (error) { return rejectWithValue(errorMessage(error, "Không thể làm trống giỏ hàng.")); }
  },
  { condition: (_, { getState }) => !getState().cart.updating },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
    clearCartError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state, action) => { state.loading = true; state.error = null; state.fetchRequestId = action.meta.requestId; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        Object.assign(state, action.payload, { loading: false, fetchRequestId: null });
      })
      .addCase(fetchCart.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.loading = false; state.fetchRequestId = null; state.error = action.payload ?? "Không thể tải giỏ hàng.";
      })
      .addCase(addCartItem.pending, (state, action) => { state.updating = true; state.error = null; state.mutationRequestId = action.meta.requestId; })
      .addCase(addCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        Object.assign(state, action.payload, { updating: false, mutationRequestId: null });
      })
      .addCase(addCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false; state.mutationRequestId = null; state.error = action.payload ?? "Không thể thêm sản phẩm vào giỏ.";
      })
      .addCase(updateCartItem.pending, (state, action) => { state.updating = true; state.error = null; state.mutationRequestId = action.meta.requestId; })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        Object.assign(state, action.payload, { updating: false, mutationRequestId: null });
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false; state.mutationRequestId = null; state.error = action.payload ?? "Không thể cập nhật số lượng.";
      })
      .addCase(removeCartItem.pending, (state, action) => { state.updating = true; state.error = null; state.mutationRequestId = action.meta.requestId; })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        Object.assign(state, action.payload, { updating: false, mutationRequestId: null });
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false; state.mutationRequestId = null; state.error = action.payload ?? "Không thể xóa sản phẩm.";
      })
      .addCase(clearCart.pending, (state, action) => { state.updating = true; state.error = null; state.mutationRequestId = action.meta.requestId; })
      .addCase(clearCart.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        Object.assign(state, action.payload, { updating: false, mutationRequestId: null });
      })
      .addCase(clearCart.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false; state.mutationRequestId = null; state.error = action.payload ?? "Không thể làm trống giỏ hàng.";
      });
  },
});

export const { resetCart, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
