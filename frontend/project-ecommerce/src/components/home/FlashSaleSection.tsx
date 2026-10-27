import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import type { ProductItem } from "../../types/ecommerce";

interface FlashSaleSectionProps {
  products: ProductItem[];
  onQuickAdd?: (product: ProductItem) => void;
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, onQuickAdd }) => (
  <section className="w-full max-w-[1440px] mx-auto px-margin-lg pb-space-xl">
    <div className="flex items-center justify-between gap-space-md mb-space-lg p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
      <div>
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Sản phẩm nổi bật</h2>
        <p className="text-on-surface-variant">Dữ liệu sản phẩm hiện có trong cửa hàng</p>
      </div>
      <Link className="flex items-center gap-1 text-primary font-label-md font-bold hover:underline" to="#catalog">
        Xem danh mục <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
    </div>
    {products.length === 0 ? (
      <p className="py-8 text-center text-on-surface-variant">Chưa có sản phẩm để hiển thị.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {products.map((product) => <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />)}
      </div>
    )}
  </section>
);

export default FlashSaleSection;
