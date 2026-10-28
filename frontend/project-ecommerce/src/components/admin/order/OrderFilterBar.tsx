import React from "react";

interface OrderFilterBarProps {
  searchQuery: string;
  dateRange: string;
  paymentMethod: string;
  vendor: string;
  courier: string;
  onSearchChange: (q: string) => void;
  onDateRangeChange: (r: string) => void;
  onPaymentMethodChange: (pm: string) => void;
  onVendorChange: (v: string) => void;
  onCourierChange: (c: string) => void;
  onClearFilters: () => void;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  searchQuery,
  dateRange,
  paymentMethod,
  vendor,
  courier,
  onSearchChange,
  onDateRangeChange,
  onPaymentMethodChange,
  onVendorChange,
  onCourierChange,
  onClearFilters,
}) => {
  // Count active non-default filters
  let activeFilterCount = 0;
  if (searchQuery.trim() !== "") activeFilterCount++;
  if (dateRange !== "all") activeFilterCount++;
  if (paymentMethod !== "all") activeFilterCount++;
  if (vendor !== "all") activeFilterCount++;
  if (courier !== "all") activeFilterCount++;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order ID (#ORD-XXXX), Customer name, Phone..."
            className="w-full h-11 pl-10 pr-20 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              K
            </kbd>
          </div>
        </div>

        {/* Filters Group */}
        <div className="md:col-span-8 flex flex-wrap lg:flex-nowrap items-center gap-2 justify-end">
          {/* Date Selector */}
          <div className="relative min-w-[150px]">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl appearance-none font-label-md text-label-md cursor-pointer focus:outline-none"
            >
              <option value="today">Today (Oct 27)</option>
              <option value="7d">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="all">All Dates</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              calendar_today
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Payment Method */}
          <div className="relative min-w-[160px]">
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl appearance-none font-label-md text-label-md cursor-pointer focus:outline-none"
            >
              <option value="all">All Payments</option>
              <option value="cod">COD Only (89%)</option>
              <option value="momo">MoMo</option>
              <option value="visa">Visa / Mastercard</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              payments
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Vendor Selection */}
          <div className="relative min-w-[150px]">
            <select
              value={vendor}
              onChange={(e) => onVendorChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl appearance-none font-label-md text-label-md cursor-pointer focus:outline-none"
            >
              <option value="all">All Vendors</option>
              <option value="UrbanStep Official">UrbanStep Official</option>
              <option value="Crafted Saigon">Crafted Saigon</option>
              <option value="Terra Living Lab">Terra Living Lab</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              store
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Courier Partner */}
          <div className="relative min-w-[140px]">
            <select
              value={courier}
              onChange={(e) => onCourierChange(e.target.value)}
              className="w-full h-11 pl-9 pr-8 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl appearance-none font-label-md text-label-md cursor-pointer focus:outline-none"
            >
              <option value="all">All Couriers</option>
              <option value="ghtk">GHTK Express</option>
              <option value="ghn">GHN Logistics</option>
              <option value="viettel_post">Viettel Post</option>
            </select>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              local_shipping
            </span>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Clear Reset */}
          <button
            type="button"
            onClick={onClearFilters}
            className="h-11 px-3.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-xl transition-colors font-label-md text-label-md flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            <span>Clear ({activeFilterCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilterBar;
