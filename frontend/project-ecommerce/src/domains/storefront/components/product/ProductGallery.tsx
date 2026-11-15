import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ProductImage } from "@/shared/types";

interface ProductGalleryProps {
  mainImageUrl: string;
  images: ProductImage[];
  productName: string;
  isHotSeller?: boolean;
  discountPercent?: number;
  badgeInfo?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  mainImageUrl,
  images,
  productName,
  isHotSeller = true,
  discountPercent,
  badgeInfo,
}) => {
  const { t } = useTranslation("customer");
  const [activeImage, setActiveImage] = useState<string>(mainImageUrl);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // If activeImage is empty or mainImageUrl changes, update accordingly
  const currentImage = activeImage || mainImageUrl;

  // Build full list of image URLs ensuring main image is first
  const allImages = images.length > 0 ? images : [{ id: 0, url: mainImageUrl, sort_order: 0, is_primary: true }];

  const displayBadge = badgeInfo || t("product.gallery.default_badge", { defaultValue: "Artisan Crafted • Saigon Lab" });

  return (
    <div className="flex flex-col gap-5">
      {/* Primary Showcase Viewport */}
      <div className="relative w-full rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm group border border-outline-variant/30">
        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
          {discountPercent ? (
            <span className="px-3 py-1 bg-tertiary-container text-on-primary font-label-sm uppercase rounded-full tracking-wider shadow-sm flex items-center gap-1 font-bold text-xs">
              <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
              {t("product.gallery.discount", { percent: discountPercent, defaultValue: `Giảm ${discountPercent}%` })}
            </span>
          ) : isHotSeller ? (
            <span className="px-3 py-1 bg-tertiary-container text-on-primary font-label-sm uppercase rounded-full tracking-wider shadow-sm flex items-center gap-1 font-bold text-xs">
              <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
              {t("product.gallery.hot_seller", { defaultValue: "Hot Seller" })}
            </span>
          ) : null}

          {displayBadge && (
            <span className="px-3 py-1 bg-surface-container-highest/90 text-on-surface font-label-sm rounded-full tracking-wide backdrop-blur-sm text-xs font-semibold shadow-xs">
              {displayBadge}
            </span>
          )}
        </div>

        {/* Zoom Toggle Quick-Action */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md hover:bg-surface-container-highest transition-all transform active:scale-95 cursor-pointer"
          title={isZoomed ? t("product.gallery.zoom_out", { defaultValue: "Thu nhỏ ảnh" }) : t("product.gallery.zoom_in", { defaultValue: "Phóng to ảnh" })}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isZoomed ? "zoom_out" : "zoom_in"}
          </span>
        </button>

        {/* Main Hero Image Container */}
        <div
          className="w-full aspect-[4/4.2] relative overflow-hidden bg-surface-container-low flex items-center justify-center cursor-zoom-in"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImage}
            alt={productName}
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              isZoomed ? "scale-150 cursor-zoom-out" : "group-hover:scale-105"
            }`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&fit=crop";
            }}
          />
        </div>

        {/* Bottom Micro-Bar: Image Quality & Authenticity Indicator */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-inverse-surface/80 text-inverse-on-surface text-label-sm font-label-sm backdrop-blur-sm text-xs">
            {t("product.gallery.studio_badge", { defaultValue: "Studio Photography • 100% Raw Item Match" })}
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest/90 px-3 py-1 rounded-full shadow-sm text-body-sm text-on-surface font-label-md text-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">view_in_ar</span>
            <span>{t("product.gallery.interactive_view", { defaultValue: "Interactive View" })}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Thumbnails Strip */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2.5">
          {allImages.map((img, idx) => {
            const isSelected = (activeImage || mainImageUrl) === img.url;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveImage(img.url)}
                className={`relative aspect-square rounded-xl overflow-hidden bg-surface-container-low transition-all p-0.5 shadow-xs cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary scale-105 opacity-100 shadow-md"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Trust and Guarantee Reassurance Matrix Strip */}
      <div className="w-full rounded-2xl bg-surface-container-low p-5 flex flex-col md:flex-row items-stretch justify-between gap-4 shadow-sm border border-outline-variant/20">
        {/* Guarantee Item 1 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg font-bold text-on-surface">
              {t("product.gallery.guarantees.authentic_title", { defaultValue: "100% Chính Hãng" })}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t("product.gallery.guarantees.authentic_desc", { defaultValue: "Kiểm định và xác nhận tem chuẩn sàn MarketPulse." })}
            </span>
          </div>
        </div>

        {/* Guarantee Item 2 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed">
            <span className="material-symbols-outlined text-[22px]">published_with_changes</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg font-bold text-on-surface">
              {t("product.gallery.guarantees.return_title", { defaultValue: "Đổi Trả 7 Ngày" })}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t("product.gallery.guarantees.return_desc", { defaultValue: "Miễn phí đổi kích cỡ hoặc hoàn tiền tận nơi toàn quốc." })}
            </span>
          </div>
        </div>

        {/* Guarantee Item 3 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center shrink-0 text-on-tertiary-fixed">
            <span className="material-symbols-outlined text-[22px]">electric_bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg font-bold text-on-surface">
              {t("product.gallery.guarantees.shipping_title", { defaultValue: "Hỏa Tốc 2 Giờ COD" })}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t("product.gallery.guarantees.shipping_desc", { defaultValue: "Giao nhanh nội thành TP.HCM & Hà Nội nhận hàng thanh toán." })}
            </span>
          </div>
        </div>
      </div>

      {/* Social Proof Community Live Activity */}
      <div className="rounded-xl bg-surface-container-lowest p-4 flex items-center justify-between shadow-sm border border-outline-variant/30 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest text-xs">
              TL
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary font-bold text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest text-xs">
              MN
            </div>
            <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-primary font-bold text-label-sm flex items-center justify-center ring-2 ring-surface-container-lowest text-xs">
              KH
            </div>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            <strong className="text-on-surface font-semibold">
              {t("product.gallery.social_proof.customer_count", { count: 18, defaultValue: "18 khách hàng" })}
            </strong>{" "}
            {t("product.gallery.social_proof.added_today", { defaultValue: "đã thêm sản phẩm này vào giỏ trong hôm nay." })}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-surface-container text-secondary font-label-md font-semibold flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t("product.gallery.social_proof.in_stock_warehouse", { defaultValue: "Sẵn hàng tại Kho" })}
        </span>
      </div>
    </div>
  );
};

export default ProductGallery;
