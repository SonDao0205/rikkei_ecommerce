import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "@/app/state/store";
import { setSelectedCategory } from "@/domains/storefront/state/productSlice";

export interface ProductBreadcrumbProps {
  categoryName?: string;
  categoryId?: number;
  shopName?: string;
  shopId?: number;
  productName: string;
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  categoryName = "Sản phẩm",
  categoryId,
  shopName = "Cửa hàng",
  shopId,
  productName,
}) => {
  const dispatch = useAppDispatch();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant flex-wrap"
    >
      <Link
        to="/"
        onClick={() => dispatch(setSelectedCategory(0))}
        className="hover:text-primary transition-colors flex items-center gap-1"
        title="Quay lại trang chủ Marketplace"
      >
        <span className="material-symbols-outlined text-[16px]">storefront</span>
        <span>Marketplace</span>
      </Link>

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      {categoryId ? (
        <Link
          to={`/?category_id=${categoryId}`}
          onClick={() => dispatch(setSelectedCategory(categoryId))}
          className="hover:text-primary transition-colors cursor-pointer"
          title={`Xem các sản phẩm thuộc danh mục ${categoryName}`}
        >
          {categoryName}
        </Link>
      ) : (
        <span className="hover:text-primary transition-colors cursor-default">
          {categoryName}
        </span>
      )}

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      {shopId ? (
        <Link
          to={`/shop/${shopId}`}
          className="hover:text-primary transition-colors cursor-pointer font-medium"
          title={`Xem thông tin gian hàng ${shopName}`}
        >
          {shopName}
        </Link>
      ) : (
        <span className="hover:text-primary transition-colors cursor-default font-medium">
          {shopName}
        </span>
      )}

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      <span className="text-on-surface font-label-md font-semibold truncate max-w-sm" title={productName}>
        {productName}
      </span>
    </nav>
  );
};

export default ProductBreadcrumb;
