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
  const safeCounts = counts ?? {
    all: 0,
    pending: 0,
    packing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };

  const tabs: Array<{
    id: ShopOrderStatus;
    label: string;
    count: number;
    badgeColor?: string;
  }> = [
    { id: "all", label: "Tất cả", count: safeCounts.all ?? 0 },
    {
      id: "pending",
      label: "Chờ xác nhận",
      count: safeCounts.pending ?? 0,
      badgeColor: (safeCounts.pending ?? 0) > 0 ? "bg-error text-white font-bold" : undefined,
    },
    {
      id: "packing",
      label: "Chuẩn bị hàng",
      count: safeCounts.packing ?? 0,
      badgeColor: (safeCounts.packing ?? 0) > 0 ? "bg-amber-100 text-amber-800 font-bold" : undefined,
    },
    {
      id: "shipping",
      label: "Đang giao",
      count: safeCounts.shipping ?? 0,
      badgeColor: (safeCounts.shipping ?? 0) > 0 ? "bg-sky-100 text-sky-800" : undefined,
    },
    {
      id: "delivered",
      label: "Đã giao",
      count: safeCounts.delivered ?? 0,
      badgeColor: (safeCounts.delivered ?? 0) > 0 ? "bg-emerald-100 text-emerald-800" : undefined,
    },
    { id: "cancelled", label: "Đã huỷ", count: safeCounts.cancelled ?? 0 },
    { id: "returned", label: "Trả hàng/Hoàn tiền", count: safeCounts.returned ?? 0 },
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

