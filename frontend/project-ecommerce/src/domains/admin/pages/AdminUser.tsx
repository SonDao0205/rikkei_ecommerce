import React, { useEffect, useState } from "react";
import AdminLayout from "@/app/layout/AdminLayout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchAdminUserList,
  fetchAdminUserStats,
  createAdminUserThunk,
  updateAdminUserThunk,
  lockAdminUserThunk,
  unlockAdminUserThunk,
  deleteAdminUserThunk,
  resetUserPasswordThunk,
  exportAdminUsersCsvThunk,
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
} from "@/domains/admin/state/adminUserSlice";
import {
  UserHeader,
  UserStatsCards,
  UserRoleTabs,
  UserFilterBar,
  UserTable,
  UserPagination,
  UserDetailDrawer,
  UserFormModal,
  UserLockModal,
} from "@/domains/admin/components/user";
import type {
  AdminUserItem,
  AdminUserRoleTab,
  AdminUserStatus,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/domains/admin/types/adminUser.types";

export const AdminUser: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    total,
    stats,
    selectedIds,
    selectedUserForDetail,
    isDrawerOpen,
    filters,
    isLoading,
    isActionLoading,
    isExporting,
    isFormModalOpen,
    editingUser,
    lockingUser,
  } = useAppSelector((state) => state.adminUser);

  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(
    null
  );
  const [resetResult, setResetResult] = useState<{
    user: AdminUserItem;
    tempPassword?: string;
  } | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserItem | null>(null);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdminUserStats());
    dispatch(fetchAdminUserList(filters));
  }, [dispatch, filters]);

  // Tab change
  const handleTabChange = (tab: AdminUserRoleTab) => {
    dispatch(setRoleTab(tab));
  };

  // Status change
  const handleStatusChange = (status: "all" | AdminUserStatus) => {
    dispatch(setStatusFilter(status));
  };

  // Sort change
  const handleSortChange = (
    sortBy: "newest" | "oldest" | "totalSpent" | "totalOrders" | "name"
  ) => {
    dispatch(setSortBy(sortBy));
  };

  // Search change
  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(clearFilters());
  };

  // Create Submit
  const handleCreateSubmit = async (payload: CreateAdminUserPayload) => {
    try {
      await dispatch(createAdminUserThunk(payload)).unwrap();
      showToast(`Đã tạo tài khoản cho ${payload.fullName} thành công!`);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi tạo người dùng", true);
    }
  };

  // Update Submit
  const handleUpdateSubmit = async (id: string, payload: UpdateAdminUserPayload) => {
    try {
      await dispatch(updateAdminUserThunk({ id, payload })).unwrap();
      showToast("Cập nhật thông tin người dùng thành công!");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi cập nhật người dùng", true);
    }
  };

  // Lock Confirm
  const handleLockConfirm = async (userId: string, reason: string) => {
    try {
      await dispatch(lockAdminUserThunk({ id: userId, reason })).unwrap();
      dispatch(closeLockModal());
      showToast("Đã khoá tài khoản người dùng thành công!");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi khoá người dùng", true);
    }
  };

  // Unlock User
  const handleUnlockUser = async (id: string) => {
    try {
      await dispatch(unlockAdminUserThunk(id)).unwrap();
      showToast("Đã mở khoá tài khoản người dùng thành công!");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi mở khoá người dùng", true);
    }
  };

  // Reset Password
  const handleResetPassword = async (user: AdminUserItem) => {
    try {
      const res = await dispatch(resetUserPasswordThunk(user.id)).unwrap();
      setResetResult({ user, tempPassword: res.tempPassword });
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi tạo mật khẩu tạm", true);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await dispatch(deleteAdminUserThunk(deletingUser.id)).unwrap();
      showToast(`Đã xoá tài khoản ${deletingUser.fullName}!`);
      setDeletingUser(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Lỗi xoá người dùng", true);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    dispatch(exportAdminUsersCsvThunk());
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <UserHeader
          totalUsers={stats.totalUsers}
          onOpenCreate={() => dispatch(openCreateModal())}
          onExportCsv={handleExportCsv}
          isExporting={isExporting}
        />

        {/* Stats KPI Cards */}
        <UserStatsCards stats={stats} />

        {/* Role Tabs */}
        <UserRoleTabs
          currentTab={filters.roleTab}
          onSelectTab={handleTabChange}
          stats={stats}
        />

        {/* Filter Bar */}
        <UserFilterBar
          search={filters.search}
          onSearchChange={handleSearchChange}
          status={filters.status}
          onStatusChange={handleStatusChange}
          sortBy={filters.sortBy}
          onSortByChange={handleSortChange}
          onResetFilters={handleResetFilters}
        />

        {/* User Table */}
        <UserTable
          users={users}
          selectedIds={selectedIds}
          isLoading={isLoading}
          onToggleSelect={(id) => dispatch(toggleSelectUser(id))}
          onSelectAll={(checked) => dispatch(toggleSelectAllUsers(checked))}
          onViewDetail={(u) => dispatch(openDetailDrawer(u))}
          onEdit={(u) => dispatch(openEditModal(u))}
          onLock={(u) => dispatch(openLockModal(u))}
          onUnlock={handleUnlockUser}
          onResetPassword={handleResetPassword}
          onOpenCreate={() => dispatch(openCreateModal())}
        />

        {/* Pagination */}
        {total > 0 && (
          <UserPagination
            currentPage={filters.page}
            pageSize={filters.pageSize}
            totalItems={total}
            onPageChange={(page) => dispatch(setCurrentPage(page))}
          />
        )}

        {/* User Detail Drawer */}
        <UserDetailDrawer
          isOpen={isDrawerOpen}
          user={selectedUserForDetail}
          onClose={() => dispatch(closeDetailDrawer())}
          onEdit={(u) => {
            dispatch(closeDetailDrawer());
            dispatch(openEditModal(u));
          }}
          onLock={(u) => {
            dispatch(closeDetailDrawer());
            dispatch(openLockModal(u));
          }}
          onUnlock={handleUnlockUser}
          onResetPassword={handleResetPassword}
        />

        {/* Form Modal (Create / Edit) */}
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={() => dispatch(closeFormModal())}
          onSubmitCreate={handleCreateSubmit}
          onSubmitUpdate={handleUpdateSubmit}
          editingUser={editingUser}
          isSaving={isActionLoading}
        />

        {/* Lock Modal */}
        <UserLockModal
          user={lockingUser}
          onClose={() => dispatch(closeLockModal())}
          onConfirm={handleLockConfirm}
          isLoading={isActionLoading}
        />

        {/* Reset Password Modal */}
        {resetResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 border border-outline-variant/30 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">vpn_key</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Mật khẩu tạm thời đã tạo
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Mật khẩu đăng nhập tạm thời cho người dùng{" "}
                  <strong className="text-on-surface font-semibold">
                    {resetResult.user.fullName}
                  </strong>{" "}
                  ({resetResult.user.email}) là:
                </p>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center justify-between">
                <span className="font-mono text-lg font-bold text-primary tracking-wider">
                  {resetResult.tempPassword}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resetResult.tempPassword || "");
                    showToast("Đã sao chép mật khẩu tạm thời vào clipboard!");
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Sao chép</span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant">
                Vui lòng gửi mật khẩu này cho người dùng và yêu cầu họ đổi mật khẩu ngay sau khi đăng nhập thành công.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setResetResult(null)}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 border border-outline-variant/30 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">delete_forever</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Xác nhận xoá người dùng?
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Bạn có chắc chắn muốn xoá vĩnh viễn tài khoản{" "}
                  <strong className="text-on-surface font-semibold">
                    {deletingUser.fullName}
                  </strong>{" "}
                  ({deletingUser.email}) không? Toàn bộ quyền truy cập sẽ bị thu hồi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl font-label-md text-label-md transition-colors cursor-pointer"
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm"
                >
                  Xoá tài khoản
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-label-md text-label-md border animate-in slide-in-from-bottom duration-200 ${
              toastMessage.isError
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-inverse-surface text-inverse-on-surface border-outline-variant/30"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {toastMessage.isError ? "error" : "check_circle"}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUser;

