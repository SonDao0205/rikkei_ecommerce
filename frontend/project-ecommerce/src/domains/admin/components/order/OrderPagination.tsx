import React from "react";

interface OrderPaginationProps {
  currentPage: number;
  totalOrders: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const OrderPagination: React.FC<OrderPaginationProps> = ({
  currentPage,
  totalOrders,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalOrders);

  return (
    <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-2xl border-t border-surface-container-high/60">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Showing <span className="font-semibold text-on-surface">{startIdx}</span> to{" "}
        <span className="font-semibold text-on-surface">{endIdx}</span> of{" "}
        <span className="font-semibold text-on-surface">{totalOrders}</span> orders
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-lg font-label-md text-label-md cursor-pointer transition-colors ${
              currentPage === pageNum
                ? "bg-primary-container text-on-primary font-bold shadow-xs"
                : "hover:bg-surface-container text-on-surface"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {totalPages > 5 && (
          <>
            <span className="px-1 text-on-surface-variant text-label-sm">...</span>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className={`w-8 h-8 rounded-lg font-label-md text-label-md cursor-pointer transition-colors ${
                currentPage === totalPages
                  ? "bg-primary-container text-on-primary font-bold shadow-xs"
                  : "hover:bg-surface-container text-on-surface"
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors disabled:opacity-40 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default OrderPagination;
