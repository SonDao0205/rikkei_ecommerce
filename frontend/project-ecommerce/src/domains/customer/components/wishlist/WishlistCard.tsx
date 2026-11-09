import React from "react";
import { Link } from "react-router-dom";
import type { WishlistItem } from "@/domains/customer/types/wishlist.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

export interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: number) => void;
  onAddToCart: (item: WishlistItem) => void;
  onNotifyRestock?: (item: WishlistItem) => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({
  item,
  onRemove,
  onAddToCart,
  onNotifyRestock,
}) => {
  const isOutOfStock = item.status === "out-of-stock";

  return (
    <div
      className={`group relative flex flex-col rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 ease-out overflow-hidden will-change-transform ${
        isOutOfStock ? "opacity-90" : ""
      }`}
    >
      {/* Product Image & Floating Badges */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
        <img
          src={item.image_url}
          alt={item.alt_text || item.name}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isOutOfStock ? "grayscale-[35%]" : "group-hover:scale-105"
          }`}
        />

        {/* Discount & Urgency Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {item.discount_badge && !isOutOfStock && (
            <span
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-sm ${
                item.discount_badge.includes("Flash")
                  ? "bg-primary-container text-on-primary flex items-center gap-1"
                  : "bg-tertiary-container text-on-primary"
              }`}
            >
              {item.discount_badge.includes("Flash") && (
                <span className="material-symbols-outlined text-[13px]">bolt</span>
              )}
              {item.discount_badge}
            </span>
          )}

          {item.urgency_badge && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">alarm</span>
              <span>{item.urgency_badge}</span>
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-bold shadow-md tracking-wider">
              TẠM HẾT HÀNG
            </span>
          </div>
        )}

        {/* Floating Heart Button to Remove from Wishlist */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          title="Bỏ thích"
          aria-label="Remove from wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm text-tertiary shadow-sm hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer z-10"
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>
      </div>

      {/* Details & Actions */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          {/* Shop name with badge */}
          <div className="flex items-center gap-1 text-secondary text-xs font-semibold">
            <span className="truncate">{item.shop_name}</span>
            {item.is_verified_shop && (
              <span
                className="material-symbols-outlined text-[15px] text-secondary shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${item.product_id}`}
            className="font-headline-md text-sm sm:text-[15px] leading-snug text-on-surface font-bold hover:text-primary transition-colors line-clamp-2"
          >
            {item.name}
          </Link>

          {/* Variant label */}
          <div className="text-xs text-on-surface-variant flex items-center gap-1">
            <span>Phân loại:</span>
            <span className="font-medium text-on-surface truncate">
              {item.variant_label}
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg text-primary font-bold">
              {formatCurrencyVND(item.price)}
            </span>
            {item.original_price > item.price && (
              <span className="text-xs text-outline line-through">
                {formatCurrencyVND(item.original_price)}
              </span>
            )}
          </div>

          {!isOutOfStock ? (
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="w-full h-11 rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                shopping_bag
              </span>
              <span>Thêm vào giỏ hàng</span>
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                disabled
                className="w-full h-11 rounded-lg bg-surface-container-high text-outline cursor-not-allowed text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  remove_shopping_cart
                </span>
                <span>Hết hàng tạm thời</span>
              </button>

              <button
                type="button"
                onClick={() => onNotifyRestock && onNotifyRestock(item)}
                className="text-center text-xs text-primary hover:underline py-0.5 flex items-center justify-center gap-1 cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">
                  notifications
                </span>
                <span>Báo cho tôi khi có hàng lại</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;

