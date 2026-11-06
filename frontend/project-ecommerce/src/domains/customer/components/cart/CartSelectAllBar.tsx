import React from "react";

export interface CartSelectAllBarProps {
  totalItems: number;
  isAllSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  onDeleteSelected: () => void;
  onMoveToWishlist: () => void;
}

export const CartSelectAllBar: React.FC<CartSelectAllBarProps> = ({
  totalItems,
  isAllSelected,
  onToggleAll,
  onDeleteSelected,
  onMoveToWishlist,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 border border-outline-variant/60">
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={(e) => onToggleAll(e.target.checked)}
          className="w-5 h-5 rounded text-primary-container focus:ring-primary-container accent-primary-container cursor-pointer"
        />
        <span className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
          Chọn tất cả ({totalItems} sản phẩm)
        </span>
      </label>

      <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={onDeleteSelected}
          className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <span>Xóa đã chọn</span>
        </button>
        <span className="text-outline-variant">|</span>
        <button
          type="button"
          onClick={onMoveToWishlist}
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
          <span>Lưu vào yêu thích</span>
        </button>
      </div>
    </div>
  );
};

export default CartSelectAllBar;

