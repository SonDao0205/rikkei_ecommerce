import React from "react";

interface ProductPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Compute visible page numbers
  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) {
      start = 1;
      end = 5;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
      end = totalPages;
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-surface-container bg-surface-container-lowest">
      <div className="font-body-md text-body-md text-on-surface-variant">
        Showing <span className="font-semibold text-on-surface">{startItem}</span> to{" "}
        <span className="font-semibold text-on-surface">{endItem}</span> of{" "}
        <span className="font-semibold text-on-surface">{totalItems}</span> products
      </div>

      <nav aria-label="Catalog pagination" className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-outline hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${
              currentPage === page
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "text-on-surface hover:bg-surface-container"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default ProductPagination;
