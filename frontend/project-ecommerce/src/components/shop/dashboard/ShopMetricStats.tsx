import React from "react";
import { Link } from "react-router-dom";
import type { ShopKpiMetrics } from "../../../types/shop/shopDashboard.types";

interface ShopMetricStatsProps {
  metrics: ShopKpiMetrics;
}

export const ShopMetricStats: React.FC<ShopMetricStatsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
      {/* Metric 1: Revenue */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Doanh thu hôm nay
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </span>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">
            {metrics.formattedRevenue}
          </div>
        </div>
        <div className="mt-space-md flex items-center gap-1.5 font-label-md text-label-md text-secondary">
          <span className="material-symbols-outlined text-[18px]">
            {metrics.isRevenuePositive ? "trending_up" : "trending_down"}
          </span>
          <span>{metrics.revenueChangePercent > 0 ? `+${metrics.revenueChangePercent}%` : `${metrics.revenueChangePercent}%`}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
            {metrics.revenueChangeLabel}
          </span>
        </div>
      </div>

      {/* Metric 2: Orders */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Đơn hàng mới</span>
            <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </span>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">
            {metrics.todayOrders}{" "}
            <span className="font-body-lg text-body-lg text-on-surface-variant font-normal">đơn</span>
          </div>
        </div>
        <div className="mt-space-md space-y-1">
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>
              COD: {metrics.codOrdersCount} ({metrics.codOrdersPercent}%)
            </span>
            <span>
              MoMo/Bank: {metrics.digitalOrdersCount} ({metrics.digitalOrdersPercent}%)
            </span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full"
              style={{ width: `${metrics.codOrdersPercent}%` }}
            />
            <div
              className="bg-secondary-container h-full"
              style={{ width: `${metrics.digitalOrdersPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric 3: Conversion Rate */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Tỷ lệ chuyển đổi gian hàng
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">query_stats</span>
            </span>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">
            {metrics.conversionRate}%
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between">
          <div className="flex items-center gap-1 font-label-md text-label-md text-secondary">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            <span>+{metrics.conversionChangePercent}%</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
              {metrics.conversionChangeLabel}
            </span>
          </div>
          {/* Sparkline */}
          <svg className="w-16 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 64 24">
            <path
              d="M1 18l12-6 12 4 14-10 12 6 12-10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Metric 4: Merchant Wallet Balance */}
      <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
        <div className="space-y-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Số dư Ví người bán
            </span>
            <Link
              to="/shop/finances/withdraw"
              className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5"
            >
              Rút tiền
              <span className="material-symbols-outlined text-[14px]">north_east</span>
            </Link>
          </div>
          <div className="font-headline-xl text-headline-xl text-on-surface">
            {metrics.formattedWalletBalance}
          </div>
        </div>
        <div className="mt-space-md flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low px-2.5 py-1.5 rounded-lg">
          <span>Chờ đối soát:</span>
          <strong className="text-on-surface font-label-md text-label-md">
            {metrics.formattedPendingSettlement}
          </strong>
        </div>
      </div>
    </div>
  );
};
export default ShopMetricStats;

