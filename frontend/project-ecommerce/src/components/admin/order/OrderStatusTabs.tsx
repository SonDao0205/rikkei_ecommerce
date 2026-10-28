import React from "react";
import type { OrderStatusCounts } from "../../../types/ecommerce";

interface OrderStatusTabsProps {
  activeTab: 'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled';
  counts: OrderStatusCounts;
  onTabChange: (tab: 'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled') => void;
}

export const OrderStatusTabs: React.FC<OrderStatusTabsProps> = ({
  activeTab,
  counts,
  onTabChange,
}) => {
  const tabs = [
    {
      id: "all" as const,
      label: "All Orders",
      count: counts.all,
      renderDot: () => null,
      badgeClass: "bg-white/20 text-on-primary",
    },
    {
      id: "pending" as const,
      label: "Pending Confirmation",
      count: counts.pending,
      renderDot: () => (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
        </span>
      ),
      badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed",
    },
    {
      id: "shipping" as const,
      label: "Processing & Shipping",
      count: counts.shipping,
      renderDot: () => <span className="w-2 h-2 rounded-full bg-secondary" />,
      badgeClass: "bg-secondary-fixed text-on-secondary-fixed",
    },
    {
      id: "delivered" as const,
      label: "Delivered & Completed",
      count: counts.delivered,
      renderDot: () => <span className="w-2 h-2 rounded-full bg-surface-tint" />,
      badgeClass: "bg-surface-container-high text-on-surface-variant",
    },
    {
      id: "cancelled" as const,
      label: "Cancelled / Returned",
      count: counts.cancelled,
      renderDot: () => <span className="w-2 h-2 rounded-full bg-error" />,
      badgeClass: "bg-error-container text-on-error-container",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`group inline-flex items-center gap-2.5 px-4 py-2 rounded-xl font-label-lg text-label-lg shadow-sm transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
            }`}
          >
            {tab.renderDot()}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                isActive ? "bg-white/20 text-on-primary" : tab.badgeClass
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

export default OrderStatusTabs;
