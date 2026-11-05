import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import ProductBreadcrumb from "@/domains/storefront/components/product/ProductBreadcrumb";
import ProductGallery from "@/domains/storefront/components/product/ProductGallery";
import ProductShopInfo from "@/domains/storefront/components/product/ProductShopInfo";
import ProductOrderSection from "@/domains/storefront/components/product/ProductOrderSection";
import ProductAccordions from "@/domains/storefront/components/product/ProductAccordions";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { getProductDetail, clearProductDetail } from "@/domains/storefront/state/productSlice";
import {
  getShopFollowState,
  setFollowState,
} from "@/domains/shop/state/publicShopSlice";
import type { ProductVariant } from "@/shared/types";

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const { selectedProductDetail, detailLoading, detailError } = useAppSelector(
    (state) => state.product
  );

  const [prevId, setPrevId] = useState(id);
  const [selectedVariantOverride, setSelectedVariantOverride] = useState<ProductVariant | null>(null);

  if (id !== prevId) {
    setPrevId(id);
    setSelectedVariantOverride(null);
  }

  // Fetch product detail on mount or when URL ID changes
  useEffect(() => {
    if (id) {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        dispatch(getProductDetail(numericId));
      }
    }

    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, id]);

  const shopId = selectedProductDetail?.shop?.id;
  const followerCount = selectedProductDetail?.shop?.follower_count ?? 0;

  // Sync shop follow state when product detail loads
  useEffect(() => {
    if (shopId) {
      dispatch(
        setFollowState({
          following: false,
          follower_count: followerCount,
        })
      );
      dispatch(getShopFollowState(shopId));
    }
  }, [dispatch, shopId, followerCount]);

  const product = selectedProductDetail?.product;
  const images = selectedProductDetail?.images || [];
  const variants = selectedProductDetail?.variants || [];
  const shop = selectedProductDetail?.shop;

  const selectedVariant =
    selectedVariantOverride ?? (variants.length > 0 ? variants[0] : null);

  // Determine main image URL (prioritize variant image, then primary image, then thumbnail)
  const mainImageUrl =
    selectedVariant?.image_url ||
    images.find((img) => img.is_primary)?.url ||
    images[0]?.url ||
    product?.thumbnail_url ||
    "";

  return (
    <CustomerLayout>
      {/* Top Urgency Ticker Banner */}
      <section className="w-full bg-surface-container-high py-2.5 px-4 lg:px-8 border-b border-outline-variant/30">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant flex-wrap gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-tertiary text-on-tertiary">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
            </span>
            <span className="font-label-md font-bold text-on-surface">Flash Deal Hour:</span>
            <span>
              Giảm thêm 50.000 ₫ tự động áp dụng tại giỏ hàng với mã{" "}
              <span className="font-mono font-bold text-primary">RETRO50</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-label-md font-label-md text-outline hidden md:flex">
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
              Bảo hành Flagship chính hãng
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">
                local_shipping
              </span>
              Hỏa tốc COD: Hà Nội &amp; TP.HCM
            </span>
          </div>
        </div>
      </section>

      {/* Main PDP Container */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Loading State */}
        {detailLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body-md text-on-surface-variant font-medium">
              Đang tải thông tin chi tiết sản phẩm...
            </p>
          </div>
        )}

        {/* Error State */}
        {detailError && !detailLoading && (
          <div className="p-8 text-center bg-surface-container-lowest rounded-2xl shadow-sm border border-error/20 flex flex-col items-center justify-center gap-3 my-8">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Không thể tải thông tin sản phẩm</h2>
            <p className="text-on-surface-variant max-w-md text-sm">{detailError}</p>
            <Link
              to="/"
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-sm hover:bg-primary-container transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Quay lại trang chủ</span>
            </Link>
          </div>
        )}

        {/* Product Content Loaded Successfully */}
        {!detailLoading && !detailError && product && (
          <>

            {/* Back Action: Phía trên thanh điều hướng, không khung */}
            <div>
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-label-md text-label-md font-semibold transition-colors cursor-pointer group"
                title="Quay lại trang trước"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                <span>Quay lại</span>
              </button>
            </div>

            {/* Breadcrumb Hierarchy Navigation */}
            <ProductBreadcrumb
              categoryName={product.category_name}
              shopName={shop?.name || product.shop_name}
              productName={product.name}
            />

            {/* Two-Column Product Matrix (Left 7 cols / Right 5 cols on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Gallery & Trust Ecosystem (7/12 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <ProductGallery
                  mainImageUrl={mainImageUrl}
                  images={images}
                  productName={product.name}
                  discountPercent={product.discount_percent}
                  badgeInfo={product.badge_info || "Chính hãng • MarketPulse Store"}
                />
              </div>

              {/* RIGHT COLUMN: Shop, Conversion Engine & Accordions (5/12 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Merchant Store Header */}
                <ProductShopInfo shop={shop} />

                {/* Product Purchasing Box (Title, Price, Variants, Quantity, CTAs, Perks) */}
                <ProductOrderSection
                  product={product}
                  variants={variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={(variant) => setSelectedVariantOverride(variant)}
                />

                {/* Accordion Information Tabs */}
                <ProductAccordions description={product.description} />
              </div>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
