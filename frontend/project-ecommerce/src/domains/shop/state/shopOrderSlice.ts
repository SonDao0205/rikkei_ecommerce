import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { shopOrderApi } from "@/domains/shop/api/shopOrderApiLive";
import type {
  ShopOrderItem,
  ShopOrderStatus,
  ShopOrderStatusCounts,
  ShopOrderFilterParams,
} from "@/domains/shop/types/shopOrder.types";

interface ShopOrderState {
  orders: ShopOrderItem[];
  totalOrders: number;
  counts: ShopOrderStatusCounts;
  selectedIds: string[];
  selectedOrderForDetail: ShopOrderItem | null;
  currentOrderDetail: ShopOrderItem | null;
  filters: {
    statusTab: ShopOrderStatus;
    search: string;
    dateRange: string;
    paymentMethod: string;
    courier: string;
  };
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  isDetailLoading: boolean;
  isExporting: boolean;
  error: string | null;
}

const initialCounts: ShopOrderStatusCounts = {
  all: 0,
  pending: 0,
  packing: 0,
  shipping: 0,
  delivered: 0,
  cancelled: 0,
  returned: 0,
};

const initialState: ShopOrderState = {
  orders: [],
  totalOrders: 0,
  counts: initialCounts,
  selectedIds: [],
  selectedOrderForDetail: null,
  currentOrderDetail: null,
  filters: {
    statusTab: "all",
    search: "",
    dateRange: "all",
    paymentMethod: "all",
    courier: "all",
  },
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  isDetailLoading: false,
  isExporting: false,
  error: null,
};

export const fetchShopOrderList = createAsyncThunk<
  { orders: ShopOrderItem[]; total: number },
  Partial<ShopOrderFilterParams> | undefined,
  { rejectValue: string }
>("shopOrder/fetchShopOrderList", async (params, { getState, rejectWithValue }) => {
  try {
    const state = (getState() as { shopOrder: ShopOrderState }).shopOrder;
    const mergedParams: ShopOrderFilterParams = {
      statusTab: params?.statusTab ?? state.filters.statusTab,
      search: params?.search ?? state.filters.search,
      dateRange: params?.dateRange ?? state.filters.dateRange,
      paymentMethod: params?.paymentMethod ?? state.filters.paymentMethod,
      courier: params?.courier ?? state.filters.courier,
      page: params?.page ?? state.currentPage,
      pageSize: params?.pageSize ?? state.pageSize,
    };
    const res = await shopOrderApi.fetchShopOrders(mergedParams);
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tải đơn hàng";
    return rejectWithValue(errorMsg);
  }
});

export const fetchShopOrderCountsThunk = createAsyncThunk<
  ShopOrderStatusCounts,
  void,
  { rejectValue: string }
>("shopOrder/fetchShopOrderCounts", async (_, { rejectWithValue }) => {
  try {
    const res = await shopOrderApi.fetchShopOrderCounts();
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi đếm số lượng";
    return rejectWithValue(errorMsg);
  }
});

export const fetchShopOrderDetailThunk = createAsyncThunk<
  ShopOrderItem,
  string,
  { rejectValue: string }
>("shopOrder/fetchShopOrderDetail", async (orderId, { rejectWithValue }) => {
  try {
    const res = await shopOrderApi.getShopOrderDetail(orderId);
    if (!res) throw new Error("Không tìm thấy đơn hàng");
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi tải chi tiết đơn hàng";
    return rejectWithValue(errorMsg);
  }
});

export const confirmShopOrderThunk = createAsyncThunk<
  ShopOrderItem,
  string,
  { rejectValue: string }
>("shopOrder/confirmOrder", async (orderId, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopOrderApi.confirmOrder(orderId);
    dispatch(fetchShopOrderCountsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xác nhận đơn hàng";
    return rejectWithValue(errorMsg);
  }
});

export const startPackingShopOrderThunk = createAsyncThunk<ShopOrderItem, string, { rejectValue: string }>(
  "shopOrder/startPacking",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const order = await shopOrderApi.startPacking(orderId);
      dispatch(fetchShopOrderCountsThunk());
      dispatch(fetchShopOrderList());
      return order;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : "Không thể bắt đầu đóng gói đơn hàng");
    }
  },
);

export const dispatchShopOrderThunk = createAsyncThunk<
  ShopOrderItem,
  { orderId: string; carrier: string; trackingCode: string },
  { rejectValue: string }
 >("shopOrder/dispatchOrder", async ({ orderId, carrier, trackingCode }, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopOrderApi.dispatchOrder(orderId, carrier, trackingCode);
    dispatch(fetchShopOrderCountsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi giao hàng cho ĐVVC";
    return rejectWithValue(errorMsg);
  }
});

export const cancelShopOrderThunk = createAsyncThunk<
  ShopOrderItem,
  { orderId: string; reason: string },
  { rejectValue: string }
>("shopOrder/cancelOrder", async ({ orderId, reason }, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopOrderApi.cancelOrder(orderId, reason);
    dispatch(fetchShopOrderCountsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi huỷ đơn hàng";
    return rejectWithValue(errorMsg);
  }
});

export const bulkConfirmShopOrdersThunk = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("shopOrder/bulkConfirm", async (orderIds, { dispatch, rejectWithValue }) => {
  try {
    const res = await shopOrderApi.bulkConfirmOrders(orderIds);
    dispatch(fetchShopOrderList());
    dispatch(fetchShopOrderCountsThunk());
    return res;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xác nhận hàng loạt";
    return rejectWithValue(errorMsg);
  }
});

export const exportShopOrdersCsvThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("shopOrder/exportCsv", async (_, { rejectWithValue }) => {
  try {
    const csvContent = await shopOrderApi.exportOrdersCsv();
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MarketPulse_Shop_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi xuất file CSV";
    return rejectWithValue(errorMsg);
  }
});

export const shopOrderSlice = createSlice({
  name: "shopOrder",
  initialState,
  reducers: {
    setStatusTab: (state, action: PayloadAction<ShopOrderStatus>) => {
      state.filters.statusTab = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
    },
    setDateRangeFilter: (state, action: PayloadAction<string>) => {
      state.filters.dateRange = action.payload;
      state.currentPage = 1;
    },
    setPaymentMethodFilter: (state, action: PayloadAction<string>) => {
      state.filters.paymentMethod = action.payload;
      state.currentPage = 1;
    },
    setCourierFilter: (state, action: PayloadAction<string>) => {
      state.filters.courier = action.payload;
      state.currentPage = 1;
    },
    clearAllFilters: (state) => {
      state.filters = {
        statusTab: "all",
        search: "",
        dateRange: "all",
        paymentMethod: "all",
        courier: "all",
      };
      state.currentPage = 1;
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
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    openOrderDetail: (state, action: PayloadAction<ShopOrderItem>) => {
      state.selectedOrderForDetail = action.payload;
    },
    closeOrderDetail: (state) => {
      state.selectedOrderForDetail = null;
    },
  },
  extraReducers: (builder) => {
    // List
    builder.addCase(fetchShopOrderList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchShopOrderList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.orders = action.payload.orders;
      state.totalOrders = action.payload.total;
    });
    builder.addCase(fetchShopOrderList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Lỗi tải đơn hàng";
    });

    // Counts
    builder.addCase(fetchShopOrderCountsThunk.fulfilled, (state, action) => {
      state.counts = action.payload;
    });

    // Detail
    builder.addCase(fetchShopOrderDetailThunk.pending, (state) => {
      state.isDetailLoading = true;
      state.error = null;
    });
    builder.addCase(fetchShopOrderDetailThunk.fulfilled, (state, action) => {
      state.isDetailLoading = false;
      state.currentOrderDetail = action.payload;
    });
    builder.addCase(fetchShopOrderDetailThunk.rejected, (state, action) => {
      state.isDetailLoading = false;
      state.error = action.payload || "Lỗi tải chi tiết đơn hàng";
    });

    // Confirm
    builder.addCase(confirmShopOrderThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
      if (state.currentOrderDetail?.id === updated.id) {
        state.currentOrderDetail = updated;
      }
      if (state.selectedOrderForDetail?.id === updated.id) {
        state.selectedOrderForDetail = updated;
      }
    });

    builder.addCase(startPackingShopOrderThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.orders = state.orders.map((order) => (order.id === updated.id ? updated : order));
      if (state.currentOrderDetail?.id === updated.id) state.currentOrderDetail = updated;
      if (state.selectedOrderForDetail?.id === updated.id) state.selectedOrderForDetail = updated;
    });

    // Dispatch
    builder.addCase(dispatchShopOrderThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
      if (state.currentOrderDetail?.id === updated.id) {
        state.currentOrderDetail = updated;
      }
      if (state.selectedOrderForDetail?.id === updated.id) {
        state.selectedOrderForDetail = updated;
      }
    });

    // Cancel
    builder.addCase(cancelShopOrderThunk.fulfilled, (state, action) => {
      const updated = action.payload;
      state.orders = state.orders.map((o) => (o.id === updated.id ? updated : o));
      if (state.currentOrderDetail?.id === updated.id) {
        state.currentOrderDetail = updated;
      }
      if (state.selectedOrderForDetail?.id === updated.id) {
        state.selectedOrderForDetail = updated;
      }
    });

    // Export
    builder.addCase(exportShopOrdersCsvThunk.pending, (state) => {
      state.isExporting = true;
    });
    builder.addCase(exportShopOrdersCsvThunk.fulfilled, (state) => {
      state.isExporting = false;
    });
    builder.addCase(exportShopOrdersCsvThunk.rejected, (state) => {
      state.isExporting = false;
    });
  },
});

export const {
  setStatusTab,
  setSearchQuery,
  setDateRangeFilter,
  setPaymentMethodFilter,
  setCourierFilter,
  clearAllFilters,
  toggleSelectOrder,
  selectAllOrders,
  setCurrentPage,
  openOrderDetail,
  closeOrderDetail,
} = shopOrderSlice.actions;

export default shopOrderSlice.reducer;

