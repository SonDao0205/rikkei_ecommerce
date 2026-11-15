import React from "react";
import type { VoucherFilterCategory } from "@/domains/shop/types/shopVoucher.types";

interface ShopVoucherFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: VoucherFilterCategory;
  onTypeFilterChange: (type: VoucherFilterCategory) => void;
  onResetFilters: () => void;
}

export const ShopVoucherFilterBar: React.FC<ShopVoucherFilterBarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search.trim()) || typeFilter !== "all";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo mã voucher hoặc tên ưu đãi..."
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

        {/* Type Filter Select */}
        <div className="relative min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            filter_list
          </span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as VoucherFilterCategory)}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer appearance-none transition-all"
          >
            <option value="all">Tất cả loại voucher</option>
            <option value="money">Giảm tiền mặt (₫)</option>
            <option value="percent">Giảm phần trăm (%)</option>
            <option value="shipping">Miễn phí vận chuyển (Freeship)</option>
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
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-primary hover:bg-primary/5 rounded-xl font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
};

