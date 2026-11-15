import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { CartItem } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

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
  const { t } = useTranslation("customer");
  const navigate = useNavigate();
  const price = item.price ?? item.unit_price ?? 0;
  const originalPrice = item.original_price ?? price;
  const maxStock = item.max_stock ?? item.available_stock ?? 99;
  const stockStatus =
    item.stock_status ??
    (item.is_available ? t("cart.item_row.in_stock") : t("cart.item_row.out_of_stock"));
  const isAvailable = item.is_available !== false;
  const isMinQuantity = item.quantity <= 1;
  const isMaxQuantity = item.quantity >= maxStock;
  const lineTotal = price * item.quantity;
  const productTargetUrl = `/product/${item.product_id || item.id}`;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    navigate(productTargetUrl);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl transition-all duration-300 ease-out will-change-transform cursor-pointer ${
        isAvailable
          ? "bg-surface-container-lowest hover:bg-surface-container-low/40 hover:shadow-md hover:-translate-y-0.5"
          : "bg-surface-container-low/50 opacity-75 border border-dashed border-outline-variant/60"
      }`}
    >
      {/* Left: Checkbox + Product Details */}
      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
        <input
          type="checkbox"
          checked={(item.selected ?? true) && isAvailable}
          disabled={!isAvailable}
          onChange={() => isAvailable && onToggleSelect(item.id)}
          onClick={(e) => e.stopPropagation()}
          className={`w-5 h-5 mt-2.5 rounded text-primary-container accent-primary-container shrink-0 ${
            isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-40"
          }`}
        />

        <Link
          to={productTargetUrl}
          onClick={(e) => e.stopPropagation()}
          className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0 relative border border-outline-variant/40 block cursor-pointer"
        >
          <img
            src={item.image_url || item.product_thumbnail_url || ""}
            alt={item.alt_text || item.name || item.product_name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              isAvailable ? "group-hover:scale-105" : "grayscale opacity-70"
            }`}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
              <span className="text-[10px] font-bold text-white text-center leading-tight bg-error/90 px-1.5 py-0.5 rounded">
                Hết hàng
              </span>
            </div>
          )}
        </Link>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <Link
            to={productTargetUrl}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer"
          >
            <h3
              className={`font-label-lg text-sm sm:text-base font-bold line-clamp-2 transition-colors duration-200 cursor-pointer ${
                isAvailable
                  ? "text-on-surface group-hover:text-primary"
                  : "text-on-surface/60 line-through"
              }`}
            >
              {item.name || item.product_name}
            </h3>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant text-xs w-fit">
            <span>{item.variant_label || item.variant_name || item.variant_sku}</span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              !isAvailable
                ? "text-error"
                : stockStatus.includes("Chỉ còn")
                ? "text-amber-600 dark:text-amber-400"
                : "text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {!isAvailable
                ? "error"
                : stockStatus.includes("Handmade")
                ? "handyman"
                : stockStatus.includes("Ready")
                ? "check_circle"
                : "local_shipping"}
            </span>
            <span>{stockStatus}</span>
          </div>
        </div>
      </div>

      {/* Right: Price + Quantity Stepper + Line Total + Action Icons */}
      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 pl-8 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-container">
        {/* Unit Price */}
        <div className="flex items-baseline gap-2">
          {originalPrice > price && (
            <span className="text-xs text-outline line-through">
              {formatCurrencyVND(originalPrice)}
            </span>
          )}
          <span
            className={`text-xs sm:text-sm font-bold ${
              isAvailable ? "text-on-surface" : "text-outline line-through"
            }`}
          >
            {formatCurrencyVND(price)}
          </span>
        </div>

        {/* Quantity Stepper */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/40"
        >
          <button
            type="button"
            disabled={!isAvailable || isMinQuantity}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              !isAvailable || isMinQuantity
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
            disabled={!isAvailable || isMaxQuantity}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              !isAvailable || isMaxQuantity
                ? "text-outline cursor-not-allowed opacity-50"
                : "text-on-surface hover:text-primary hover:bg-surface-container cursor-pointer"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Subtotal & Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className={`text-base sm:text-lg font-bold ${
              isAvailable ? "text-primary" : "text-outline"
            }`}
          >
            {formatCurrencyVND(lineTotal)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            title={t("cart.item_row.delete_title")}
            className="p-1 text-outline hover:text-error transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
          {onSaveForLater && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSaveForLater(item);
              }}
              title={t("cart.item_row.wishlist_title")}
              className="p-1 text-outline hover:text-tertiary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
