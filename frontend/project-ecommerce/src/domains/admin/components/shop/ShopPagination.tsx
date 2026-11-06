import React from "react";

interface ShopPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const ShopPagination: React.FC<ShopPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="px-4 py-3.5 bg-surface-container-lowest rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-outline-variant/30 shadow-sm">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        Showing <span className="font-semibold text-on-surface">{startItem} to {endItem}</span> of{" "}
        <span className="font-semibold text-on-surface">{totalItems}</span> registered shops
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Previous</span>
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className="px-1 text-outline font-label-md">
                ...
              </span>
            );
          }
          const pageNum = Number(p);
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary-container text-on-primary font-bold shadow-sm"
                  : "text-on-surface hover:bg-surface-container"
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
          className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default ShopPagination;
