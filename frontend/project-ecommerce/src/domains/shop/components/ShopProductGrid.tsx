import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ProductItem } from "@/shared/types";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { toggleWishlistItem } from "@/domains/customer/state/wishlistSlice";
import WishlistToast from "@/domains/customer/components/wishlist/WishlistToast";

interface ShopProductGridProps {
  products: ProductItem[];
  totalProducts: number;
  loading?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  products,
  totalProducts,
  loading = false,
  currentPage,
  onPageChange,
  pageSize = 12,
}) => {
  const { t } = useTranslation("customer");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({});
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    if (toastState.isOpen) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, isOpen: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState.isOpen]);

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setToastState({
        isOpen: true,
        title: t("public_shop.grid.toast.login_required_title"),
        message: t("public_shop.grid.toast.login_required_msg"),
        type: "error",
      });
      return;
    }
    const isLiked = wishlistItems.some(
      (it) => it.product_id === productId || it.id === productId
    );
    const prod = products.find((p) => p.id === productId);
    const prodName = prod?.name || "Sản phẩm";

    try {
      await dispatch(toggleWishlistItem(productId)).unwrap();
      if (isLiked) {
        setToastState({
          isOpen: true,
          title: t("public_shop.grid.toast.removed_title"),
          message: t("public_shop.grid.toast.removed_msg", { name: prodName }),
          type: "success",
        });
      } else {
        setToastState({
          isOpen: true,
          title: t("public_shop.grid.toast.added_title"),
          message: t("public_shop.grid.toast.added_msg", { name: prodName }),
          type: "success",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      setToastState({
        isOpen: true,
        title: t("public_shop.grid.toast.failed_title"),
        message: msg,
        type: "error",
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    setAddedMap((prev) => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [productId]: false }));
    }, 1500);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalProducts);

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3 animate-pulse border border-outline-variant/30"
            >
              <div className="w-full aspect-square bg-surface-container-high rounded-xl" />
              <div className="h-4 bg-surface-container-high rounded w-2/3" />
              <div className="h-5 bg-surface-container-high rounded w-full" />
              <div className="h-6 bg-surface-container-high rounded w-1/2" />
              <div className="h-10 bg-surface-container-high rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
        <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
          {t("public_shop.grid.empty")}
        </h4>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg pt-6 pb-12 flex flex-col gap-8">
      {/* 4-Column Responsive Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const isWishlisted = wishlistItems.some(
            (it) => it.product_id === product.id || it.id === product.id
          );
          const isAdded = !!addedMap[product.id];
          const discountPercent = product.discount_percent;

          return (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="group rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary/40 transition-all duration-300 ease-out flex flex-col overflow-hidden relative border border-outline-variant/40 cursor-pointer will-change-transform"
            >
              {/* Product Thumbnail Box */}
              <div className="relative w-full aspect-square overflow-hidden bg-surface-container-low">
                {product.thumbnail_url ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={product.thumbnail_url}
                    alt={product.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container text-outline">
                    <span className="material-symbols-outlined text-5xl">image</span>
                  </div>
                )}

                {/* Left Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-label-sm text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    MALL
                  </span>
                  {discountPercent ? (
                    <span className="px-2 py-0.5 rounded-md bg-tertiary text-on-tertiary font-label-sm text-[11px] font-bold shadow-xs">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </div>

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => toggleWishlist(e, product.id)}
                  aria-label={t("public_shop.grid.add_wishlist_aria")}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-tertiary transition-colors shadow-sm cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isWishlisted ? "text-tertiary" : ""
                    }`}
                    style={{
                      fontVariationSettings: isWishlisted
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">
                      {product.rating_avg > 0 ? product.rating_avg.toFixed(1) : "4.9"}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline ml-1">
                      • {t("public_shop.grid.sold_count", { count: product.rating_count ? product.rating_count : "1.2k" })}
                    </span>
                  </div>

                  <h4 className="font-label-lg text-label-lg text-on-surface font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="font-body-sm text-body-sm text-outline line-through text-xs">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product.id)}
                    className={`w-full h-10 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isAdded
                        ? "bg-surface-container-highest text-emerald-600 font-bold"
                        : "bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isAdded ? "text-emerald-600" : ""
                      }`}
                    >
                      {isAdded ? "done" : "add_shopping_cart"}
                    </span>
                    <span>{isAdded ? t("public_shop.grid.added") : t("public_shop.grid.add_to_cart")}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination & Catalog Counter */}
      {totalProducts > 0 && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <span className="font-body-md text-body-md text-on-surface-variant order-2 sm:order-1">
            {t("public_shop.grid.pagination.showing")}{" "}
            <span className="font-bold text-on-surface">
              {startIndex} – {endIndex}
            </span>{" "}
            {t("public_shop.grid.pagination.of")}{" "}
            <span className="font-bold text-on-surface">{totalProducts}</span>{" "}
            {t("public_shop.grid.pagination.products")}
          </span>

          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-10 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
              <span>{t("public_shop.grid.pagination.prev")}</span>
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (
                totalPages > 6 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 2
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <span
                      key={pageNum}
                      className="px-2 text-outline font-label-md text-label-md"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              }

              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl font-label-md text-label-md flex items-center justify-center font-bold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary-container text-on-primary shadow-sm"
                      : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-10 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{t("public_shop.grid.pagination.next")}</span>
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pinned Bottom-Right Toast Notification */}
      <WishlistToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
        actionText={t("home.product_card.view_wishlist")}
        actionLink="/wishlist"
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ShopProductGrid;
