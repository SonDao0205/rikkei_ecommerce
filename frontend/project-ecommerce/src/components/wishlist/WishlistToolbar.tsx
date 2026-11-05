import React from "react";

export interface WishlistToolbarProps {
  totalCount: number;
  inStockCount: number;
  onAddAllToCart: () => void;
  onClearAll: () => void;
  onGoBack?: () => void;
}

export const WishlistToolbar: React.FC<WishlistToolbarProps> = ({
  totalCount,
  inStockCount,
  onAddAllToCart,
  onClearAll,
  onGoBack,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-2 max-w-2xl">
        {onGoBack && (
          <div>
            <button
              type="button"
              onClick={onGoBack}
              className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md font-semibold transition-colors cursor-pointer group w-fit"
              title="Quay lại trang trước"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Quay lại</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
            Danh sách yêu thích
          </h1>
          <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs sm:text-sm font-bold flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <span>{totalCount} sản phẩm đã lưu</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Các sản phẩm bạn đang quan tâm và lưu lại để mua sau. Nhanh tay chuyển vào giỏ trước khi hết phiên ưu đãi hoặc hết hàng lưu kho!
        </p>
      </div>

      {/* Bulk Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        <button
          type="button"
          disabled={inStockCount === 0}
          onClick={onAddAllToCart}
          className={`h-11 px-4 sm:px-5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm ${
            inStockCount > 0
              ? "bg-surface-container-lowest text-primary hover:bg-surface-container-low active:scale-[0.98] border border-outline-variant/60"
              : "bg-surface-container text-outline cursor-not-allowed opacity-60"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            add_shopping_cart
          </span>
          <span>Thêm tất cả còn hàng vào giỏ ({inStockCount})</span>
        </button>

        <button
          type="button"
          disabled={totalCount === 0}
          onClick={onClearAll}
          className={`h-11 px-3.5 rounded-xl text-tertiary-container hover:bg-surface-container-low text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            totalCount === 0 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            delete_sweep
          </span>
          <span>Xóa tất cả</span>
        </button>
      </div>
    </div>
  );
};

export default WishlistToolbar;
