import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/app/state/store";
import { setSelectedCategory } from "@/domains/storefront/state/productSlice";
import { cleanCategoryName } from "@/domains/storefront/utils/categoryUtils";

export interface ProductBreadcrumbProps {
  categoryName?: string;
  categoryId?: number;
  shopName?: string;
  shopId?: number;
  productName: string;
}

export const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({
  categoryName,
  categoryId,
  shopName,
  shopId,
  productName,
}) => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const displayName = cleanCategoryName(categoryName, categoryId);

  const effectiveShopName = shopName || t("product.breadcrumb.shop_default");

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant flex-wrap"
    >
      <Link
        to="/"
        onClick={() => dispatch(setSelectedCategory(0))}
        className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        title="Quay lại trang chủ Marketplace"
      >
        <span className="material-symbols-outlined text-[16px]">storefront</span>
        <span>{t("product.breadcrumb.marketplace")}</span>
      </Link>

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      {categoryId ? (
        <Link
          to={`/?category_id=${categoryId}`}
          onClick={() => dispatch(setSelectedCategory(categoryId))}
          className="hover:text-primary transition-colors cursor-pointer"
          title={`Xem các sản phẩm thuộc danh mục ${displayName}`}
        >
          {displayName}
        </Link>
      ) : (
        <span className="hover:text-primary transition-colors cursor-default">
          {displayName}
        </span>
      )}

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      {shopId ? (
        <Link
          to={`/shop/${shopId}`}
          className="hover:text-primary transition-colors cursor-pointer font-medium"
          title={`Xem gian hàng ${effectiveShopName}`}
        >
          <span className="text-secondary font-semibold">{effectiveShopName}</span>
        </Link>
      ) : (
        <span className="text-secondary font-semibold">{effectiveShopName}</span>
      )}

      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>

      <span
        className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-xs"
        title={productName}
      >
        {productName}
      </span>
    </nav>
  );
};

export default ProductBreadcrumb;
