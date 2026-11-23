import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { userOrderApi } from "@/domains/customer/api/orderApi";
import type {
  OrderActionTarget,
  UserOrder,
  UserOrderStatusCounts,
  UserOrderStatusTab,
} from "@/domains/order/types";

interface UserOrderState {
  orders: UserOrder[];
  counts: UserOrderStatusCounts;
  total: number;
  currentTab: UserOrderStatusTab;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  listRequestId?: string;
  detailLoading: boolean;
  detailRequestId?: string;
  actionLoading: boolean;
  error: string | null;
  selectedOrderForCancel: OrderActionTarget | null;
  currentOrderDetail: UserOrder | null;
}

const initialState: UserOrderState = {
  orders: [],
  counts: {
    all: 0,
    pending: 0,
    packing: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    returned: 0,
  },
  total: 0,
  currentTab: "all",
  searchQuery: "",
  currentPage: 1,
  pageSize: 6,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  selectedOrderForCancel: null,
  currentOrderDetail: null,
};

export const getUserOrders = createAsyncThunk<
  Awaited<ReturnType<typeof userOrderApi.fetchUserOrders>>,
  void,
  { state: { userOrder: UserOrderState }; rejectValue: string }
>("userOrder/getUserOrders", async (_, { getState, rejectWithValue }) => {
  const { currentTab, searchQuery, currentPage, pageSize } = getState().userOrder;
  try {
    return await userOrderApi.fetchUserOrders({
      tab: currentTab,
      search: searchQuery,
      page: currentPage,
      pageSize,
    });
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng",
    );
  }
});

export const cancelOrderAction = createAsyncThunk<
  UserOrder,
  { orderId: number | string; cancelReason: string; shopOrderId?: number }
>(
  "userOrder/cancelOrder",
  async ({ orderId, cancelReason, shopOrderId }, { rejectWithValue }) => {
    try {
      return await userOrderApi.cancelUserOrder(
        orderId,
        cancelReason,
        shopOrderId,
      );
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Hủy đơn hàng thất bại",
      );
    }
  },
);

export const confirmReceivedAction = createAsyncThunk<
  UserOrder,
  { orderId: number | string; shopOrderId?: number },
  { rejectValue: string }
>(
  "userOrder/confirmReceived",
  async ({ orderId, shopOrderId }, { rejectWithValue }) => {
    try {
      return await userOrderApi.confirmOrderReceived(orderId, shopOrderId);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Xác nhận nhận hàng thất bại",
      );
    }
  },
);

export const getUserOrderDetail = createAsyncThunk<
  UserOrder,
  { orderId: string | number; shopOrderId?: number }
>(
  "userOrder/getUserOrderDetail",
  async ({ orderId, shopOrderId }, { rejectWithValue }) => {
    try {
      return await userOrderApi.fetchUserOrderDetail(orderId, shopOrderId);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng",
      );
    }
  },
);

export const userOrderSlice = createSlice({
  name: "userOrder",
  initialState,
  reducers: {
    setCurrentTab: (state, action: PayloadAction<UserOrderStatusTab>) => {
      state.currentTab = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    openCancelModal: (state, action: PayloadAction<OrderActionTarget>) => {
      state.selectedOrderForCancel = action.payload;
    },
    closeCancelModal: (state) => {
      state.selectedOrderForCancel = null;
    },
    clearCurrentOrderDetail: (state) => {
      state.currentOrderDetail = null;
      state.detailRequestId = undefined;
      state.detailLoading = false;
    },
  },
  extraReducers: (builder) => {
    // getUserOrders
    builder.addCase(getUserOrders.pending, (state, action) => {
      state.listRequestId = action.meta.requestId;
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUserOrders.fulfilled, (state, action) => {
      if (state.listRequestId !== action.meta.requestId) return;
      state.listRequestId = undefined;
      state.loading = false;
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.counts = action.payload.counts;
      state.currentPage = Math.min(
        state.currentPage,
        Math.max(1, Math.ceil(state.total / state.pageSize)),
      );
    });
    builder.addCase(getUserOrders.rejected, (state, action) => {
      if (state.listRequestId !== action.meta.requestId) return;
      state.listRequestId = undefined;
      state.loading = false;
      state.error = (action.payload as string) || "Lỗi tải đơn hàng";
    });

    // getUserOrderDetail
    builder.addCase(getUserOrderDetail.pending, (state, action) => {
      state.detailRequestId = action.meta.requestId;
      state.detailLoading = true;
      state.error = null;
    });
    builder.addCase(getUserOrderDetail.fulfilled, (state, action) => {
      if (state.detailRequestId !== action.meta.requestId) return;
      state.detailRequestId = undefined;
      state.detailLoading = false;
      state.currentOrderDetail = action.payload;
    });
    builder.addCase(getUserOrderDetail.rejected, (state, action) => {
      if (state.detailRequestId !== action.meta.requestId) return;
      state.detailRequestId = undefined;
      state.detailLoading = false;
      state.error = (action.payload as string) || "Lỗi tải chi tiết đơn hàng";
    });

    // cancelOrderAction
    builder.addCase(cancelOrderAction.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(cancelOrderAction.fulfilled, (state, action) => {
      state.actionLoading = false;
      if (
        state.currentOrderDetail?.id === action.payload.id &&
        state.currentOrderDetail.shopOrderId === action.payload.shopOrderId
      ) {
        state.currentOrderDetail = action.payload;
      }
    });
    builder.addCase(cancelOrderAction.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = (action.payload as string) || "Lỗi khi hủy đơn hàng";
    });

    // confirmReceivedAction
    builder.addCase(confirmReceivedAction.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(confirmReceivedAction.fulfilled, (state, action) => {
      state.actionLoading = false;
      if (
        state.currentOrderDetail?.id === action.payload.id &&
        state.currentOrderDetail.shopOrderId === action.payload.shopOrderId
      ) {
        state.currentOrderDetail = action.payload;
      }
    });
    builder.addCase(confirmReceivedAction.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = (action.payload as string) || "Lỗi khi xác nhận nhận hàng";
    });
  },
});

export const {
  setCurrentTab,
  setSearchQuery,
  setCurrentPage,
  openCancelModal,
  closeCancelModal,
  clearCurrentOrderDetail,
} = userOrderSlice.actions;

export default userOrderSlice.reducer;
