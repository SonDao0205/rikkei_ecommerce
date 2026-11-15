import React from "react";
import type { AdminUserRoleTab, AdminUserStats } from "@/domains/admin/types/adminUser.types";

interface TabConfig {
  id: AdminUserRoleTab;
  label: string;
}

const TABS: TabConfig[] = [
  { id: "all", label: "Tất cả" },
  { id: "client", label: "Khách hàng" },
  { id: "seller", label: "Người bán (Shop)" },
  { id: "admin", label: "Quản trị viên" },
  { id: "locked", label: "Bị khoá" },
];

interface UserRoleTabsProps {
  currentTab: AdminUserRoleTab;
  onSelectTab: (tab: AdminUserRoleTab) => void;
  stats: AdminUserStats;
}

export const UserRoleTabs: React.FC<UserRoleTabsProps> = ({
  currentTab,
  onSelectTab,
  stats,
}) => {
  const getCount = (tab: AdminUserRoleTab) => {
    switch (tab) {
      case "all":
        return stats.totalUsers;
      case "client":
        return stats.clientUsers;
      case "seller":
        return stats.sellerUsers;
      case "admin":
        return stats.adminUsers;
      case "locked":
        return stats.lockedUsers;
    }
  };

  return (
    <div className="flex border-b border-outline-variant/30 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        const count = getCount(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
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

