import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { adminUserApi } from "@/domains/admin/api/adminUserApi";
import type {
  AdminUserItem,
  AdminUserStats,
  AdminUserFilterParams,
  AdminUserRoleTab,
  AdminUserStatus,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/domains/admin/types/adminUser.types";

interface AdminUserState {
  users: AdminUserItem[];
  total: number;
  stats: AdminUserStats;
  selectedIds: string[];
  selectedUserForDetail: AdminUserItem | null;
  isDrawerOpen: boolean;
  filters: AdminUserFilterParams;
  isLoading: boolean;
  isActionLoading: boolean;
  isExporting: boolean;
  error: string | null;
  successMessage: string | null;
  isFormModalOpen: boolean;
  editingUser: AdminUserItem | null;
  lockingUser: AdminUserItem | null;
}

const initialStats: AdminUserStats = {
  totalUsers: 0,
  activeUsers: 0,
  clientUsers: 0,
  sellerUsers: 0,
  adminUsers: 0,
  lockedUsers: 0,
};

const initialState: AdminUserState = {
  users: [],
  total: 0,
  stats: initialStats,
  selectedIds: [],
  selectedUserForDetail: null,
  isDrawerOpen: false,
  filters: {
    search: "",
    roleTab: "all",
    status: "all",
    sortBy: "newest",
    page: 1,
    pageSize: 10,
  },
  isLoading: false,
  isActionLoading: false,
  isExporting: false,
  error: null,
  successMessage: null,
  isFormModalOpen: false,
  editingUser: null,
  lockingUser: null,
};

export const fetchAdminUserList = createAsyncThunk<
  { users: AdminUserItem[]; total: number; stats: AdminUserStats },
  Partial<AdminUserFilterParams> | void,
  { rejectValue: string }
>("adminUser/fetchList", async (params, { rejectWithValue }) => {
  try {
    const res = await adminUserApi.getAdminUsers(params || {});
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tải danh sách người dùng";
    return rejectWithValue(msg);
  }
});

export const fetchAdminUserStats = createAsyncThunk<
  AdminUserStats,
  void,
  { rejectValue: string }
>("adminUser/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const stats = await adminUserApi.getUserStats();
    return stats;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tải thống kê người dùng";
    return rejectWithValue(msg);
  }
});

export const createAdminUserThunk = createAsyncThunk<
  AdminUserItem,
  CreateAdminUserPayload,
  { rejectValue: string }
>("adminUser/create", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminUserApi.createUser(payload);
    dispatch(fetchAdminUserList());
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo người dùng";
    return rejectWithValue(msg);
  }
});

export const updateAdminUserThunk = createAsyncThunk<
  AdminUserItem,
  { id: string; payload: UpdateAdminUserPayload },
  { rejectValue: string }
>("adminUser/update", async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminUserApi.updateUser(id, payload);
    dispatch(fetchAdminUserList());
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi cập nhật người dùng";
    return rejectWithValue(msg);
  }
});

export const lockAdminUserThunk = createAsyncThunk<
  AdminUserItem,
  { id: string; reason: string },
  { rejectValue: string }
>("adminUser/lock", async ({ id, reason }, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminUserApi.lockUser(id, reason);
    dispatch(fetchAdminUserList());
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi khoá người dùng";
    return rejectWithValue(msg);
  }
});

export const unlockAdminUserThunk = createAsyncThunk<
  AdminUserItem,
  string,
  { rejectValue: string }
>("adminUser/unlock", async (id, { dispatch, rejectWithValue }) => {
  try {
    const res = await adminUserApi.unlockUser(id);
    dispatch(fetchAdminUserList());
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi mở khoá người dùng";
    return rejectWithValue(msg);
  }
});

export const deleteAdminUserThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminUser/delete", async (id, { dispatch, rejectWithValue }) => {
  try {
    await adminUserApi.deleteUser(id);
    dispatch(fetchAdminUserList());
    return id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi xoá người dùng";
    return rejectWithValue(msg);
  }
});

export const resetUserPasswordThunk = createAsyncThunk<
  { success: boolean; tempPassword?: string },
  string,
  { rejectValue: string }
>("adminUser/resetPassword", async (id, { rejectWithValue }) => {
  try {
    const res = await adminUserApi.resetPassword(id);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi đặt lại mật khẩu";
    return rejectWithValue(msg);
  }
});

export const exportAdminUsersCsvThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("adminUser/exportCsv", async (_, { rejectWithValue }) => {
  try {
    const csvContent = await adminUserApi.exportCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Lỗi xuất file CSV";
    return rejectWithValue(msg);
  }
});

export const adminUserSlice = createSlice({
  name: "adminUser",
  initialState,
  reducers: {
    setRoleTab: (state, action: PayloadAction<AdminUserRoleTab>) => {
      state.filters.roleTab = action.payload;
      state.filters.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<"all" | AdminUserStatus>) => {
      state.filters.status = action.payload;
      state.filters.page = 1;
    },
    setSortBy: (
      state,
      action: PayloadAction<"newest" | "oldest" | "totalSpent" | "totalOrders" | "name">
    ) => {
      state.filters.sortBy = action.payload;
      state.filters.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.page = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        roleTab: "all",
        status: "all",
        sortBy: "newest",
        page: 1,
        pageSize: 10,
      };
    },
    toggleSelectUser: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((item) => item !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    toggleSelectAllUsers: (state, action: PayloadAction<boolean>) => {
      if (action.payload) {
        state.selectedIds = state.users.map((u) => u.id);
      } else {
        state.selectedIds = [];
      }
    },
    openDetailDrawer: (state, action: PayloadAction<AdminUserItem>) => {
      state.selectedUserForDetail = action.payload;
      state.isDrawerOpen = true;
    },
    closeDetailDrawer: (state) => {
      state.isDrawerOpen = false;
      state.selectedUserForDetail = null;
    },
    openCreateModal: (state) => {
      state.editingUser = null;
      state.isFormModalOpen = true;
    },
    openEditModal: (state, action: PayloadAction<AdminUserItem>) => {
      state.editingUser = action.payload;
      state.isFormModalOpen = true;
    },
    closeFormModal: (state) => {
      state.isFormModalOpen = false;
      state.editingUser = null;
    },
    openLockModal: (state, action: PayloadAction<AdminUserItem>) => {
      state.lockingUser = action.payload;
    },
    closeLockModal: (state) => {
      state.lockingUser = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch list
    builder.addCase(fetchAdminUserList.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminUserList.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.total = action.payload.total;
      state.stats = action.payload.stats;
    });
    builder.addCase(fetchAdminUserList.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Lỗi tải người dùng";
    });

    // Fetch stats
    builder.addCase(fetchAdminUserStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create
    builder.addCase(createAdminUserThunk.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(createAdminUserThunk.fulfilled, (state) => {
      state.isActionLoading = false;
      state.isFormModalOpen = false;
      state.successMessage = "Tạo người dùng mới thành công";
    });
    builder.addCase(createAdminUserThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload || "Lỗi tạo người dùng";
    });

    // Update
    builder.addCase(updateAdminUserThunk.pending, (state) => {
      state.isActionLoading = true;
    });
    builder.addCase(updateAdminUserThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.isFormModalOpen = false;
      state.successMessage = "Cập nhật thông tin người dùng thành công";
      if (state.selectedUserForDetail?.id === action.payload.id) {
        state.selectedUserForDetail = action.payload;
      }
    });
    builder.addCase(updateAdminUserThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload || "Lỗi cập nhật người dùng";
    });

    // Lock
    builder.addCase(lockAdminUserThunk.fulfilled, (state) => {
      state.lockingUser = null;
      state.successMessage = "Đã khoá tài khoản người dùng thành công";
    });
    builder.addCase(lockAdminUserThunk.rejected, (state, action) => {
      state.error = action.payload || "Lỗi khoá người dùng";
    });

    // Unlock
    builder.addCase(unlockAdminUserThunk.fulfilled, (state) => {
      state.successMessage = "Đã mở khoá tài khoản người dùng thành công";
    });
    builder.addCase(unlockAdminUserThunk.rejected, (state, action) => {
      state.error = action.payload || "Lỗi mở khoá người dùng";
    });

    // Delete
    builder.addCase(deleteAdminUserThunk.fulfilled, (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      state.successMessage = "Đã xoá người dùng thành công";
    });

    // Export CSV
    builder.addCase(exportAdminUsersCsvThunk.pending, (state) => {
      state.isExporting = true;
    });
    builder.addCase(exportAdminUsersCsvThunk.fulfilled, (state) => {
      state.isExporting = false;
      state.successMessage = "Xuất danh sách người dùng thành công";
    });
    builder.addCase(exportAdminUsersCsvThunk.rejected, (state, action) => {
      state.isExporting = false;
      state.error = action.payload || "Lỗi xuất CSV";
    });
  },
});

export const {
  setRoleTab,
  setStatusFilter,
  setSortBy,
  setSearchQuery,
  setCurrentPage,
  clearFilters,
  toggleSelectUser,
  toggleSelectAllUsers,
  openDetailDrawer,
  closeDetailDrawer,
  openCreateModal,
  openEditModal,
  closeFormModal,
  openLockModal,
  closeLockModal,
  clearMessages,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;

