import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopDashboardApi, initialShopDashboardData } from "@/domains/shop/api/shopDashboardApi";
import { shopOrderApi } from "@/domains/shop/api/shopOrderApiLive";
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
    const orders = await shopOrderApi.fetchShopOrders({ statusTab: "all", dateRange: selectedFilter, page: 1, pageSize: 10 });
    result.urgentOrders = orders.orders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerCity: order.customer.address.split(",").slice(-1)[0]?.trim() || "",
      productSummary: order.productSummary,
      productVariant: order.items.map((item) => item.variant).filter(Boolean).join(", "),
      totalAmount: order.financial.grandTotal,
      formattedTotalAmount: new Intl.NumberFormat("vi-VN").format(order.financial.grandTotal) + " ₫",
      paymentMethod: order.financial.paymentMethod,
      paymentBadgeType: order.financial.paymentMethod === "COD" ? "cod" as const : "online" as const,
      status: order.workflowStatus === "PENDING" ? "PENDING_CONFIRMATION" as const : order.workflowStatus === "SHIPPING" ? "HANDED_OVER" as const : order.workflowStatus === "COMPLETED" ? "COMPLETED" as const : order.workflowStatus === "CANCELLED" ? "CANCELLED" as const : "PACKING" as const,
      workflowStatus: order.workflowStatus,
      statusLabel: order.statusLabel,
      statusBadgeType: order.status === "pending" ? "warning" as const : order.status === "shipping" ? "success" as const : "info" as const,
      actionType: order.status === "pending" ? "confirm" as const : order.status === "packing" ? "print" as const : "track" as const,
      actionLabel: order.workflowStatus === "CONFIRMED" ? "Bắt đầu đóng gói" : order.workflowStatus === "PACKING" ? "Bàn giao vận chuyển" : order.status === "pending" ? "Xác nhận ngay" : "Xem chi tiết",
    }));
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
>("shopDashboard/confirmShopOrder", async (orderId, { dispatch, rejectWithValue }) => {
  try {
    await shopOrderApi.confirmOrder(orderId);
    dispatch(fetchShopDashboardData());
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
>("shopDashboard/printOrderLabel", async (orderId, { dispatch, getState, rejectWithValue }) => {
  try {
    const order = (getState() as { shopDashboard: ShopDashboardState }).shopDashboard.data.urgentOrders.find((item) => item.id === orderId);
    if (order?.workflowStatus === "CONFIRMED") {
      await shopOrderApi.startPacking(orderId);
    } else {
      const carrier = window.prompt("Nhập mã đơn vị vận chuyển:", "GHN");
      if (!carrier) throw new Error("Đã hủy bàn giao vận chuyển.");
      const trackingCode = window.prompt("Nhập mã vận đơn:");
      if (!trackingCode) throw new Error("Vui lòng nhập mã vận đơn.");
      await shopOrderApi.dispatchOrder(orderId, carrier.trim(), trackingCode.trim());
    }
    dispatch(fetchShopDashboardData());
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
          targetOrder.workflowStatus = "CONFIRMED";
          targetOrder.statusLabel = "Đang đóng hàng";
          targetOrder.statusBadgeType = "info";
          targetOrder.actionType = "print";
          targetOrder.actionLabel = "In vận đơn";
        }
      })
      // Print Label
      .addCase(printOrderLabel.fulfilled, (state, action) => {
        const targetOrder = state.data.urgentOrders.find((order) => order.id === action.payload);
        if (!targetOrder) return;
        if (targetOrder.workflowStatus === "CONFIRMED") {
          targetOrder.status = "PACKING";
          targetOrder.workflowStatus = "PACKING";
          targetOrder.statusLabel = "Đang đóng gói";
          targetOrder.actionLabel = "Bàn giao vận chuyển";
          targetOrder.actionType = "print";
        } else {
          targetOrder.status = "HANDED_OVER";
          targetOrder.workflowStatus = "SHIPPING";
          targetOrder.statusLabel = "Đang vận chuyển";
          targetOrder.statusBadgeType = "neutral";
          targetOrder.actionType = "track";
          targetOrder.actionLabel = "Xem chi tiết";
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
