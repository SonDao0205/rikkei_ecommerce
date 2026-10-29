import React from "react";
import type { ShopMetricStats } from "../../../types/ecommerce";

interface ShopMetricStripProps {
  metrics: ShopMetricStats;
}

export const ShopMetricStrip: React.FC<ShopMetricStripProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Metric 1: Active Shops */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3 border border-outline-variant/30 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Total Active Shops
          </span>
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">storefront</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {metrics.activeShops}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">Stores</span>
          </div>
          <div className="flex items-center gap-1 text-secondary mt-1 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>{metrics.activeRateText || "+3 this month"}</span>
          </div>
        </div>
      </div>

      {/* Metric 2: Pending KYC */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3 border border-outline-variant/30 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Pending KYC / Approval
          </span>
          <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {metrics.pendingKycCount}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">Shops</span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-label-sm text-label-sm mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold text-[11px]">
              Needs Review ({metrics.pendingActionRequired || metrics.pendingKycCount})
            </span>
          </div>
        </div>
      </div>

      {/* Metric 3: Suspended */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3 border border-outline-variant/30 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Suspended / Flagged
          </span>
          <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[20px]">shield_with_heart</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {metrics.suspendedCount}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant">Stores</span>
          </div>
          <div className="flex items-center gap-1 text-error font-label-sm text-label-sm mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-semibold text-[11px]">
              {metrics.suspendedNote || "Policy Violations"}
            </span>
          </div>
        </div>
      </div>

      {/* Metric 4: Merchant GMV */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3 border border-outline-variant/30 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Total Merchant GMV
          </span>
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {metrics.totalGmvFormatted}
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary mt-1 font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            <span>{metrics.totalGmvChange || "+14.2% vs last month"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopMetricStrip;
