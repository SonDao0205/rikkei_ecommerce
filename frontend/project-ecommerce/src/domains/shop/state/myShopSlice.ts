import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopApi } from "@/domains/shop/api/shopApi";
import type { Shop, ShopProfilePayload } from "@/shared/types";
import type { ShopTermsAcceptance } from "@/domains/shop/types/registerShop.types";

export interface MyShopState {
  shop: Shop | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: MyShopState = {
  shop: null,
  loading: false,
  updating: false,
  error: null,
  successMessage: null,
};

/**
 * Tải thông tin gian hàng của tài khoản đang đăng nhập
 * GET /api/v1/me/shop
 */
export const fetchMyShop = createAsyncThunk<Shop | null, void, { rejectValue: string }>(
  "myShop/fetchMyShop",
  async (_, { rejectWithValue }) => {
    try {
      return await shopApi.fetchMyShop();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải thông tin gian hàng";
      return rejectWithValue(msg);
    }
  }
);

/**
 * Cập nhật thông tin gian hàng của chủ sở hữu
 * PUT /api/v1/me/shop
 */
export const updateMyShop = createAsyncThunk<Shop, ShopProfilePayload, { rejectValue: string }>(
  "myShop/updateMyShop",
  async (payload, { rejectWithValue }) => {
    try {
      return await shopApi.updateMyShop(payload);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cập nhật hồ sơ gian hàng thất bại";
      return rejectWithValue(msg);
    }
  }
);

export const resubmitMyShop = createAsyncThunk<Shop, ShopTermsAcceptance, { rejectValue: string }>(
  "myShop/resubmitMyShop",
  async (agreements, { rejectWithValue }) => {
    try {
      return await shopApi.submitMyShop(agreements);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Gửi lại hồ sơ shop thất bại");
    }
  }
);

export const myShopSlice = createSlice({
  name: "myShop",
  initialState,
  reducers: {
    clearMyShopMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetMyShopState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Shop
      .addCase(fetchMyShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyShop.fulfilled, (state, action: PayloadAction<Shop | null>) => {
        state.loading = false;
        state.shop = action.payload;
      })
      .addCase(fetchMyShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải thông tin gian hàng";
      })

      // Update My Shop
      .addCase(updateMyShop.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMyShop.fulfilled, (state, action: PayloadAction<Shop>) => {
        state.updating = false;
        state.shop = action.payload;
        state.successMessage = "Hồ sơ gian hàng đã được cập nhật thành công!";
      })
      .addCase(updateMyShop.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Cập nhật hồ sơ gian hàng thất bại";
      })
      .addCase(resubmitMyShop.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resubmitMyShop.fulfilled, (state, action) => {
        state.updating = false;
        state.shop = action.payload;
        state.successMessage = "Hồ sơ đã được gửi lại và đang chờ admin xét duyệt.";
      })
      .addCase(resubmitMyShop.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Gửi lại hồ sơ shop thất bại";
      });
  },
});

export const { clearMyShopMessages, resetMyShopState } = myShopSlice.actions;
export default myShopSlice.reducer;

