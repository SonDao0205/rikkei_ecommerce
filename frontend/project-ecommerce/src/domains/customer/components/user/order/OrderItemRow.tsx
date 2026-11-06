import React from "react";
import { Link } from "react-router-dom";
import type { UserOrderItem } from "@/shared/types";

interface OrderItemRowProps {
  item: UserOrderItem;
  showShopHeader?: boolean;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  showShopHeader = false,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 border-b border-outline-variant/20 last:border-b-0">
      {/* Optional In-item Shop Subheader */}
      {showShopHeader && (
        <div className="flex items-center gap-2 pb-1.5 border-b border-outline-variant/15">
          {item.shopBadge && (
            <span
              className={`px-1.5 py-0.5 rounded font-label-sm text-[10px] font-bold tracking-wider ${
                item.shopBadge === "MALL"
                  ? "bg-tertiary-container text-on-tertiary"
                  : item.shopBadge === "ARTISAN"
                  ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                  : "bg-primary-fixed text-primary"
              }`}
            >
              {item.shopBadge}
            </span>
          )}
          <Link
            to={`/shop/${item.shopId}`}
            className="font-label-md text-label-md font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px] text-outline">
              storefront
            </span>
            <span>{item.shopName}</span>
          </Link>
          <Link
            to={`/shop/${item.shopId}`}
            className="ml-auto px-2 py-0.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-[11px] transition-colors"
          >
            Xem Shop
          </Link>
        </div>
      )}

      {/* Main Item Breakdown */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <Link
            to={`/product/${item.productId}`}
            className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-xs border border-outline-variant/30 hover:opacity-90 transition-opacity"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-2xl">image</span>
              </div>
            )}
          </Link>

          <div className="flex flex-col min-w-0">
            <Link
              to={`/product/${item.productId}`}
              className="font-label-lg text-label-lg font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2"
            >
              {item.productName}
            </Link>

            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Phân loại: {item.variantName}
              </span>
              {item.discountVoucherText && (
                <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-[10px] font-bold">
                  {item.discountVoucherText}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="font-body-sm text-[12px] text-outline">
                Số lượng: x{item.quantity}
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="font-body-sm text-[12px] text-outline">
                Đơn giá: {formatPrice(item.unitPrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-headline-md text-headline-md font-bold text-on-surface">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderItemRow;
