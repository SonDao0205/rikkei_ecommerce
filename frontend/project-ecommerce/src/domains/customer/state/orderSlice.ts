import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { userOrderApi } from "@/domains/customer/api/orderApi";
import type {
  UserOrder,
  UserOrderStatusCounts,
  UserOrderStatusTab,
  UserOrderFilterParams,
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
  actionLoading: boolean;
  error: string | null;
  selectedOrderForCancel: UserOrder | null;
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
  actionLoading: false,
  error: null,
  selectedOrderForCancel: null,
  currentOrderDetail: null,
};

export const getUserOrders = createAsyncThunk<
  { orders: UserOrder[]; total: number },
  UserOrderFilterParams | undefined
>("userOrder/getUserOrders", async (params, { rejectWithValue }) => {
  try {
    return await userOrderApi.fetchUserOrders(params);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng"
    );
  }
});

export const getUserOrderCounts = createAsyncThunk<UserOrderStatusCounts>(
  "userOrder/getUserOrderCounts",
  async (_, { rejectWithValue }) => {
    try {
      return await userOrderApi.fetchUserOrderStatusCounts();
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Không thể lấy số lượng trạng thái đơn"
      );
    }
  }
);

export const cancelOrderAction = createAsyncThunk<
  UserOrder,
  { orderId: number | string; cancelReason: string }
>("userOrder/cancelOrder", async ({ orderId, cancelReason }, { rejectWithValue }) => {
  try {
    return await userOrderApi.cancelUserOrder(orderId, cancelReason);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Hủy đơn hàng thất bại"
    );
  }
});

export const confirmReceivedAction = createAsyncThunk<UserOrder, number | string>(
  "userOrder/confirmReceived",
  async (orderId, { rejectWithValue }) => {
    try {
      return await userOrderApi.confirmOrderReceived(orderId);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Xác nhận nhận hàng thất bại"
      );
    }
  }
);

export const getUserOrderDetail = createAsyncThunk<
  UserOrder,
  string | number
>("userOrder/getUserOrderDetail", async (orderIdOrCode, { rejectWithValue }) => {
  try {
    return await userOrderApi.fetchUserOrderDetail(orderIdOrCode);
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng"
    );
  }
});

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
    openCancelModal: (state, action: PayloadAction<UserOrder>) => {
      state.selectedOrderForCancel = action.payload;
    },
    closeCancelModal: (state) => {
      state.selectedOrderForCancel = null;
    },
    clearCurrentOrderDetail: (state) => {
      state.currentOrderDetail = null;
    },
  },
  extraReducers: (builder) => {
    // getUserOrders
    builder.addCase(getUserOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUserOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload.orders;
      state.total = action.payload.total;
    });
    builder.addCase(getUserOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Lỗi tải đơn hàng";
    });

    // getUserOrderCounts
    builder.addCase(getUserOrderCounts.fulfilled, (state, action) => {
      state.counts = action.payload;
    });

    // getUserOrderDetail
    builder.addCase(getUserOrderDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getUserOrderDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrderDetail = action.payload;
    });
    builder.addCase(getUserOrderDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as string) || "Lỗi tải chi tiết đơn hàng";
    });

    // cancelOrderAction
    builder.addCase(cancelOrderAction.pending, (state) => {
      state.actionLoading = true;
    });
    builder.addCase(cancelOrderAction.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.selectedOrderForCancel = null;
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrderDetail?.id === action.payload.id) {
        state.currentOrderDetail = action.payload;
      }
      state.counts.pending = Math.max(0, state.counts.pending - 1);
      state.counts.cancelled += 1;
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
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
      if (state.currentOrderDetail?.id === action.payload.id) {
        state.currentOrderDetail = action.payload;
      }
      state.counts.shipping = Math.max(0, state.counts.shipping - 1);
      state.counts.completed += 1;
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
