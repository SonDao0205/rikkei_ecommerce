import React, { useState } from "react";
import type { ProductItem } from "../../types/ecommerce";

interface ProductCardProps {
  product: ProductItem;
  onQuickAdd?: (product: ProductItem) => void;
  onToggleWishlist?: (product: ProductItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickAdd,
  onToggleWishlist,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onToggleWishlist?.(product);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd?.(product);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div className="group relative flex flex-col rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Box (4:5 Ratio) */}
      <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: `url('${product.thumbnail_url || ""}')`,
          }}
        />

        {/* Badges / Discount */}
        {product.discount_percent && (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-tertiary-container text-on-primary font-label-sm text-[11px] font-bold shadow-sm">
            -{product.discount_percent}%
          </span>
        )}

        {!product.discount_percent && product.tag && (
          <span
            className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded font-label-sm text-[10px] font-bold ${
              product.tag === "NEW IN"
                ? "bg-primary text-on-primary"
                : product.tag.startsWith("-")
                ? "bg-tertiary-container text-on-primary"
                : "bg-surface-container text-on-surface"
            }`}
          >
            {product.tag}
          </span>
        )}

        {/* Wishlist Toggle */}
        <button
          onClick={handleWishlistClick}
          aria-label="Add to wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
            isWishlisted ? "text-tertiary-container" : "text-on-surface-variant hover:text-tertiary-container"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Cart action appears only when a real cart handler is wired. */}
        {onQuickAdd && <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleQuickAddClick} className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span><span>Thêm vào giỏ</span>
          </button>
        </div>}
      </div>

      {/* Details Box */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          {/* Shop / Brand Info */}
          <div className="flex items-center gap-1 mb-1">
            <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold">
              {product.shop_name}
            </span>
            {product.shop_badge && (
              <>
                <span className="material-symbols-outlined text-secondary text-[14px]">
                  {product.shop_badge === "ARTISAN" ? "workspace_premium" : "verified"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ml-auto ${
                    product.shop_badge === "ARTISAN"
                      ? "bg-surface-container text-secondary"
                      : "bg-surface-container text-primary"
                  }`}
                >
                  {product.shop_badge}
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-label-lg text-label-lg text-on-surface font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Rating Section */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="font-body-sm text-body-sm text-outline line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1 text-secondary font-bold">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{product.rating_avg.toFixed(1)}</span>
              <span className="text-outline font-normal">
                ({product.rating_count >= 1000 ? `${(product.rating_count / 1000).toFixed(1)}k` : product.rating_count})
              </span>
            </div>

            {product.stock_alert && (
              <span
                className={`text-[11px] font-label-sm font-bold ${
                  product.stock_alert.includes("Claimed") || product.stock_alert.includes("Fast")
                    ? "text-tertiary"
                    : product.stock_alert.includes("left") || product.stock_alert.includes("sold out")
                    ? "text-tertiary-container"
                    : "text-secondary"
                }`}
              >
                {product.stock_alert}
              </span>
            )}

            {!product.stock_alert && product.badge_info && (
              <span className="text-[11px] font-label-sm text-outline">
                {product.badge_info}
              </span>
            )}
          </div>

          {/* Progress Bar (Flash Sale) */}
          {product.is_flash_sale && product.claimed_percentage !== undefined && (
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  product.claimed_percentage > 70 ? "bg-tertiary-container" : "bg-secondary"
                }`}
                style={{ width: `${product.claimed_percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
