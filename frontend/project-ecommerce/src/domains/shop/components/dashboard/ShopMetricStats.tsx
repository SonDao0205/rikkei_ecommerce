import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ShopKpiMetrics } from "@/domains/shop/types/shopDashboard.types";

interface ShopMetricStatsProps {
  metrics: ShopKpiMetrics;
}

export const ShopMetricStats: React.FC<ShopMetricStatsProps> = ({ metrics }) => {
  const { t } = useTranslation('shop');

  // Sparkline generator for conversion rate & revenue
  const renderSparkline = () => {
    return (
      <svg
        className="w-full h-8 overflow-visible"
        viewBox="0 0 200 32"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="metricSparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M0,26 C30,22 60,28 90,14 C120,6 150,16 180,4 L200,8 L200,32 L0,32 Z"
          fill="url(#metricSparkGrad)"
        />
        <path
          d="M0,26 C30,22 60,28 90,14 C120,6 150,16 180,4 L200,8"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="200" cy="8" r="3" fill="#059669" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
      {/* Metric 1: Revenue GMV */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              {t("dashboard.metrics.today_revenue")}
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {metrics.formattedRevenue}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            {metrics.revenueChangePercent > 0 ? `+${metrics.revenueChangePercent}%` : `${metrics.revenueChangePercent}%`}{" "}
            {metrics.revenueChangeLabel}
          </span>
          <span className="font-label-sm text-label-sm text-outline font-mono">
            {t("dashboard.metrics.revenue_target")}
          </span>
        </div>

        {/* Micro Sparkline */}
        <div className="mt-3 w-full h-8 overflow-hidden">
          {renderSparkline()}
        </div>
      </div>

      {/* Metric 2: Today's Orders */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              {t("dashboard.metrics.new_orders")}
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {t("dashboard.metrics.orders_unit", { count: metrics.todayOrders })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-label-sm font-label-sm mb-1.5">
            <span className="font-medium text-on-surface-variant">{t("dashboard.metrics.payment_ratio")}</span>
            <span className="font-mono font-semibold text-secondary">
              {metrics.codOrdersPercent}% COD • {metrics.digitalOrdersPercent}% MoMo
            </span>
          </div>
          {/* Segmented bar matching admin orders card */}
          <div className="w-full h-2 rounded-full bg-surface-container flex overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${metrics.codOrdersPercent}%` }}
              title={`COD: ${metrics.codOrdersCount} ${t("dashboard.metrics.unit_orders")}`}
            />
            <div
              className="h-full bg-secondary-container"
              style={{ width: `${metrics.digitalOrdersPercent}%` }}
              title={`Digital: ${metrics.digitalOrdersCount} ${t("dashboard.metrics.unit_orders")}`}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between font-label-sm text-label-sm text-outline-variant">
          <span>COD: {metrics.codOrdersCount} {t("dashboard.metrics.unit_orders")}</span>
          <span>Ví MoMo: {metrics.digitalOrdersCount} {t("dashboard.metrics.unit_orders")}</span>
        </div>
      </div>

      {/* Metric 3: Conversion Rate */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              {t("dashboard.metrics.conversion_rate")}
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {metrics.conversionRate}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
            <span className="material-symbols-outlined text-[22px]">query_stats</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +{metrics.conversionChangePercent}% {metrics.conversionChangeLabel}
          </span>
          <span className="font-label-sm text-label-sm text-outline font-mono">
            {t("dashboard.metrics.industry_top")}
          </span>
        </div>

        <div className="mt-3 w-full h-8 overflow-hidden">
          {renderSparkline()}
        </div>
      </div>

      {/* Metric 4: Merchant Wallet Balance */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/40 flex flex-col justify-between group hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              {t("dashboard.metrics.wallet_balance")}
            </span>
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface mt-2 font-mono tracking-tight">
              {metrics.formattedWalletBalance}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20">
          <span className="font-label-sm text-label-sm text-on-surface-variant">{t("dashboard.metrics.pending_settlement")}</span>
          <span className="font-mono font-bold text-on-surface text-label-sm">
            {metrics.formattedPendingSettlement}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Link
            to="/shop/finances"
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-semibold hover:underline"
          >
            {t("dashboard.metrics.fast_withdraw")}
            <span className="material-symbols-outlined text-[16px]">north_east</span>
          </Link>
          <span className="text-[11px] text-outline font-mono">{t("dashboard.metrics.settlement_cycle")}</span>
        </div>
      </div>
    </div>
  );
};

export default ShopMetricStats;
