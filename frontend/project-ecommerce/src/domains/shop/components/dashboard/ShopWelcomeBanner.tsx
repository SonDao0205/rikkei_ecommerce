import React from "react";
import type { ShopDateFilter, ShopOperationalInfo } from "@/domains/shop/types/shopDashboard.types";

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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-outline-variant/30">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {shopInfo.tierBadge}
          </span>
          <span className="text-outline font-body-sm text-body-sm">
            • Mã gian hàng: <strong className="text-on-surface font-mono">{shopInfo.shopCode}</strong>
          </span>
          <span className="text-outline font-body-sm text-body-sm">
            • Đồng bộ lúc: {shopInfo.lastSyncTime}
          </span>
        </div>

        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Xin chào, {shopInfo.shopName}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Chỉ số vận hành hệ thống:{" "}
          <strong className="text-on-surface font-semibold">{shopInfo.operationalStatusText}</strong>
        </p>
      </div>

      {/* Toolbar Filters & Refresh matching DashboardHeader */}
      <div className="flex items-center flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-sm border border-outline-variant/30">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilterChange(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors shadow-sm cursor-pointer"
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu"
        >
          <span className={`material-symbols-outlined text-[20px] ${isLoading ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>
      </div>
    </div>
  );
};

export default ShopWelcomeBanner;
