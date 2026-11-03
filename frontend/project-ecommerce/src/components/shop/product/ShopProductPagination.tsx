import React from "react";

interface ShopProductPaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const ShopProductPagination: React.FC<ShopProductPaginationProps> = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(total, currentPage * pageSize);

  return (
    <div className="p-4 bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/30 rounded-b-xl">
      {/* Left info & Page Size */}
      <div className="flex items-center gap-4 text-on-surface-variant font-body-sm text-body-sm">
        <span>
          Hiển thị{" "}
          <strong className="text-on-surface font-semibold font-mono">
            {startItem} - {endItem}
          </strong>{" "}
          trên tổng số{" "}
          <strong className="text-on-surface font-semibold font-mono">{total}</strong>{" "}
          sản phẩm
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-outline text-xs">Mỗi trang:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm focus:outline-none border border-outline-variant/30 cursor-pointer font-mono"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Right Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-outline-variant/20"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span className="hidden sm:inline">Trước</span>
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage === pageNum;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-xl font-label-md text-label-md flex items-center justify-center transition-all cursor-pointer font-mono ${
                isActive
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-outline-variant/20"
        >
          <span className="hidden sm:inline">Tiếp</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default ShopProductPagination;

