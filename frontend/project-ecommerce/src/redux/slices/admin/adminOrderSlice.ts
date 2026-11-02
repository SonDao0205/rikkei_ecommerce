import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { adminOrderApi } from "../../../api/admin/adminOrderApi";
import type {
  AdminOrderItem,
  OrderStatusCounts,
  OrderFilterParams,
  AdminOrderDetailData,
} from "../../../types/ecommerce";

interface AdminOrderState {
  orders: AdminOrderItem[];
  counts: OrderStatusCounts;
  selectedIds: string[];
  selectedOrderForDetail: AdminOrderItem | null;
  currentOrderDetail: AdminOrderDetailData | null;
  filters: {
    search: string;
    statusTab: 'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled';
    dateRange: string;
    paymentMethod: string;
    vendor: string;
    courier: string;
  };
  currentPage: number;
  pageSize: number;
  totalOrders: number;
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  counts: {
    all: 48,
    pending: 5,
    shipping: 18,
    delivered: 23,
    cancelled: 2,
  },
  selectedIds: ["#ORD-9821"], // Default selection matching admin_order.html
  selectedOrderForDetail: null,
  currentOrderDetail: null,
  filters: {
    search: "#ORD-982",
    statusTab: "all",
    dateRange: "today",
    paymentMethod: "all",
    vendor: "all",
    courier: "all",
  },
  currentPage: 1,
  pageSize: 6,
  totalOrders: 48,
  isLoading: false,
  isExporting: false,
  error: null,
};

export const getAdminOrders = createAsyncThunk<
  { orders: AdminOrderItem[]; total: number },
  OrderFilterParams | void,
  { rejectValue: string }
>("adminOrders/getAdminOrders", async (params, { getState, rejectWithValue }) => {
  try {
    const filter = (params || {}) as OrderFilterParams;
    const state = (getState() as { adminOrder: AdminOrderState }).adminOrder;
    const effectiveParams: OrderFilterParams = {
      search: filter.search !== undefined ? filter.search : state.filters.search,
      statusTab: filter.statusTab !== undefined ? filter.statusTab : state.filters.statusTab,
      dateRange: filter.dateRange !== undefined ? filter.dateRange : state.filters.dateRange,
      paymentMethod: filter.paymentMethod !== undefined ? filter.paymentMethod : state.filters.paymentMethod,
      vendor: filter.vendor !== undefined ? filter.vendor : state.filters.vendor,
      courier: filter.courier !== undefined ? filter.courier : state.filters.courier,
      page: filter.page || state.currentPage,
      pageSize: filter.pageSize || state.pageSize,
    };
    return await adminOrderApi.fetchOrders(effectiveParams);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to load orders");
  }
});

export const getOrderStatusCounts = createAsyncThunk<
  OrderStatusCounts,
  void,
  { rejectValue: string }
>("adminOrders/getOrderStatusCounts", async (_, { rejectWithValue }) => {
  try {
    return await adminOrderApi.fetchStatusCounts();
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to load counts");
  }
});

export const confirmOrderThunk = createAsyncThunk<
  AdminOrderItem,
  string,
  { rejectValue: string }
>("adminOrders/confirmOrder", async (orderId, { rejectWithValue }) => {
  try {
    return await adminOrderApi.confirmOrder(orderId);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to confirm order");
  }
});

export const bulkConfirmOrdersThunk = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("adminOrders/bulkConfirmOrders", async (orderIds, { rejectWithValue }) => {
  try {
    return await adminOrderApi.bulkConfirmOrders(orderIds);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to bulk confirm");
  }
});

export const cancelOrderThunk = createAsyncThunk<
  AdminOrderItem,
  string,
  { rejectValue: string }
>("adminOrders/cancelOrder", async (orderId, { rejectWithValue }) => {
  try {
    return await adminOrderApi.cancelOrder(orderId);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to cancel order");
  }
});

export const exportOrdersCsvThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("adminOrders/exportCsv", async (_, { rejectWithValue }) => {
  try {
    const blob = await adminOrderApi.exportCsv();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketpulse_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Export failed");
  }
});

export const getOrderDetailThunk = createAsyncThunk<
  AdminOrderDetailData,
  string,
  { rejectValue: string }
>("adminOrders/getOrderDetail", async (orderId, { rejectWithValue }) => {
  try {
    return await adminOrderApi.getOrderDetailById(orderId);
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to load order detail");
  }
});

export const changeCourierThunk = createAsyncThunk<
  { courierName: string; trackingCode: string },
  { orderId: string; courierName: string; trackingCode: string },
  { rejectValue: string }
>("adminOrders/changeCourier", async ({ orderId, courierName, trackingCode }, { rejectWithValue }) => {
  try {
    await adminOrderApi.changeCourier(orderId, courierName, trackingCode);
    return { courierName, trackingCode };
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : "Failed to change courier");
  }
});

export const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    setStatusTab: (state, action: PayloadAction<'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled'>) => {
      state.filters.statusTab = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setDateRangeFilter: (state, action: PayloadAction<string>) => {
      state.filters.dateRange = action.payload;
    },
    setPaymentMethodFilter: (state, action: PayloadAction<string>) => {
      state.filters.paymentMethod = action.payload;
    },
    setVendorFilter: (state, action: PayloadAction<string>) => {
      state.filters.vendor = action.payload;
    },
    setCourierFilter: (state, action: PayloadAction<string>) => {
      state.filters.courier = action.payload;
    },
    clearAllFilters: (state) => {
      state.filters = {
        search: "",
        statusTab: "all",
        dateRange: "all",
        paymentMethod: "all",
        vendor: "all",
        courier: "all",
      };
    },
    toggleSelectOrder: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllOrders: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedIds = state.orders.map((o) => o.id);
      } else {
        state.selectedIds = [];
      }
    },
    openOrderDetail: (state, action: PayloadAction<AdminOrderItem>) => {
      state.selectedOrderForDetail = action.payload;
    },
    closeOrderDetail: (state) => {
      state.selectedOrderForDetail = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(getAdminOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.totalOrders = action.payload.total;
      })
      .addCase(getAdminOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Could not fetch orders";
      })
      // Status Counts
      .addCase(getOrderStatusCounts.fulfilled, (state, action) => {
        state.counts = action.payload;
      })
      // Confirm single order
      .addCase(confirmOrderThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.orders.findIndex((o) => o.id === updated.id);
        if (idx !== -1) {
          state.orders[idx] = updated;
        }
        if (state.selectedOrderForDetail?.id === updated.id) {
          state.selectedOrderForDetail = updated;
        }
        if (state.currentOrderDetail?.id === updated.id) {
          state.currentOrderDetail.status = "shipping";
          state.currentOrderDetail.statusLabel = "Đang giao hàng";
          state.currentOrderDetail.isUrgent = false;
          state.currentOrderDetail.financial.paymentStatus = "Chờ giao hàng / Thu COD";
          if (state.currentOrderDetail.shipping.timeline[1]) {
            state.currentOrderDetail.shipping.timeline[1].status = "completed";
          }
          if (state.currentOrderDetail.shipping.timeline[2]) {
            state.currentOrderDetail.shipping.timeline[2].status = "current";
            state.currentOrderDetail.shipping.timeline[2].time = "Đang tiến hành xuất kho";
          }
        }
      })
      // Bulk confirm
      .addCase(bulkConfirmOrdersThunk.fulfilled, (state, action) => {
        const confirmedIds = action.payload;
        state.orders = state.orders.map((o) =>
          confirmedIds.includes(o.id)
            ? { ...o, status: "shipping", statusLabel: "Đang giao hàng" }
            : o
        );
        state.selectedIds = [];
      })
      // Cancel single order
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.orders.findIndex((o) => o.id === updated.id);
        if (idx !== -1) {
          state.orders[idx] = updated;
        }
        if (state.selectedOrderForDetail?.id === updated.id) {
          state.selectedOrderForDetail = updated;
        }
        if (state.currentOrderDetail?.id === updated.id) {
          state.currentOrderDetail.status = "cancelled";
          state.currentOrderDetail.statusLabel = "Đã huỷ";
          state.currentOrderDetail.isUrgent = false;
        }
      })
      // Fetch Order Detail
      .addCase(getOrderDetailThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrderDetail = action.payload;
      })
      .addCase(getOrderDetailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Could not fetch order detail";
      })
      // Change Courier
      .addCase(changeCourierThunk.fulfilled, (state, action) => {
        if (state.currentOrderDetail) {
          state.currentOrderDetail.shipping.courier = action.payload.courierName;
          state.currentOrderDetail.shipping.trackingCode = action.payload.trackingCode;
        }
      })
      // Export
      .addCase(exportOrdersCsvThunk.pending, (state) => {
        state.isExporting = true;
      })
      .addCase(exportOrdersCsvThunk.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportOrdersCsvThunk.rejected, (state) => {
        state.isExporting = false;
      });
  },
});

export const {
  setStatusTab,
  setSearchQuery,
  setDateRangeFilter,
  setPaymentMethodFilter,
  setVendorFilter,
  setCourierFilter,
  clearAllFilters,
  toggleSelectOrder,
  selectAllOrders,
  openOrderDetail,
  closeOrderDetail,
  setCurrentPage,
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
