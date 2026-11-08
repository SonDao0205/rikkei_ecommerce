import React from "react";
import type {
  AdminUserItem,
  AdminUserRole,
  AdminUserStatus,
} from "@/domains/admin/types/adminUser.types";

interface UserTableProps {
  users: AdminUserItem[];
  selectedIds: string[];
  isLoading: boolean;
  onToggleSelect: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetail: (user: AdminUserItem) => void;
  onEdit: (user: AdminUserItem) => void;
  onLock: (user: AdminUserItem) => void;
  onUnlock: (id: string) => void;
  onResetPassword: (user: AdminUserItem) => void;
  onOpenCreate: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedIds,
  isLoading,
  onToggleSelect,
  onSelectAll,
  onViewDetail,
  onEdit,
  onLock,
  onUnlock,
  onResetPassword,
  onOpenCreate,
}) => {
  const isAllSelected = users.length > 0 && selectedIds.length === users.length;

  const formatVnd = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: AdminUserRole) => {
    switch (role) {
      case "admin":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[13px]">shield_person</span>
            Admin
          </span>
        );
      case "seller":
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300 shadow-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[13px]">storefront</span>
            Người bán
          </span>
        );
      case "client":
      default:
        return (
          <span
            key={role}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-300 shadow-xs whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[13px]">person</span>
            Khách hàng
          </span>
        );
    }
  };

  const getStatusBadge = (status: AdminUserStatus, lockReason?: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Hoạt động</span>
          </span>
        );
      case "LOCKED":
        return (
          <div className="group relative inline-block">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-xs whitespace-nowrap cursor-help">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Bị khoá</span>
              <span className="material-symbols-outlined text-[14px]">info</span>
            </span>
            {lockReason && (
              <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-52 p-2 bg-inverse-surface text-inverse-on-surface text-xs rounded-lg shadow-xl z-20">
                <span className="font-semibold block mb-0.5">Lý do khoá:</span>
                {lockReason}
              </div>
            )}
          </div>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Chờ duyệt</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Đang tải danh sách người dùng...
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">group_off</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-1">
          Không tìm thấy người dùng phù hợp
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Không có tài khoản nào khớp với điều kiện lọc hoặc từ khoá tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc thêm tài khoản mới.
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          <span>Thêm người dùng mới</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/60 border-b border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 font-semibold min-w-[240px]">Người dùng</th>
              <th className="py-3.5 px-3 font-semibold min-w-[200px]">Liên hệ</th>
              <th className="py-3.5 px-3 font-semibold min-w-[170px]">Vai trò</th>
              <th className="py-3.5 px-3 font-semibold min-w-[150px]">Hoạt động</th>
              <th className="py-3.5 px-2.5 font-semibold min-w-[130px]">Tham gia</th>
              <th className="py-3.5 px-3 font-semibold min-w-[140px]">Trạng thái</th>
              <th className="py-3.5 px-4 font-semibold text-center min-w-[160px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
            {users.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              const initials = user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(-2)
                .join("")
                .toUpperCase();

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-surface-container-low/40 transition-colors ${
                    isSelected ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-4 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(user.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>

                  {/* Người dùng */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                          {initials}
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <div
                          onClick={() => onViewDetail(user)}
                          className="font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer line-clamp-1"
                          title={user.fullName}
                        >
                          {user.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono">
                          <span>{user.id}</span>
                          {user.shopName && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[11px] font-sans font-medium bg-purple-50 text-purple-700 border border-purple-200 line-clamp-1 max-w-[120px]"
                              title={`Shop: ${user.shopName}`}
                            >
                              🏪 {user.shopName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Liên hệ */}
                  <td className="py-4 px-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-on-surface">
                        <span className="line-clamp-1 font-medium">{user.email}</span>
                        {user.emailVerified && (
                          <span
                            className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0"
                            title="Email đã xác thực"
                          >
                            verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-on-surface-variant">{user.phone}</div>
                    </div>
                  </td>

                  {/* Vai trò */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {user.roles.map((r) => getRoleBadge(r))}
                    </div>
                  </td>

                  {/* Hoạt động */}
                  <td className="py-4 px-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-on-surface">
                        {formatVnd(user.totalSpent)}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {user.totalOrders} đơn hàng
                      </div>
                    </div>
                  </td>

                  {/* Ngày tham gia */}
                  <td className="py-4 px-2.5">
                    <div className="space-y-0.5 text-xs text-on-surface-variant whitespace-nowrap">
                      <div className="font-medium text-on-surface">
                        {formatDate(user.createdAt)}
                      </div>
                      {user.lastLoginAt ? (
                        <div>Online: {formatDate(user.lastLoginAt)}</div>
                      ) : (
                        <div className="text-outline">Chưa online</div>
                      )}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-3 whitespace-nowrap">
                    {getStatusBadge(user.status, user.lockReason)}
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Xem chi tiết */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(user)}
                        title="Xem chi tiết hồ sơ"
                        className="p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>

                      {/* Sửa thông tin */}
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        title="Chỉnh sửa thông tin / vai trò"
                        className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>

                      {/* Đặt lại mật khẩu */}
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        title="Tạo mật khẩu tạm thời"
                        className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">key</span>
                      </button>

                      {/* Khoá / Mở khoá */}
                      {user.status === "LOCKED" ? (
                        <button
                          type="button"
                          onClick={() => onUnlock(user.id)}
                          title="Mở khoá tài khoản"
                          className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock_open</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onLock(user)}
                          title="Khoá tài khoản"
                          className="p-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

