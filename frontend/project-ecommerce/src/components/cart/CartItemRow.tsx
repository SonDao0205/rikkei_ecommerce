import React from "react";
import type { CartItem } from "../../types/cart/cart.types";
import { formatCurrencyVND } from "../../utils/currency";

export interface CartItemRowProps {
  item: CartItem;
  onToggleSelect: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  onSaveForLater?: (item: CartItem) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
}) => {
  const lineTotal = item.price * item.quantity;
  const isMinQuantity = item.quantity <= 1;
  const isMaxQuantity = item.quantity >= item.max_stock;

  return (
    <div className="group relative p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-lowest hover:bg-surface-container-low/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out will-change-transform rounded-xl">
      {/* Left: Checkbox + Product Details */}
      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelect(item.id)}
          className="w-5 h-5 mt-2.5 rounded text-primary-container accent-primary-container cursor-pointer shrink-0"
        />

        <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0 relative border border-outline-variant/40">
          <img
            src={item.image_url}
            alt={item.alt_text || item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <h3 className="font-label-lg text-sm sm:text-base text-on-surface font-bold line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {item.name}
          </h3>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant text-xs w-fit">
            <span>{item.variant_label}</span>
          </div>

          <div className="flex items-center gap-1 text-secondary text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">
              {item.stock_status.includes("Handmade")
                ? "handyman"
                : item.stock_status.includes("Ready")
                ? "check_circle"
                : "local_shipping"}
            </span>
            <span>{item.stock_status}</span>
          </div>
        </div>
      </div>

      {/* Right: Price + Quantity Stepper + Line Total + Action Icons */}
      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 pl-8 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-container">
        {/* Unit Price */}
        <div className="flex items-baseline gap-2">
          {item.original_price > item.price && (
            <span className="text-xs text-outline line-through">
              {formatCurrencyVND(item.original_price)}
            </span>
          )}
          <span className="text-xs sm:text-sm text-on-surface font-bold">
            {formatCurrencyVND(item.price)}
          </span>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/40">
          <button
            type="button"
            disabled={isMinQuantity}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              isMinQuantity
                ? "text-outline cursor-not-allowed opacity-50"
                : "text-on-surface hover:text-primary hover:bg-surface-container cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="w-8 text-center text-xs font-bold text-on-surface">
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={isMaxQuantity}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              isMaxQuantity
                ? "text-outline cursor-not-allowed opacity-50"
                : "text-on-surface hover:text-primary hover:bg-surface-container cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Subtotal & Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-base sm:text-lg text-primary font-bold">
            {formatCurrencyVND(lineTotal)}
          </span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            title="Xóa sản phẩm"
            className="p-1 text-outline hover:text-error transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          <button
            type="button"
            onClick={() => onSaveForLater && onSaveForLater(item)}
            title="Lưu vào yêu thích"
            className="p-1 text-outline hover:text-tertiary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;

