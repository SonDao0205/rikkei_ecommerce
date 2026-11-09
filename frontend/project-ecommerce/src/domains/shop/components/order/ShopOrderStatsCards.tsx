import React from "react";
import type { ShopOrderStatusCounts, ShopOrderItem } from "@/domains/shop/types/shopOrder.types";

interface ShopOrderStatsCardsProps {
  counts: ShopOrderStatusCounts;
  orders: ShopOrderItem[];
  onSelectTab: (tab: "pending" | "packing" | "shipping" | "delivered") => void;
}

export const ShopOrderStatsCards: React.FC<ShopOrderStatsCardsProps> = ({
  counts,
  orders,
  onSelectTab,
}) => {
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.financial.shopPayout, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
      {/* 1. Chờ xác nhận */}
      <div
        onClick={() => onSelectTab("pending")}
        className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-error/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-outline font-medium">
            Chờ xác nhận
          </span>
          <div className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">notification_important</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            {counts.pending}
          </div>
          <div className="text-xs text-error font-medium mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">alarm</span>
            Cần xử lý giao hàng trước SLA
          </div>
        </div>
      </div>

      {/* 2. Đang chuẩn bị hàng */}
      <div
        onClick={() => onSelectTab("packing")}
        className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-outline font-medium">
            Đang đóng gói
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">package_2</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            {counts.packing}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            Chờ shipper đến lấy hàng
          </div>
        </div>
      </div>

      {/* 3. Đang giao hàng */}
      <div
        onClick={() => onSelectTab("shipping")}
        className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-sky-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-outline font-medium">
            Đang giao vận chuyển
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-headline-lg text-on-surface">
            {counts.shipping}
          </div>
          <div className="text-xs text-sky-700 font-medium mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">near_me</span>
            Đang trên đường giao khách
          </div>
        </div>
      </div>

      {/* 4. Doanh thu thực nhận */}
      <div
        onClick={() => onSelectTab("delivered")}
        className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-outline font-medium">
            Doanh thu thực nhận
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-headline-lg text-emerald-700">
            {totalRevenue.toLocaleString("vi-VN")} ₫
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            {counts.delivered} đơn hoàn thành
          </div>
        </div>
      </div>
    </div>
  );
};

