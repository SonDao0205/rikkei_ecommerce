import React from "react";
import { useTranslation } from "react-i18next";
import type { ShopDateFilter, ShopOperationalInfo } from "@/domains/shop/types/shopDashboard.types";

interface ShopWelcomeBannerProps {
  shopInfo: ShopOperationalInfo;
  activeFilter: ShopDateFilter;
  onFilterChange: (filter: ShopDateFilter) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const ShopWelcomeBanner: React.FC<ShopWelcomeBannerProps> = ({
  shopInfo,
  activeFilter,
  onFilterChange,
  onRefresh,
  isLoading = false,
}) => {
  const { t } = useTranslation('shop');

  const filterOptions: { id: ShopDateFilter; label: string }[] = [
    { id: "today", label: t("dashboard.welcome.filters.today") },
    { id: "yesterday", label: t("dashboard.welcome.filters.yesterday") },
    { id: "7days", label: t("dashboard.welcome.filters.7days") },
    { id: "this_month", label: t("dashboard.welcome.filters.this_month") },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-outline-variant/30">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {shopInfo.tierBadge}
          </span>
          <span className="text-outline font-body-sm text-body-sm">
            • {t("dashboard.welcome.code", { code: shopInfo.shopCode })}
          </span>
          <span className="text-outline font-body-sm text-body-sm">
            • {t("dashboard.welcome.synced_at", { time: shopInfo.lastSyncTime })}
          </span>
        </div>

        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          {t("dashboard.welcome.greeting", { name: shopInfo.shopName })}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t("dashboard.welcome.operational_status")}{" "}
          <strong className="text-on-surface font-semibold">{shopInfo.operationalStatusText}</strong>
        </p>
      </div>

      {/* Toolbar Filters & Refresh matching DashboardHeader */}
      <div className="flex items-center flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-sm border border-outline-variant/30">
          {filterOptions.map((opt) => {
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
          title={t("dashboard.welcome.refresh")}
          aria-label={t("dashboard.welcome.refresh")}
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
