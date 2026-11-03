import React from "react";
import type { ShopDateFilter, ShopOperationalInfo } from "../../../types/shop/shopDashboard.types";

interface ShopWelcomeBannerProps {
  shopInfo: ShopOperationalInfo;
  activeFilter: ShopDateFilter;
  onFilterChange: (filter: ShopDateFilter) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const FILTER_OPTIONS: { id: ShopDateFilter; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "yesterday", label: "Hôm qua" },
  { id: "7days", label: "7 ngày qua" },
  { id: "this_month", label: "Tháng này" },
];

export const ShopWelcomeBanner: React.FC<ShopWelcomeBannerProps> = ({
  shopInfo,
  activeFilter,
  onFilterChange,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
      {/* Left Shop Welcome Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[32px]">storefront</span>
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Xin chào, {shopInfo.shopName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {shopInfo.tierBadge}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              Vận hành:{" "}
              <strong className="text-on-surface font-label-md text-label-md">
                {shopInfo.operationalStatusText}
              </strong>
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span>
              Mã gian hàng: <strong className="text-on-surface">{shopInfo.shopCode}</strong>
            </span>
            <span className="hidden sm:inline text-outline-variant">•</span>
            <span className="flex items-center gap-1 text-outline">
              <span className={`material-symbols-outlined text-[16px] ${isLoading ? "animate-spin" : ""}`}>
                sync
              </span>
              Đồng bộ lúc: {shopInfo.lastSyncTime}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Date Filter Bar */}
      <div className="flex flex-wrap items-center gap-space-xs bg-surface-container-low p-1.5 rounded-lg self-start xl:self-center">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
                isActive
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu"
        >
          <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>
      </div>
    </div>
  );
};
export default ShopWelcomeBanner;

