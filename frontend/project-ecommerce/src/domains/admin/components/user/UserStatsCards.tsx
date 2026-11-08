import React from "react";
import type { AdminUserStats } from "@/domains/admin/types/adminUser.types";

interface UserStatsCardsProps {
  stats: AdminUserStats;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} đang hoạt động`,
      icon: "group",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-200",
      borderAccent: "border-l-4 border-l-blue-500",
    },
    {
      title: "Khách hàng (Client)",
      value: stats.clientUsers,
      subtext: "Người mua hàng trên sàn",
      icon: "shopping_cart",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      borderAccent: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Chủ gian hàng (Seller)",
      value: stats.sellerUsers,
      subtext: "Người bán đã kích hoạt",
      icon: "storefront",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-200",
      borderAccent: "border-l-4 border-l-purple-500",
    },
    {
      title: "Tài khoản bị khoá",
      value: stats.lockedUsers,
      subtext: "Cần xử lý vi phạm",
      icon: "lock",
      iconBg: "bg-rose-50 text-rose-600 border border-rose-200",
      borderAccent: "border-l-4 border-l-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-start justify-between ${card.borderAccent} transition-all hover:shadow-md`}
        >
          <div className="space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {card.title}
            </span>
            <div className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {card.value}
            </div>
            <p className="font-body-xs text-body-xs text-on-surface-variant">
              {card.subtext}
            </p>
          </div>
          <div className={`p-3 rounded-xl shadow-xs ${card.iconBg}`}>
            <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

