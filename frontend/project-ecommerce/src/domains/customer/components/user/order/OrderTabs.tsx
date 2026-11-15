import React from "react";
import { useTranslation } from "react-i18next";
import type {
  UserOrderStatusTab,
  UserOrderStatusCounts,
} from "@/domains/order/types";

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

export const OrderTabs: React.FC<OrderTabsProps> = ({
  currentTab,
  counts,
  onTabChange,
}) => {
  const { t } = useTranslation("customer");

  const tabs: TabConfig[] = [
    {
      key: "all",
      label: t("profile.orders.tabs.all"),
      countKey: "all",
      badgeColorClass: "bg-primary text-on-primary",
    },
    {
      key: "pending",
      label: t("profile.orders.tabs.pending"),
      countKey: "pending",
      badgeColorClass: "bg-amber-100 text-amber-900",
    },
    {
      key: "packing",
      label: t("profile.orders.tabs.packing"),
      countKey: "packing",
      badgeColorClass: "bg-blue-100 text-blue-900",
    },
    {
      key: "shipping",
      label: t("profile.orders.tabs.shipping"),
      countKey: "shipping",
      badgeColorClass: "bg-secondary-fixed text-on-secondary-fixed-variant",
    },
    {
      key: "completed",
      label: t("profile.orders.tabs.completed"),
      countKey: "completed",
      badgeColorClass: "bg-emerald-100 text-emerald-900",
    },
    {
      key: "cancelled",
      label: t("profile.orders.tabs.cancelled"),
      countKey: "cancelled",
      badgeColorClass: "bg-surface-container text-on-surface-variant",
    },
    {
      key: "returned",
      label: t("profile.orders.tabs.returned"),
      countKey: "returned",
      badgeColorClass: "bg-surface-container text-on-surface-variant",
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max px-2">
        {tabs.map((tab) => {
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
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTabs;
