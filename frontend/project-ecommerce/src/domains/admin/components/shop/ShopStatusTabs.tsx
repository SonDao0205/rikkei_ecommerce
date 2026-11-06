import React from "react";
import type { ShopMetricStats, AdminShopStatus } from "@/domains/admin/types";

interface ShopStatusTabsProps {
  currentTab?: AdminShopStatus;
  counts?: ShopMetricStats["statusCounts"];
  onTabChange: (tab: AdminShopStatus) => void;
}

export const ShopStatusTabs: React.FC<ShopStatusTabsProps> = ({
  currentTab = "all",
  counts,
  onTabChange,
}) => {
  const normTab = (currentTab || "all").toLowerCase();
  const tabs: { value: AdminShopStatus; label: string; count: number; style?: string }[] = [
    { value: "all", label: "Tất cả", count: counts?.all ?? 0 },
    { value: "active", label: "Đang hoạt động", count: counts?.active ?? 0 },
    { value: "pending", label: "Chờ duyệt", count: counts?.pending ?? 0 },
    { value: "needs_info", label: "Cần bổ sung", count: counts?.needs_info ?? 0 },
    { value: "suspended", label: "Đình chỉ", count: counts?.suspended ?? 0, style: "text-error" },
    { value: "rejected", label: "Từ chối", count: counts?.rejected ?? 0 },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            normTab === tab.value
              ? `bg-surface-container-lowest ${tab.style || "text-primary"} shadow-sm font-bold ring-1 ring-primary/20`
              : `${tab.style || "text-on-surface-variant"} hover:bg-surface-container`
          }`}
        >
          <span>{tab.label}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface text-[11px] font-semibold">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ShopStatusTabs;
