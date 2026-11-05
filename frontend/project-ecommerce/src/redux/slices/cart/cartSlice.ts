import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CartState,
  CartItem,
  CartSummary,
  PlatformVoucher,
  ShopVoucher,
} from "../../../types/cart/cart.types";
import { cartApi, INITIAL_PLATFORM_VOUCHER, INITIAL_SHOP_VOUCHERS } from "../../../api/cart/cartApi";

const FREE_SHIPPING_THRESHOLD = 500000;
const BASE_SHIPPING_FEE = 35000;

function computeCartSummary(
  items: CartItem[],
  platformVoucher: PlatformVoucher | null,
  shopVouchers: Record<number, ShopVoucher>,
  threshold: number = FREE_SHIPPING_THRESHOLD
): CartSummary {
  const selectedItems = items.filter((it) => it.selected);
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
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const res = await cartApi.getCart();
  return res;
});

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
    const updated = await cartApi.updateQuantity(itemId, quantity);
    return updated;
  }
);

export const toggleItemSelection = createAsyncThunk(
  "cart/toggleItemSelection",
  async (itemId: number) => {
    const updated = await cartApi.toggleSelectItem(itemId);
    return updated;
  }
);

export const toggleShopSelection = createAsyncThunk(
  "cart/toggleShopSelection",
  async ({ shopId, selected }: { shopId: number; selected: boolean }) => {
    const updated = await cartApi.toggleSelectShop(shopId, selected);
    return updated;
  }
);

export const toggleAllSelection = createAsyncThunk(
  "cart/toggleAllSelection",
  async (selected: boolean) => {
    const updated = await cartApi.toggleSelectAll(selected);
    return updated;
  }
);

export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId: number) => {
    const updated = await cartApi.removeItem(itemId);
    return updated;
  }
);

export const removeSelectedItemsAction = createAsyncThunk(
  "cart/removeSelectedItems",
  async () => {
    const updated = await cartApi.removeSelectedItems();
    return updated;
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
  },
  extraReducers: (builder) => {
    // fetchCart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.shopVouchers = action.payload.shopVouchers;
        state.platformVoucher = action.payload.platformVoucher;
        state.summary = computeCartSummary(
          state.items,
          state.platformVoucher,
          state.shopVouchers,
          state.freeShippingThreshold
        );
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Không thể tải giỏ hàng";
      });

    // Item updates (quantity, select, remove)
    const handleItemsUpdated = (
      state: CartState,
      action: PayloadAction<CartItem[]>
    ) => {
      state.items = action.payload;
      state.summary = computeCartSummary(
        state.items,
        state.platformVoucher,
        state.shopVouchers,
        state.freeShippingThreshold
      );
    };

    builder.addCase(updateItemQuantity.fulfilled, handleItemsUpdated);
    builder.addCase(toggleItemSelection.fulfilled, handleItemsUpdated);
    builder.addCase(toggleShopSelection.fulfilled, handleItemsUpdated);
    builder.addCase(toggleAllSelection.fulfilled, handleItemsUpdated);
    builder.addCase(removeItem.fulfilled, handleItemsUpdated);
    builder.addCase(removeSelectedItemsAction.fulfilled, handleItemsUpdated);

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

export const { removePlatformVoucher, removeShopVoucher, clearCartError } =
  cartSlice.actions;

export default cartSlice.reducer;

