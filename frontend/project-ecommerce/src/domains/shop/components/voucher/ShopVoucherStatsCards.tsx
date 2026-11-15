import React from "react";
import type { ShopVoucherStats } from "@/domains/shop/types/shopVoucher.types";

interface ShopVoucherStatsCardsProps {
  stats: ShopVoucherStats;
}

export const ShopVoucherStatsCards: React.FC<ShopVoucherStatsCardsProps> = ({ stats }) => {
  const formatVnd = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  };

  const cards = [
    {
      title: "Voucher đang chạy",
      value: `${stats.activeCount} mã`,
      subtext: "Đang mở cho người mua",
      icon: "confirmation_number",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs",
      borderAccent: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Lượt đã sử dụng",
      value: `${stats.totalUsage} lượt`,
      subtext: "Đã áp dụng thành công",
      icon: "shopping_bag",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-200 shadow-xs",
      borderAccent: "border-l-4 border-l-blue-500",
    },
    {
      title: "Doanh số từ voucher",
      value: formatVnd(stats.voucherRevenue),
      subtext: "Tổng giá trị đơn có voucher",
      icon: "trending_up",
      iconBg: "bg-purple-50 text-purple-600 border border-purple-200 shadow-xs",
      borderAccent: "border-l-4 border-l-purple-500",
    },
    {
      title: "Chi phí trợ giá",
      value: formatVnd(stats.discountSpent),
      subtext: "Ngân sách ưu đãi đã chi",
      icon: "savings",
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200 shadow-xs",
      borderAccent: "border-l-4 border-l-amber-500",
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
          <div className={`p-3 rounded-xl ${card.iconBg}`}>
            <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

