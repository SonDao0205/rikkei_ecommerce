import React from "react";
import type { AdminUserItem } from "@/domains/admin/types/adminUser.types";

interface UserDetailDrawerProps {
  isOpen: boolean;
  user: AdminUserItem | null;
  onClose: () => void;
  onEdit: (user: AdminUserItem) => void;
  onLock: (user: AdminUserItem) => void;
  onUnlock: (id: string) => void;
  onResetPassword: (user: AdminUserItem) => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onEdit,
  onLock,
  onUnlock,
  onResetPassword,
}) => {
  if (!isOpen || !user) return null;

  const formatVnd = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant/30">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">
                badge
              </span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Hồ sơ người dùng
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0 border-2 border-primary/20">
                  {initials}
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface truncate">
                  {user.fullName}
                </h3>
                <div className="text-xs font-mono text-on-surface-variant">
                  ID: {user.id}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        role === "admin"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : role === "seller"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {role === "admin" ? "Admin" : role === "seller" ? "Người bán" : "Khách hàng"}
                    </span>
                  ))}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : user.status === "LOCKED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {user.status === "ACTIVE"
                      ? "Đang hoạt động"
                      : user.status === "LOCKED"
                      ? "Bị khoá"
                      : "Chờ duyệt"}
                  </span>
                </div>
              </div>
            </div>

            {/* Locked Warning */}
            {user.status === "LOCKED" && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-sm text-rose-900">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span>Tài khoản đang bị khoá</span>
                </div>
                <p className="text-xs leading-relaxed">
                  <strong>Lý do:</strong> {user.lockReason || "Vi phạm điều khoản dịch vụ"}
                </p>
                {user.lockedAt && (
                  <p className="text-[11px] text-rose-700">
                    Khoá lúc: {formatDate(user.lockedAt)}
                  </p>
                )}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onUnlock(user.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-rose-100/60 text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">lock_open</span>
                    <span>Mở khoá tài khoản ngay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Section: Thông tin tài khoản */}
            <div className="space-y-3">
              <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">
                Thông tin liên hệ &amp; Bảo mật
              </h4>
              <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 space-y-3 text-body-sm text-body-sm">
                <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Email:</span>
                  <div className="flex items-center gap-1 font-medium text-on-surface">
                    <span>{user.email}</span>
                    {user.emailVerified ? (
                      <span className="material-symbols-outlined text-[16px] text-emerald-600" title="Đã xác thực">
                        verified
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-amber-500" title="Chưa xác thực">
                        warning
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Số điện thoại:</span>
                  <div className="flex items-center gap-1 font-medium text-on-surface">
                    <span>{user.phone}</span>
                    {user.phoneVerified && (
                      <span className="material-symbols-outlined text-[16px] text-emerald-600" title="Đã xác thực">
                        verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Ngày đăng ký:</span>
                  <span className="font-medium text-on-surface">{formatDate(user.createdAt)}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-on-surface-variant">Đăng nhập gần nhất:</span>
                  <span className="font-medium text-on-surface">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Chưa ghi nhận"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section: Hoạt động & Mua sắm */}
            <div className="space-y-3">
              <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">
                Dữ liệu mua sắm
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">Tổng số đơn</span>
                  <div className="text-lg font-bold text-on-surface">{user.totalOrders} đơn</div>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 space-y-1">
                  <span className="text-xs text-on-surface-variant font-medium">Tổng chi tiêu</span>
                  <div className="text-lg font-bold text-emerald-700">{formatVnd(user.totalSpent)}</div>
                </div>
              </div>
            </div>

            {/* Section: Thông tin Shop (nếu có) */}
            {user.shopName && (
              <div className="space-y-3">
                <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">
                  Gian hàng liên kết
                </h4>
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900">{user.shopName}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">
                      {user.shopStatus || "ACTIVE"}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700">
                    Người dùng này được cấp quyền Người bán (Seller) và sở hữu gian hàng trên MarketPulse.
                  </p>
                </div>
              </div>
            )}

            {/* Section: Sổ địa chỉ */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wide">
                  Sổ địa chỉ ({user.addresses.length})
                </h4>
                <div className="space-y-2">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-on-surface">
                        <span>{addr.recipientName} ({addr.phone})</span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface-variant">{addr.fullAddress}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onResetPassword(user)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Reset Mật khẩu</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                <span>Chỉnh sửa</span>
              </button>

              {user.status === "LOCKED" ? (
                <button
                  type="button"
                  onClick={() => onUnlock(user.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Mở khoá</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onLock(user)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Khoá tài khoản</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

