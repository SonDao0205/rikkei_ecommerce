import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopApi } from "@/domains/shop/api/shopApi";
import type {
  PublicShop,
  ProductItem,
  ShopFollowState,
  CatalogQueryParams,
} from "@/shared/types";

interface PublicShopState {
  currentShop: PublicShop | null;
  shopProducts: ProductItem[];
  shopProductsTotal: number;
  followState: ShopFollowState;
  loading: boolean;
  productsLoading: boolean;
  followLoading: boolean;
  error: string | null;
}

const initialState: PublicShopState = {
  currentShop: null,
  shopProducts: [],
  shopProductsTotal: 0,
  followState: { following: false, follower_count: 0 },
  loading: false,
  productsLoading: false,
  followLoading: false,
  error: null,
};

export const getShopDetail = createAsyncThunk(
  "publicShop/getShopDetail",
  async (shopId: number, { rejectWithValue }) => {
    try {
      return await shopApi.fetchShopDetail(shopId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load shop");
    }
  }
);

export const getShopProducts = createAsyncThunk(
  "publicShop/getShopProducts",
  async (
    payload: { shopId: number; params?: CatalogQueryParams },
    { rejectWithValue }
  ) => {
    try {
      return await shopApi.fetchShopProducts(payload.shopId, payload.params);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load shop products");
    }
  }
);

export const getShopFollowState = createAsyncThunk(
  "publicShop/getShopFollowState",
  async (shopId: number, { rejectWithValue }) => {
    try {
      return await shopApi.getShopFollowState(shopId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load follow state");
    }
  }
);

export const toggleFollowShop = createAsyncThunk(
  "publicShop/toggleFollowShop",
  async (
    payload: { shopId: number; currentlyFollowing: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (payload.currentlyFollowing) {
        return await shopApi.unfollowShop(payload.shopId);
      } else {
        return await shopApi.followShop(payload.shopId);
      }
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update follow state");
    }
  }
);

export const publicShopSlice = createSlice({
  name: "publicShop",
  initialState,
  reducers: {
    clearCurrentShop: (state) => {
      state.currentShop = null;
      state.shopProducts = [];
      state.shopProductsTotal = 0;
      state.followState = { following: false, follower_count: 0 };
      state.error = null;
    },
    setFollowState: (state, action: PayloadAction<ShopFollowState>) => {
      state.followState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Shop Detail
      .addCase(getShopDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShopDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShop = action.payload;
        state.followState.follower_count = action.payload.follower_count;
      })
      .addCase(getShopDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Shop Products
      .addCase(getShopProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(getShopProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.shopProducts = action.payload.products;
        state.shopProductsTotal = action.payload.total;
      })
      .addCase(getShopProducts.rejected, (state) => {
        state.productsLoading = false;
      })
      // Follow State
      .addCase(getShopFollowState.fulfilled, (state, action) => {
        state.followState = action.payload;
      })
      // Toggle Follow
      .addCase(toggleFollowShop.pending, (state) => {
        state.followLoading = true;
      })
      .addCase(toggleFollowShop.fulfilled, (state, action) => {
        state.followLoading = false;
        state.followState = action.payload;
        if (state.currentShop) {
          state.currentShop.follower_count = action.payload.follower_count;
        }
      })
      .addCase(toggleFollowShop.rejected, (state, action) => {
        state.followLoading = false;
        state.error = action.payload as string;
      })
      // Clear follow state on logout or session expiration
      .addCase("auth/logoutUser/fulfilled", (state) => {
        state.followState.following = false;
      })
      .addCase("auth/sessionExpired", (state) => {
        state.followState.following = false;
      });
  },
});

export const { clearCurrentShop, setFollowState } = publicShopSlice.actions;
export default publicShopSlice.reducer;
