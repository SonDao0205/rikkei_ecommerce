import React from "react";
import type { ShopVoucherStatus } from "@/domains/shop/types/shopVoucher.types";

interface TabItem {
  id: ShopVoucherStatus;
  label: string;
}

const TABS: TabItem[] = [
  { id: "all", label: "Tất cả" },
  { id: "ongoing", label: "Đang diễn ra" },
  { id: "upcoming", label: "Sắp diễn ra" },
  { id: "expired", label: "Đã kết thúc" },
  { id: "paused", label: "Đã tạm dừng" },
];

interface ShopVoucherTabsProps {
  currentTab: ShopVoucherStatus;
  onTabChange: (tab: ShopVoucherStatus) => void;
  tabCounts: Record<ShopVoucherStatus, number>;
}

export const ShopVoucherTabs: React.FC<ShopVoucherTabsProps> = ({
  currentTab,
  onTabChange,
  tabCounts,
}) => {
  return (
    <div className="flex border-b border-outline-variant/30 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const count = tabCounts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-3 px-4 font-label-md text-label-md font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "border-primary text-primary bg-primary/5 rounded-t-xl"
                : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 rounded-t-xl"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

