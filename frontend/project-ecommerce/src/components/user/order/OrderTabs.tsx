import React from "react";
import type {
  UserOrderStatusTab,
  UserOrderStatusCounts,
} from "../../../types/order";

interface OrderTabsProps {
  currentTab: UserOrderStatusTab;
  counts: UserOrderStatusCounts;
  onTabChange: (tab: UserOrderStatusTab) => void;
}

interface TabConfig {
  key: UserOrderStatusTab;
  label: string;
  countKey?: keyof UserOrderStatusCounts;
  badgeColorClass?: string;
}

const TABS: TabConfig[] = [
  {
    key: "all",
    label: "Tất cả",
    countKey: "all",
    badgeColorClass: "bg-primary text-on-primary",
  },
  {
    key: "pending",
    label: "Chờ xác nhận",
    countKey: "pending",
    badgeColorClass: "bg-amber-100 text-amber-900",
  },
  {
    key: "packing",
    label: "Chờ lấy hàng",
    countKey: "packing",
    badgeColorClass: "bg-blue-100 text-blue-900",
  },
  {
    key: "shipping",
    label: "Đang vận chuyển",
    countKey: "shipping",
    badgeColorClass: "bg-secondary-fixed text-on-secondary-fixed-variant",
  },
  {
    key: "completed",
    label: "Hoàn thành",
    countKey: "completed",
    badgeColorClass: "bg-emerald-100 text-emerald-900",
  },
  {
    key: "cancelled",
    label: "Đã hủy",
    countKey: "cancelled",
    badgeColorClass: "bg-surface-container text-on-surface-variant",
  },
  {
    key: "returned",
    label: "Trả hàng / Hoàn tiền",
    countKey: "returned",
    badgeColorClass: "bg-surface-container text-on-surface-variant",
  },
];

export const OrderTabs: React.FC<OrderTabsProps> = ({
  currentTab,
  counts,
  onTabChange,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max px-2">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          const count = tab.countKey ? counts[tab.countKey] : 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3.5 font-label-lg text-label-lg relative transition-colors cursor-pointer ${
                isActive
                  ? "text-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface font-medium"
              }`}
            >
              <span>{tab.label}</span>

              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] leading-tight font-bold ${
                    tab.badgeColorClass || "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {count}
                </span>
              )}

              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTabs;
