import React from "react";
import type { ShopMetricStats, AdminShopStatus } from "../../../types/ecommerce";

interface ShopStatusTabsProps {
  currentTab?: AdminShopStatus;
  counts?: ShopMetricStats["statusCounts"];
  onTabChange: (tab: AdminShopStatus) => void;
}

export const ShopStatusTabs: React.FC<ShopStatusTabsProps> = ({
  currentTab = "all",
  counts = { all: 0, active: 0, pending: 0, suspended: 0 },
  onTabChange,
}) => {
  const normTab = (currentTab || "all").toLowerCase();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {/* Tab: All Shops */}
      <button
        type="button"
        onClick={() => onTabChange("all")}
        className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
          normTab === "all"
            ? "bg-surface-container-lowest text-primary shadow-sm font-bold ring-1 ring-primary/20"
            : "text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        <span>All Shops</span>
        <span
          className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${
            normTab === "all"
              ? "bg-primary-container text-on-primary font-bold"
              : "bg-surface-container text-on-surface font-normal"
          }`}
        >
          {counts.all}
        </span>
      </button>

      {/* Tab: Active / Verified */}
      <button
        type="button"
        onClick={() => onTabChange("active")}
        className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
          normTab === "active"
            ? "bg-surface-container-lowest text-primary shadow-sm font-bold ring-1 ring-primary/20"
            : "text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        <span>Active / Verified</span>
        <span
          className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${
            normTab === "active"
              ? "bg-secondary text-on-secondary font-bold"
              : "bg-surface-container text-on-surface font-normal"
          }`}
        >
          {counts.active}
        </span>
      </button>

      {/* Tab: Pending Approval */}
      <button
        type="button"
        onClick={() => onTabChange("pending")}
        className={`relative px-4 py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
          normTab === "pending"
            ? "bg-surface-container-lowest text-primary shadow-sm font-bold ring-1 ring-primary/20"
            : "text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        {counts.pending > 0 && (
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping" />
        )}
        <span>Pending Approval</span>
        <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
          {counts.pending}
        </span>
      </button>

      {/* Tab: Suspended / Locked */}
      <button
        type="button"
        onClick={() => onTabChange("suspended")}
        className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
          normTab === "suspended"
            ? "bg-surface-container-lowest text-error shadow-sm font-bold ring-1 ring-error/20"
            : "text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        <span>Suspended / Locked</span>
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">
          {counts.suspended}
        </span>
      </button>
    </div>
  );
};

export default ShopStatusTabs;
