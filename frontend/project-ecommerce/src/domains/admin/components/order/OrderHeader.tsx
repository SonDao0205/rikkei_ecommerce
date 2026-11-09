import React from "react";

interface OrderHeaderProps {
  selectedCount: number;
  onExport: () => void;
  onBatchPrint: () => void;
  onBulkConfirm: () => void;
  isExporting: boolean;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  selectedCount,
  onExport,
  onBatchPrint,
  onBulkConfirm,
  isExporting,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            Live Gateway Sync
          </span>
          <span className="text-on-surface-variant font-label-sm text-label-sm">
            • Vietnamese Marketplace Cluster #04
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Order Management
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
          Track, verify, and fulfill cross-shop customer purchases with automated COD routing.
        </p>
      </div>

      {/* Global Bulk & Export Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-on-surface font-label-lg text-label-lg rounded-xl shadow-sm hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExporting ? "sync" : "download"}
          </span>
          <span>{isExporting ? "Exporting..." : "Export (CSV)"}</span>
        </button>

        <button
          type="button"
          onClick={onBatchPrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container-high text-on-surface font-label-lg text-label-lg rounded-xl shadow-sm hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>Batch Print Labels</span>
        </button>

        <button
          type="button"
          onClick={onBulkConfirm}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary font-label-lg text-label-lg rounded-xl shadow-md transition-all cursor-pointer ${
            selectedCount === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-95 active:scale-95"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">add_task</span>
          <span>Bulk Confirm ({selectedCount})</span>
        </button>
      </div>
    </div>
  );
};

export default OrderHeader;
