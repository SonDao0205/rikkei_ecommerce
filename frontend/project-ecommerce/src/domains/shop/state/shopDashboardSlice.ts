import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopDashboardApi, initialShopDashboardData } from "@/domains/shop/api/shopDashboardApi";
import type {
  ShopDashboardData,
  ShopDateFilter,
  ShopChartMetricTab,
} from "@/domains/shop/types/shopDashboard.types";

interface ShopDashboardState {
  data: ShopDashboardData;
  isLoading: boolean;
  error: string | null;
  activeDateFilter: ShopDateFilter;
  activeChartTab: ShopChartMetricTab;
  searchQuery: string;
  orderFilterStatus: string;
}

const initialState: ShopDashboardState = {
  data: initialShopDashboardData,
  isLoading: false,
  error: null,
  activeDateFilter: "today",
  activeChartTab: "revenue",
  searchQuery: "",
  orderFilterStatus: "ALL",
};

export const fetchShopDashboardData = createAsyncThunk<
  ShopDashboardData,
  ShopDateFilter | void,
  { rejectValue: string }
>("shopDashboard/fetchShopDashboardData", async (filter, { getState, rejectWithValue }) => {
  try {
    const selectedFilter =
      filter || (getState() as { shopDashboard: ShopDashboardState }).shopDashboard.activeDateFilter;
    const result = await shopDashboardApi.getDashboardData(selectedFilter);
    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Không thể tải dữ liệu bảng điều khiển";
    return rejectWithValue(errorMsg);
  }
});

export const confirmShopOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("shopDashboard/confirmShopOrder", async (orderId, { rejectWithValue }) => {
  try {
    const success = await shopDashboardApi.confirmOrder(orderId);
    if (!success) throw new Error("Xác nhận đơn thất bại");
    return orderId;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xác nhận đơn hàng";
    return rejectWithValue(errorMsg);
  }
});

export const printOrderLabel = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("shopDashboard/printOrderLabel", async (orderId, { rejectWithValue }) => {
  try {
    const success = await shopDashboardApi.printShippingLabel(orderId);
    if (!success) throw new Error("In vận đơn thất bại");
    return orderId;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi in vận đơn";
    return rejectWithValue(errorMsg);
  }
});

export const shopDashboardSlice = createSlice({
  name: "shopDashboard",
  initialState,
  reducers: {
    setDateFilter: (state, action: PayloadAction<ShopDateFilter>) => {
      state.activeDateFilter = action.payload;
    },
    setChartTab: (state, action: PayloadAction<ShopChartMetricTab>) => {
      state.activeChartTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setOrderFilterStatus: (state, action: PayloadAction<string>) => {
      state.orderFilterStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard
      .addCase(fetchShopDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShopDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchShopDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Có lỗi xảy ra";
      })
      // Confirm Order
      .addCase(confirmShopOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        const targetOrder = state.data.urgentOrders.find((o) => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = "PACKING";
          targetOrder.statusLabel = "Đang đóng hàng";
          targetOrder.statusBadgeType = "info";
          targetOrder.actionType = "print";
          targetOrder.actionLabel = "In vận đơn";
        }
      })
      // Print Label
      .addCase(printOrderLabel.fulfilled, (state, action) => {
        const orderId = action.payload;
        const targetOrder = state.data.urgentOrders.find((o) => o.id === orderId);
        if (targetOrder) {
          targetOrder.status = "HANDED_OVER";
          targetOrder.statusLabel = "Đã bàn giao ĐVVC";
          targetOrder.statusBadgeType = "neutral";
          targetOrder.actionType = "track";
          targetOrder.actionLabel = "Tra cứu lộ trình";
        }
      });
  },
});

export const {
  setDateFilter,
  setChartTab,
  setSearchQuery,
  setOrderFilterStatus,
} = shopDashboardSlice.actions;

export default shopDashboardSlice.reducer;
