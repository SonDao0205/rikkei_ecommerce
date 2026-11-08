import React from "react";
import type { ShopOrderStatus, ShopOrderStatusCounts } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderStatusTabsProps {
  currentTab: ShopOrderStatus;
  counts: ShopOrderStatusCounts;
  onTabChange: (tab: ShopOrderStatus) => void;
}

export const ShopOrderStatusTabs: React.FC<ShopOrderStatusTabsProps> = ({
  currentTab,
  counts,
  onTabChange,
}) => {
  const tabs: Array<{
    id: ShopOrderStatus;
    label: string;
    count: number;
    badgeColor?: string;
  }> = [
    { id: "all", label: "Tất cả", count: counts.all },
    {
      id: "pending",
      label: "Chờ xác nhận",
      count: counts.pending,
      badgeColor: counts.pending > 0 ? "bg-error text-white font-bold" : undefined,
    },
    {
      id: "packing",
      label: "Đang chuẩn bị hàng",
      count: counts.packing,
      badgeColor: counts.packing > 0 ? "bg-amber-100 text-amber-800 font-bold" : undefined,
    },
    {
      id: "shipping",
      label: "Đang giao",
      count: counts.shipping,
      badgeColor: counts.shipping > 0 ? "bg-sky-100 text-sky-800" : undefined,
    },
    {
      id: "delivered",
      label: "Đã giao",
      count: counts.delivered,
      badgeColor: counts.delivered > 0 ? "bg-emerald-100 text-emerald-800" : undefined,
    },
    { id: "cancelled", label: "Đã huỷ", count: counts.cancelled },
    { id: "returned", label: "Trả hàng/Hoàn tiền", count: counts.returned },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-outline-variant/30 overflow-x-auto scrollbar-none py-1">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? "border-primary text-primary font-bold"
                : "border-transparent text-outline hover:text-on-surface hover:border-outline-variant"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                tab.badgeColor
                  ? tab.badgeColor
                  : isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-container text-outline"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

