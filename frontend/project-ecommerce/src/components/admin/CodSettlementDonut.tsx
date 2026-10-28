import React from "react";
import type { CodSettlementItem } from "../../types/ecommerce";

interface CodSettlementDonutProps {
  totalActiveBatch: number;
  slices: CodSettlementItem[];
  lastSynced: string;
}

export const CodSettlementDonut: React.FC<CodSettlementDonutProps> = ({
  totalActiveBatch,
  slices,
  lastSynced,
}) => {
  // Stroke colors matching the slice ids
  const strokeColorMap: Record<string, string> = {
    delivered: "#059669",
    in_transit: "#006398",
    pending: "#d97706",
    cancelled: "#ba1a1a",
  };

  return (
    <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/40 flex flex-col justify-between">
      <div>
        <div className="pb-3 border-b border-outline-variant/30">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              COD Settlement
            </h2>
            <span className="material-symbols-outlined text-outline text-[20px]">
              donut_large
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Current batch fulfillment &amp; cash collection cycle
          </p>
        </div>

        {/* SVG Donut Chart with Center Stat */}
        <div className="relative w-48 h-48 mx-auto my-5 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background base circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#eaedff"
              strokeWidth="12"
            />
            {/* Slices rendered dynamically */}
            {slices.map((slice) => {
              const strokeColor = strokeColorMap[slice.id] || "#059669";
              return (
                <circle
                  key={slice.id}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="12"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Donut Centered Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono leading-none">
              {totalActiveBatch}
            </span>
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold mt-1">
              Active Batch
            </span>
            <span className="font-body-sm text-[10px] text-outline">Orders</span>
          </div>
        </div>

        {/* Metric Details List */}
        <div className="flex flex-col gap-2.5 mt-2">
          {slices.map((slice) => (
            <div
              key={slice.id}
              className={`flex items-center justify-between text-body-sm font-body-sm p-2 rounded-lg transition-colors ${
                slice.id === "delivered"
                  ? "bg-surface-container/50"
                  : "hover:bg-surface-container/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${slice.dotColorClass}`} />
                <span className="text-on-surface font-medium">{slice.label}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-on-surface">{slice.count}</span>
                <span className="text-outline text-[11px] block font-mono">
                  {slice.sublabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Sync Tag */}
      <div className="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-[11px] font-label-sm text-outline">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px] text-emerald-600">
            verified_user
          </span>
          GHTK &amp; GHN API reconciled
        </span>
        <span className="font-mono">{lastSynced}</span>
      </div>
    </div>
  );
};

export default CodSettlementDonut;
