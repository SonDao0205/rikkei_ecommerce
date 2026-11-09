import React from "react";

interface ShopOrderPaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const ShopOrderPagination: React.FC<ShopOrderPaginationProps> = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs font-body-sm text-outline">
      <div>
        Hiển thị <span className="font-semibold text-on-surface">{Math.min(total, (currentPage - 1) * pageSize + 1)}</span> -{" "}
        <span className="font-semibold text-on-surface">{Math.min(total, currentPage * pageSize)}</span> trên tổng số{" "}
        <span className="font-semibold text-on-surface">{total}</span> đơn hàng
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg font-label-sm text-xs font-semibold transition-all ${
              p === currentPage
                ? "bg-primary text-on-primary shadow-xs"
                : "border border-outline-variant/30 hover:bg-surface-container text-on-surface"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

