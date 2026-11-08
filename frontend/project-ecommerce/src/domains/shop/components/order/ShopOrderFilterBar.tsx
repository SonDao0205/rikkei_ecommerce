import React from "react";

interface ShopOrderFilterBarProps {
  searchQuery: string;
  dateRange: string;
  paymentMethod: string;
  courier: string;
  onSearchChange: (q: string) => void;
  onDateRangeChange: (r: string) => void;
  onPaymentMethodChange: (pm: string) => void;
  onCourierChange: (c: string) => void;
  onClearFilters: () => void;
}

export const ShopOrderFilterBar: React.FC<ShopOrderFilterBarProps> = ({
  searchQuery,
  dateRange,
  paymentMethod,
  courier,
  onSearchChange,
  onDateRangeChange,
  onPaymentMethodChange,
  onCourierChange,
  onClearFilters,
}) => {
  const isFiltered =
    Boolean(searchQuery) ||
    dateRange !== "all" ||
    paymentMethod !== "all" ||
    courier !== "all";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[280px] max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm mã đơn, tên khách, SĐT, mã vận đơn..."
          className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 outline-none focus:border-primary shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Filter */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-3 py-2 bg-surface-container-lowest rounded-xl font-label-md text-label-md text-on-surface border border-outline-variant/30 outline-none focus:border-primary shadow-2xs cursor-pointer"
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
        </select>

        {/* Payment Method */}
        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className="px-3 py-2 bg-surface-container-lowest rounded-xl font-label-md text-label-md text-on-surface border border-outline-variant/30 outline-none focus:border-primary shadow-2xs cursor-pointer"
        >
          <option value="all">Mọi phương thức</option>
          <option value="COD">Thanh toán COD</option>
          <option value="MOMO">Ví MoMo</option>
          <option value="VISA">Thẻ Quốc tế (Visa)</option>
        </select>

        {/* Courier */}
        <select
          value={courier}
          onChange={(e) => onCourierChange(e.target.value)}
          className="px-3 py-2 bg-surface-container-lowest rounded-xl font-label-md text-label-md text-on-surface border border-outline-variant/30 outline-none focus:border-primary shadow-2xs cursor-pointer"
        >
          <option value="all">Tất cả đơn vị vận chuyển</option>
          <option value="GHN">Giao Hàng Nhanh (GHN)</option>
          <option value="VIETTEL_POST">Viettel Post</option>
          <option value="SPX">SPX Express</option>
          <option value="GHTK">GHTK</option>
        </select>

        {/* Clear Filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-error hover:bg-error/10 font-label-md text-label-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

