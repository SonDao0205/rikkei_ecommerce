import React from "react";
import type { AdminUserStatus } from "@/domains/admin/types/adminUser.types";

interface UserFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: "all" | AdminUserStatus;
  onStatusChange: (status: "all" | AdminUserStatus) => void;
  sortBy: "newest" | "oldest" | "totalSpent" | "totalOrders" | "name";
  onSortByChange: (sortBy: "newest" | "oldest" | "totalSpent" | "totalOrders" | "name") => void;
  onResetFilters: () => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search.trim()) || status !== "all" || sortBy !== "newest";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT, tên shop..."
            className="w-full pl-10 pr-9 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:border-primary transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[170px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            verified_user
          </span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as "all" | AdminUserStatus)}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer appearance-none transition-all"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Bị khoá</option>
            <option value="PENDING">Chờ xác thực</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
            expand_more
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            sort
          </span>
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as "newest" | "oldest" | "totalSpent" | "totalOrders" | "name"
              )
            }
            className="w-full pl-9 pr-8 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer appearance-none transition-all"
          >
            <option value="newest">Mới đăng ký nhất</option>
            <option value="oldest">Đăng ký cũ nhất</option>
            <option value="totalSpent">Chi tiêu cao nhất</option>
            <option value="totalOrders">Nhiều đơn hàng nhất</option>
            <option value="name">Tên A → Z</option>
          </select>
          <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
            expand_more
          </span>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-primary hover:bg-primary/5 rounded-xl font-label-sm text-label-sm font-semibold transition-colors cursor-pointer self-end md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
};

