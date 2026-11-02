import React from "react";
import { Link } from "react-router-dom";

interface ProductBreadcrumbProps {
  categoryName?: string;
  shopName?: string;
  productName: string;
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  categoryName = "Sản phẩm",
  shopName = "Cửa hàng",
  productName,
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant flex-wrap"
    >
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">storefront</span>
        <span>Marketplace</span>
      </Link>

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      <span className="hover:text-primary transition-colors cursor-pointer">
        {categoryName}
      </span>

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      <span className="hover:text-primary transition-colors cursor-pointer font-medium">
        {shopName}
      </span>

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      <span className="text-on-surface font-label-md font-semibold truncate max-w-sm">
        {productName}
      </span>
    </nav>
  );
};

export default ProductBreadcrumb;
