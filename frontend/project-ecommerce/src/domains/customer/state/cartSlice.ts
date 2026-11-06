import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CartItem,
  CartSummary,
  PlatformVoucher,
  ShopVoucher,
  CartResponse,
} from "@/domains/customer/types/cart.types";
import {
  cartApi,
  mapBackendCartResponse,
  INITIAL_PLATFORM_VOUCHER,
  INITIAL_SHOP_VOUCHERS,
} from "@/domains/customer/api/cartApi";

const FREE_SHIPPING_THRESHOLD = 500000;
const BASE_SHIPPING_FEE = 35000;

export function computeCartSummary(
  items: CartItem[],
  platformVoucher: PlatformVoucher | null,
  shopVouchers: Record<number, ShopVoucher>,
  threshold: number = FREE_SHIPPING_THRESHOLD
): CartSummary {
  // Only available and selected items count towards subtotal & checkout
  const selectedItems = items.filter((it) => it.selected && it.is_available !== false);
  const selectedCount = selectedItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);

  const itemsSubtotal = selectedItems.reduce(
    (acc, it) => acc + (it.price ?? it.unit_price ?? 0) * it.quantity,
    0
  );

  const originalSubtotal = selectedItems.reduce(
    (acc, it) => acc + (it.original_price ?? it.price ?? it.unit_price ?? 0) * it.quantity,
    0
  );

  const estimatedShipping = selectedCount > 0 ? BASE_SHIPPING_FEE : 0;
  const isFreeShipping = itemsSubtotal >= threshold && selectedCount > 0;
  const shippingDiscount = isFreeShipping ? estimatedShipping : 0;

  // Shop vouchers discount calculation
  let storeVouchersDiscount = 0;
  const selectedShopIds = new Set(selectedItems.map((it) => it.shop_id));
  for (const shopId of selectedShopIds) {
    const voucher = shopVouchers[shopId];
    if (voucher && voucher.is_applied) {
      const shopItemsSubtotal = selectedItems
        .filter((it) => it.shop_id === shopId)
        .reduce((sum, it) => sum + (it.price ?? it.unit_price ?? 0) * it.quantity, 0);
      if (shopItemsSubtotal >= voucher.min_order_amount) {
        storeVouchersDiscount += voucher.discount_amount;
      }
    }
  }

  // Platform voucher discount calculation
  let platformVoucherDiscount = 0;
  if (
    platformVoucher &&
    platformVoucher.is_applied &&
    itemsSubtotal >= platformVoucher.min_order_amount
  ) {
    platformVoucherDiscount = platformVoucher.discount_amount;
  }

  const grandTotal = Math.max(
    0,
    itemsSubtotal +
      estimatedShipping -
      shippingDiscount -
      storeVouchersDiscount -
      platformVoucherDiscount
  );

  const priceDropSavings = Math.max(0, originalSubtotal - itemsSubtotal);
  const totalSavings =
    priceDropSavings +
    shippingDiscount +
    storeVouchersDiscount +
    platformVoucherDiscount;

  const progress = Math.min(100, Math.round((itemsSubtotal / threshold) * 100));
  const amountLeft = Math.max(0, threshold - itemsSubtotal);

  return {
    total_items: totalItems,
    selected_count: selectedCount,
    items_subtotal: itemsSubtotal,
    estimated_shipping: estimatedShipping,
    shipping_discount: shippingDiscount,
    store_vouchers_discount: storeVouchersDiscount,
    platform_voucher_discount: platformVoucherDiscount,
    grand_total: grandTotal,
    total_savings: totalSavings,
    free_shipping_threshold: threshold,
    free_shipping_progress: progress,
    amount_left_for_free_shipping: amountLeft,
    is_free_shipping_eligible: isFreeShipping,
  };
}

export interface CartState {
  items: CartItem[];
  line_count: number;
  item_count: number;
  available_item_count: number;
  subtotal: number;
  platformVoucher: PlatformVoucher | null;
  shopVouchers: Record<number, ShopVoucher>;
  freeShippingThreshold: number;
  summary: CartSummary;
  loading: boolean;
  updating: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  isInitialized: boolean;
  error: string | null;
  fetchRequestId: string | null;
  mutationRequestId: string | null;
}

const emptySummary: CartSummary = {
  total_items: 0,
  selected_count: 0,
  items_subtotal: 0,
  estimated_shipping: 0,
  shipping_discount: 0,
  store_vouchers_discount: 0,
  platform_voucher_discount: 0,
  grand_total: 0,
  total_savings: 0,
  free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
  free_shipping_progress: 0,
  amount_left_for_free_shipping: FREE_SHIPPING_THRESHOLD,
  is_free_shipping_eligible: false,
};

const initialState: CartState = {
  items: [],
  line_count: 0,
  item_count: 0,
  available_item_count: 0,
  subtotal: 0,
  platformVoucher: INITIAL_PLATFORM_VOUCHER,
  shopVouchers: INITIAL_SHOP_VOUCHERS,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  summary: emptySummary,
  loading: false,
  updating: false,
  isLoading: false,
  isUpdating: false,
  isInitialized: false,
  error: null,
  fetchRequestId: null,
  mutationRequestId: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const fetchCart = createAsyncThunk<
  CartResponse,
  void,
  { rejectValue: string; state: { cart: CartState } }
>("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    return await cartApi.getCart();
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Không thể tải giỏ hàng."));
  }
});

export const addCartItem = createAsyncThunk<
  CartResponse,
  { variantId: number; quantity?: number },
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/addItem",
  async (payload, { rejectWithValue }) => {
    try {
      return await cartApi.addItem(payload.variantId, payload.quantity ?? 1);
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Không thể thêm sản phẩm vào giỏ."));
    }
  },
  { condition: (_, { getState }) => !getState().cart.updating && !getState().cart.isUpdating }
);

export const addToCart = addCartItem;

export const updateCartItem = createAsyncThunk<
  CartResponse,
  { itemId: number; quantity: number },
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/updateItem",
  async (payload, { rejectWithValue }) => {
    try {
      return await cartApi.updateQuantity(payload.itemId, payload.quantity);
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Không thể cập nhật số lượng."));
    }
  },
  { condition: (_, { getState }) => !getState().cart.updating && !getState().cart.isUpdating }
);

export const updateItemQuantity = updateCartItem;

export const removeCartItem = createAsyncThunk<
  CartResponse,
  number,
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/removeItem",
  async (id, { rejectWithValue }) => {
    try {
      return await cartApi.removeItem(id);
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Không thể xóa sản phẩm."));
    }
  },
  { condition: (_, { getState }) => !getState().cart.updating && !getState().cart.isUpdating }
);

export const removeItem = removeCartItem;

export const clearCart = createAsyncThunk<
  CartResponse,
  void,
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      return await cartApi.clearCart();
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Không thể làm trống giỏ hàng."));
    }
  },
  { condition: (_, { getState }) => !getState().cart.updating && !getState().cart.isUpdating }
);

export const clearCartAction = clearCart;

export const removeSelectedItemsAction = createAsyncThunk<
  CartResponse | null,
  void,
  { rejectValue: string; state: { cart: CartState } }
>(
  "cart/removeSelectedItems",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().cart;
      const selected = state.items.filter((it) => it.selected);
      if (selected.length === 0) {
        return null;
      }
      if (selected.length === state.items.length) {
        return await cartApi.clearCart();
      }
      let latestRes: CartResponse | null = null;
      for (const item of selected) {
        latestRes = await cartApi.removeItem(item.id);
      }
      return latestRes;
    } catch (err: unknown) {
      return rejectWithValue(errorMessage(err, "Xóa các sản phẩm đã chọn thất bại"));
    }
  },
  { condition: (_, { getState }) => !getState().cart.updating && !getState().cart.isUpdating }
);

export const applyPlatformVoucherAction = createAsyncThunk<
  PlatformVoucher,
  string,
  { rejectValue: string }
>("cart/applyPlatformVoucher", async (code: string, { rejectWithValue }) => {
  try {
    return await cartApi.applyPlatformVoucher(code);
  } catch (err: unknown) {
    return rejectWithValue(errorMessage(err, "Mã voucher không hợp lệ"));
  }
});

export const applyShopVoucherAction = createAsyncThunk<
  { shopId: number; voucher: ShopVoucher | null },
  { shopId: number; code: string },
  { rejectValue: string }
>(
  "cart/applyShopVoucher",
  async ({ shopId, code }: { shopId: number; code: string }, { rejectWithValue }) => {
    try {
      const voucher = await cartApi.applyShopVoucher(shopId, code);
      return { shopId, voucher };
    } catch (err: unknown) {
      return rejectWithValue(errorMessage(err, "Mã shop voucher không hợp lệ"));
    }
  }
);

const handleBackendSuccess = (
  state: CartState,
  action: PayloadAction<CartResponse | null>
) => {
  state.loading = false;
  state.updating = false;
  state.isLoading = false;
  state.isUpdating = false;
  state.isInitialized = true;
  state.error = null;
  state.fetchRequestId = null;
  state.mutationRequestId = null;

  if (action.payload) {
    state.items = mapBackendCartResponse(action.payload, state.items);
    state.line_count = action.payload.line_count ?? state.items.length;
    state.item_count =
      action.payload.item_count ?? state.items.reduce((sum, it) => sum + it.quantity, 0);
    state.available_item_count =
      action.payload.available_item_count ??
      state.items.filter((it) => it.is_available).length;
    state.subtotal =
      action.payload.subtotal ??
      state.items.reduce((sum, it) => sum + (it.unit_price ?? it.price ?? 0) * it.quantity, 0);

    state.summary = computeCartSummary(
      state.items,
      state.platformVoucher,
      state.shopVouchers,
      state.freeShippingThreshold
    );
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    toggleItemSelection(state, action: PayloadAction<number>) {
      const itemId = action.payload;
      const target = state.items.find((it) => it.id === itemId);
      if (target && target.is_available !== false) {
        target.selected = !target.selected;
        state.summary = computeCartSummary(
          state.items,
          state.platformVoucher,
          state.shopVouchers,
          state.freeShippingThreshold
        );
      }
    },
    toggleShopSelection(
      state,
      action: PayloadAction<{ shopId: number; selected: boolean }>
    ) {
      const { shopId, selected } = action.payload;
      state.items.forEach((it) => {
        if (it.shop_id === shopId && it.is_available !== false) {
          it.selected = selected;
        }
      });
      state.summary = computeCartSummary(
        state.items,
        state.platformVoucher,
        state.shopVouchers,
        state.freeShippingThreshold
      );
    },
    toggleAllSelection(state, action: PayloadAction<boolean>) {
      const selected = action.payload;
      state.items.forEach((it) => {
        if (it.is_available !== false) {
          it.selected = selected;
        }
      });
      state.summary = computeCartSummary(
        state.items,
        state.platformVoucher,
        state.shopVouchers,
        state.freeShippingThreshold
      );
    },
    removePlatformVoucher(state) {
      state.platformVoucher = null;
      state.summary = computeCartSummary(
        state.items,
        state.platformVoucher,
        state.shopVouchers,
        state.freeShippingThreshold
      );
    },
    removeShopVoucher(state, action: PayloadAction<number>) {
      delete state.shopVouchers[action.payload];
      state.summary = computeCartSummary(
        state.items,
        state.platformVoucher,
        state.shopVouchers,
        state.freeShippingThreshold
      );
    },
    resetCart: () => initialState,
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Session resets
    builder.addCase("auth/logoutUser/fulfilled", () => initialState);
    builder.addCase("auth/sessionExpired", () => initialState);

    // fetchCart
    builder
      .addCase(fetchCart.pending, (state, action) => {
        state.loading = true;
        state.isLoading = true;
        state.error = null;
        state.fetchRequestId = action.meta.requestId;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        handleBackendSuccess(state, action);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        if (state.fetchRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.isLoading = false;
        state.isInitialized = true;
        state.fetchRequestId = null;
        state.error = action.payload ?? "Không thể tải giỏ hàng.";
      });

    // addCartItem / addToCart
    builder
      .addCase(addCartItem.pending, (state, action) => {
        state.updating = true;
        state.isUpdating = true;
        state.error = null;
        state.mutationRequestId = action.meta.requestId;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        handleBackendSuccess(state, action);
      })
      .addCase(addCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false;
        state.isUpdating = false;
        state.mutationRequestId = null;
        state.error = action.payload ?? "Không thể thêm sản phẩm vào giỏ.";
      });

    // updateCartItem / updateItemQuantity
    builder
      .addCase(updateCartItem.pending, (state, action) => {
        state.updating = true;
        state.isUpdating = true;
        state.error = null;
        state.mutationRequestId = action.meta.requestId;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        handleBackendSuccess(state, action);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false;
        state.isUpdating = false;
        state.mutationRequestId = null;
        state.error = action.payload ?? "Không thể cập nhật số lượng.";
      });

    // removeCartItem / removeItem
    builder
      .addCase(removeCartItem.pending, (state, action) => {
        state.updating = true;
        state.isUpdating = true;
        state.error = null;
        state.mutationRequestId = action.meta.requestId;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        handleBackendSuccess(state, action);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false;
        state.isUpdating = false;
        state.mutationRequestId = null;
        state.error = action.payload ?? "Không thể xóa sản phẩm.";
      });

    // clearCart / clearCartAction
    builder
      .addCase(clearCart.pending, (state, action) => {
        state.updating = true;
        state.isUpdating = true;
        state.error = null;
        state.mutationRequestId = action.meta.requestId;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        handleBackendSuccess(state, action);
      })
      .addCase(clearCart.rejected, (state, action) => {
        if (state.mutationRequestId !== action.meta.requestId) return;
        state.updating = false;
        state.isUpdating = false;
        state.mutationRequestId = null;
        state.error = action.payload ?? "Không thể làm trống giỏ hàng.";
      });

    // removeSelectedItemsAction
    builder
      .addCase(removeSelectedItemsAction.pending, (state) => {
        state.updating = true;
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeSelectedItemsAction.fulfilled, handleBackendSuccess)
      .addCase(removeSelectedItemsAction.rejected, (state, action) => {
        state.updating = false;
        state.isUpdating = false;
        state.error = action.payload ?? "Xóa sản phẩm đã chọn thất bại.";
      });

    // applyPlatformVoucherAction
    builder
      .addCase(applyPlatformVoucherAction.pending, (state) => {
        state.error = null;
      })
      .addCase(applyPlatformVoucherAction.fulfilled, (state, action) => {
        state.platformVoucher = action.payload;
        state.summary = computeCartSummary(
          state.items,
          state.platformVoucher,
          state.shopVouchers,
          state.freeShippingThreshold
        );
      })
      .addCase(applyPlatformVoucherAction.rejected, (state, action) => {
        state.error = action.payload ?? "Áp dụng voucher thất bại";
      });

    // applyShopVoucherAction
    builder
      .addCase(applyShopVoucherAction.pending, (state) => {
        state.error = null;
      })
      .addCase(applyShopVoucherAction.fulfilled, (state, action) => {
        if (action.payload.voucher) {
          state.shopVouchers[action.payload.shopId] = action.payload.voucher;
        }
        state.summary = computeCartSummary(
          state.items,
          state.platformVoucher,
          state.shopVouchers,
          state.freeShippingThreshold
        );
      })
      .addCase(applyShopVoucherAction.rejected, (state, action) => {
        state.error = action.payload ?? "Áp dụng mã shop thất bại";
      });
  },
});

export const {
  toggleItemSelection,
  toggleShopSelection,
  toggleAllSelection,
  removePlatformVoucher,
  removeShopVoucher,
  clearCartError,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
