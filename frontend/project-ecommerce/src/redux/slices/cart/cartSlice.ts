import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CartState,
  CartItem,
  CartSummary,
  PlatformVoucher,
  ShopVoucher,
  BackendCartResponse,
} from "../../../types/cart/cart.types";
import {
  cartApi,
  mapBackendCartResponse,
  INITIAL_PLATFORM_VOUCHER,
  INITIAL_SHOP_VOUCHERS,
} from "../../../api/cart/cartApi";
import type { RootState } from "../../store";

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
    (acc, it) => acc + it.price * it.quantity,
    0
  );

  const originalSubtotal = selectedItems.reduce(
    (acc, it) => acc + (it.original_price || it.price) * it.quantity,
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
        .reduce((sum, it) => sum + it.price * it.quantity, 0);
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

const initialState: CartState = {
  items: [],
  platformVoucher: INITIAL_PLATFORM_VOUCHER,
  shopVouchers: INITIAL_SHOP_VOUCHERS,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  isLoading: false,
  isUpdating: false,
  isInitialized: false,
  error: null,
  summary: {
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
  },
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải giỏ hàng";
      return rejectWithValue(message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { variantId, quantity = 1 }: { variantId: number; quantity?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await cartApi.addItem(variantId, quantity);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Thêm vào giỏ hàng thất bại";
      return rejectWithValue(message);
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async (
    { itemId, quantity }: { itemId: number; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await cartApi.updateQuantity(itemId, quantity);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cập nhật số lượng thất bại";
      return rejectWithValue(message);
    }
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId: number, { rejectWithValue }) => {
    try {
      const res = await cartApi.removeItem(itemId);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xóa sản phẩm thất bại";
      return rejectWithValue(message);
    }
  }
);

export const clearCartAction = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.clearCart();
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xóa giỏ hàng thất bại";
      return rejectWithValue(message);
    }
  }
);

export const removeSelectedItemsAction = createAsyncThunk(
  "cart/removeSelectedItems",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as RootState).cart;
      const selected = state.items.filter((it) => it.selected);
      if (selected.length === 0) {
        return null;
      }
      if (selected.length === state.items.length) {
        return await cartApi.clearCart();
      }
      let latestRes: BackendCartResponse | null = null;
      for (const item of selected) {
        latestRes = await cartApi.removeItem(item.id);
      }
      return latestRes;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xóa các sản phẩm đã chọn thất bại";
      return rejectWithValue(message);
    }
  }
);

export const applyPlatformVoucherAction = createAsyncThunk(
  "cart/applyPlatformVoucher",
  async (code: string, { rejectWithValue }) => {
    try {
      const voucher = await cartApi.applyPlatformVoucher(code);
      return voucher;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mã voucher không hợp lệ";
      return rejectWithValue(message);
    }
  }
);

export const applyShopVoucherAction = createAsyncThunk(
  "cart/applyShopVoucher",
  async (
    { shopId, code }: { shopId: number; code: string },
    { rejectWithValue }
  ) => {
    try {
      const voucher = await cartApi.applyShopVoucher(shopId, code);
      return { shopId, voucher };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mã shop voucher không hợp lệ";
      return rejectWithValue(message);
    }
  }
);

export const cartSlice = createSlice({
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
    clearCartError(state) {
      state.error = null;
    },
    resetCart(state) {
      state.items = [];
      state.isLoading = false;
      state.isUpdating = false;
      state.isInitialized = false;
      state.error = null;
      state.platformVoucher = null;
      state.shopVouchers = {};
      state.summary = {
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
    },
  },
  extraReducers: (builder) => {
    // Tự động dọn sạch giỏ hàng khi người dùng đăng xuất hoặc hết hạn phiên
    builder.addCase("auth/logoutUser/fulfilled", (state) => {
      state.items = [];
      state.isLoading = false;
      state.isUpdating = false;
      state.isInitialized = false;
      state.error = null;
      state.platformVoucher = null;
      state.shopVouchers = {};
      state.summary = {
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
    });
    builder.addCase("auth/sessionExpired", (state) => {
      state.items = [];
      state.isLoading = false;
      state.isUpdating = false;
      state.isInitialized = false;
      state.error = null;
      state.platformVoucher = null;
      state.shopVouchers = {};
      state.summary = {
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
    });
    // Helper to update items from backend cart response
    const handleBackendCartSuccess = (
      state: CartState,
      action: PayloadAction<BackendCartResponse | null>
    ) => {
      state.isLoading = false;
      state.isUpdating = false;
      state.isInitialized = true;
      state.error = null;
      if (action.payload) {
        state.items = mapBackendCartResponse(action.payload, state.items);
        state.summary = computeCartSummary(
          state.items,
          state.platformVoucher,
          state.shopVouchers,
          state.freeShippingThreshold
        );
      }
    };

    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, handleBackendCartSuccess)
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = (action.payload as string) || "Không thể tải giỏ hàng";
      });

    // addToCart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, handleBackendCartSuccess)
      .addCase(addToCart.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || "Thêm vào giỏ hàng thất bại";
      });

    // updateItemQuantity
    builder
      .addCase(updateItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, handleBackendCartSuccess)
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || "Cập nhật số lượng thất bại";
      });

    // removeItem
    builder
      .addCase(removeItem.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeItem.fulfilled, handleBackendCartSuccess)
      .addCase(removeItem.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || "Xóa sản phẩm thất bại";
      });

    // clearCartAction
    builder
      .addCase(clearCartAction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(clearCartAction.fulfilled, handleBackendCartSuccess)
      .addCase(clearCartAction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || "Xóa giỏ hàng thất bại";
      });

    // removeSelectedItemsAction
    builder
      .addCase(removeSelectedItemsAction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(removeSelectedItemsAction.fulfilled, handleBackendCartSuccess)
      .addCase(removeSelectedItemsAction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || "Xóa sản phẩm đã chọn thất bại";
      });

    // Platform voucher
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
        state.error = (action.payload as string) || "Áp dụng voucher thất bại";
      });

    // Shop voucher
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
        state.error = (action.payload as string) || "Áp dụng mã shop thất bại";
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
