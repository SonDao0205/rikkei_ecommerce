import React from "react";
import type { AdminProductStatusTab, ProductStatusCounts } from "@/shared/types";

interface ProductStatusTabsProps {
  currentTab?: AdminProductStatusTab;
  counts?: ProductStatusCounts;
  onTabChange: (tab: AdminProductStatusTab) => void;
}

export const ProductStatusTabs: React.FC<ProductStatusTabsProps> = ({
  currentTab = "all",
  counts,
  onTabChange,
}) => {
  const normTab = (currentTab || "all").toLowerCase();
  const tabs: Array<{
    value: AdminProductStatusTab;
    label: string;
    count: number;
    badgeClass?: string;
    icon?: string;
  }> = [
    {
      value: "all",
      label: "Tất cả",
      count: counts?.all ?? 0,
      icon: "inventory_2",
    },
    {
      value: "pending",
      label: "Chờ duyệt",
      count: counts?.pending ?? 0,
      badgeClass:
        (counts?.pending ?? 0) > 0
          ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
          : "bg-surface-container text-on-surface",
      icon: "pending_actions",
    },
    {
      value: "active",
      label: "Đang hoạt động",
      count: counts?.active ?? 0,
      badgeClass: "bg-emerald-50 text-emerald-800 font-semibold",
      icon: "check_circle",
    },
    {
      value: "inactive",
      label: "Đang tắt",
      count: counts?.inactive ?? 0,
      icon: "pause_circle",
    },
    {
      value: "rejected",
      label: "Bị từ chối",
      count: counts?.rejected ?? 0,
      badgeClass:
        (counts?.rejected ?? 0) > 0
          ? "bg-rose-100 text-rose-800 font-semibold"
          : "bg-surface-container text-on-surface",
      icon: "cancel",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-4">
      {tabs.map((tab) => {
        const isActive = normTab === tab.value;
        const isPendingWithItems = tab.value === "pending" && tab.count > 0;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              isActive
                ? tab.value === "pending"
                  ? "bg-amber-500/10 text-amber-900 shadow-sm font-bold ring-1 ring-amber-500/40"
                  : "bg-surface-container-lowest text-primary shadow-sm font-bold ring-1 ring-primary/20"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            {tab.icon && (
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive
                    ? tab.value === "pending"
                      ? "text-amber-700"
                      : "text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                tab.badgeClass || "bg-surface-container text-on-surface font-semibold"
              }`}
            >
              {tab.count}
            </span>
            {isPendingWithItems && !isActive && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProductStatusTabs;

