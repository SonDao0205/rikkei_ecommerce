import React from "react";
import { Link } from "react-router-dom";

export interface CartEmptyStateProps {
  isCollapsiblePreview?: boolean;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = () => {
  return (
    <div className="py-12 px-4 flex flex-col items-center text-center bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/60">
      {/* Minimalist shopping bag illustration badge */}
      <div className="relative w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-[44px]">
          shopping_bag
        </span>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-surface-container-highest text-primary flex items-center justify-center font-bold text-xs shadow-xs">
          0
        </div>
      </div>

      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-bold mb-2">
        Giỏ hàng của bạn đang trống
      </h3>

      <p className="text-sm sm:text-base text-on-surface-variant max-w-md mb-8">
        Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Khám phá ngay các gian hàng thủ công, sản phẩm chất lượng và ưu đãi hấp dẫn hôm nay!
      </p>

      <Link
        to="/"
        className="h-12 px-8 rounded-xl bg-primary-container text-on-primary font-bold shadow-md hover:bg-primary transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">storefront</span>
        <span>Khám phá sản phẩm ngay</span>
      </Link>
    </div>
  );
};

export default CartEmptyState;

