import React from "react";
import type { TimeRangeFilter } from "../../types/ecommerce";

interface DashboardHeaderProps {
  timeRange: TimeRangeFilter;
  onTimeRangeChange: (range: TimeRangeFilter) => void;
  onExport: () => void;
  isExporting: boolean;
  lastUpdated?: string | null;
}

const timeFilterOptions: { label: string; value: TimeRangeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "This Month", value: "month" },
  { label: "Year to Date", value: "ytd" },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeRange,
  onTimeRangeChange,
  onExport,
  isExporting,
  lastUpdated,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-outline-variant/30">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm tracking-wider uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Real-Time Metrics
          </span>
          <span className="text-outline font-body-sm text-body-sm">
            • Live sync via Socket.io {lastUpdated && `(${lastUpdated})`}
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Executive Dashboard
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Real-time overview of marketplace performance, COD revenue, and order velocity
        </p>
      </div>

      {/* Toolbar Filters & Export */}
      <div className="flex items-center flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-sm border border-outline-variant/30">
          {timeFilterOptions.map((opt) => {
            const isActive = timeRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTimeRangeChange(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-all text-on-surface font-label-md text-label-md shadow-sm border border-outline-variant/40 hover:shadow cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
            {isExporting ? "sync" : "download"}
          </span>
          <span>{isExporting ? "Exporting..." : "Export Report"}</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
