import React from "react";

interface ShopOrderHeaderProps {
  totalOrders: number;
  selectedCount: number;
  isExporting: boolean;
  onExportCsv: () => void;
  onBulkConfirm: () => void;
}

export const ShopOrderHeader: React.FC<ShopOrderHeaderProps> = ({
  totalOrders,
  selectedCount,
  isExporting,
  onExportCsv,
  onBulkConfirm,
}) => {
  return (
    <div className="flex flex-col gap-3 py-6 border-b border-outline-variant/30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
        <span className="font-medium text-on-surface-variant">Kênh Người bán</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-on-surface">Đơn hàng &amp; Vận chuyển</span>
      </div>

      {/* Main Title Row & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Quản lý Đơn hàng &amp; Giao vận
          </h1>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-mono font-bold">
            {totalOrders} đơn hàng
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onBulkConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Xác nhận ({selectedCount}) đơn</span>
            </button>
          )}

          <button
            type="button"
            disabled={isExporting}
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/30 font-label-md text-label-md font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">download</span>
            )}
            <span>Xuất file Excel/CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

