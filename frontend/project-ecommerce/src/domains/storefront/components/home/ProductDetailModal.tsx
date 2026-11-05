import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { getProductDetail, clearProductDetail } from "@/domains/storefront/state/productSlice";
import {
  getShopFollowState,
  toggleFollowShop,
  setFollowState,
} from "@/domains/shop/state/publicShopSlice";
import type { ProductVariant } from "@/shared/types";

interface ProductDetailModalProps {
  productId: number | null;
  onClose: () => void;
  onOpenShop?: (shopId: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  productId,
  onClose,
  onOpenShop,
}) => {
  const dispatch = useAppDispatch();
  const { selectedProductDetail, detailLoading, detailError } = useAppSelector(
    (state) => state.product
  );
  const { followState, followLoading } = useAppSelector((state) => state.publicShop);
  const { user } = useAppSelector((state) => state.auth);

  const [prevProductId, setPrevProductId] = useState(productId);
  const [selectedImageOverride, setSelectedImageOverride] = useState<string | null>(null);
  const [selectedVariantOverride, setSelectedVariantOverride] = useState<ProductVariant | null>(null);
  const [followMessage, setFollowMessage] = useState<string | null>(null);

  if (productId !== prevProductId) {
    setPrevProductId(productId);
    setSelectedImageOverride(null);
    setSelectedVariantOverride(null);
  }

  useEffect(() => {
    if (productId) {
      dispatch(getProductDetail(productId));
    }
    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, productId]);

  const shopId = selectedProductDetail?.shop?.id;
  const followerCount = selectedProductDetail?.shop?.follower_count ?? 0;

  useEffect(() => {
    if (shopId) {
      dispatch(
        setFollowState({
          following: false,
          follower_count: followerCount,
        })
      );
      // Chỉ gọi API trạng thái follow khi đã đăng nhập vai trò CLIENT
      if (user && (user.roles?.includes("client") || user.role === "client")) {
        dispatch(getShopFollowState(shopId));
      }
    }
  }, [dispatch, shopId, followerCount, user]);

  if (!productId) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setFollowMessage("Vui lòng đăng nhập với tài khoản khách hàng để theo dõi cửa hàng.");
      setTimeout(() => setFollowMessage(null), 3500);
      return;
    }
    if (!user.roles?.includes("client") && user.role !== "client") {
      setFollowMessage("Tính năng theo dõi cửa hàng chỉ dành cho tài khoản Người mua.");
      setTimeout(() => setFollowMessage(null), 3500);
      return;
    }

    if (!selectedProductDetail?.shop?.id) return;

    try {
      setFollowMessage(null);
      await dispatch(
        toggleFollowShop({
          shopId: selectedProductDetail.shop.id,
          currentlyFollowing: followState.following,
        })
      ).unwrap();
    } catch (err: unknown) {
      setFollowMessage(err instanceof Error ? err.message : "Không thể cập nhật theo dõi");
      setTimeout(() => setFollowMessage(null), 3500);
    }
  };

  const product = selectedProductDetail?.product;
  const images = selectedProductDetail?.images || [];
  const variants = selectedProductDetail?.variants || [];
  const shop = selectedProductDetail?.shop;

  const defaultImage =
    images.find((img) => img.is_primary)?.url ||
    images[0]?.url ||
    product?.thumbnail_url ||
    "";
  const selectedImage = selectedImageOverride || defaultImage;

  const selectedVariant =
    selectedVariantOverride ?? (variants.length > 0 ? variants[0] : null);

  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">
              inventory_2
            </span>
            <span className="font-label-lg font-bold text-on-surface">
              Chi tiết sản phẩm
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {detailLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-body-md text-on-surface-variant">Đang tải chi tiết sản phẩm...</p>
            </div>
          )}

          {detailError && !detailLoading && (
            <div className="p-6 text-center text-error bg-error-container/20 rounded-xl my-8">
              <span className="material-symbols-outlined text-[36px] mb-2">error</span>
              <p className="font-semibold">{detailError}</p>
            </div>
          )}

          {!detailLoading && !detailError && product && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Cột trái: Gallery Ảnh */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-low shadow-inner border border-outline-variant/30">
                  <img
                    src={selectedImage || product.thumbnail_url || ""}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  {product.discount_percent && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-tertiary-container text-on-primary font-bold text-xs shadow-md">
                      -{product.discount_percent}%
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageOverride(img.url)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          selectedImage === img.url
                            ? "border-primary shadow-sm scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cột phải: Thông tin & Biến thể */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Tiêu đề & Danh mục */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {product.category_name || "Catalog"}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-on-surface mt-1 leading-snug">
                    {product.name}
                  </h2>
                </div>

                {/* Đánh giá & Số lượng đã bán */}
                <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                  <div className="flex items-center gap-1 text-secondary font-bold">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span>{product.rating_avg.toFixed(1)}</span>
                    <span className="font-normal text-outline">({product.rating_count} đánh giá)</span>
                  </div>
                  <span>•</span>
                  <span>Đã bán: <strong className="text-on-surface">{product.sold_count}</strong></span>
                </div>

                {/* Khối Giá */}
                <div className="p-4 rounded-xl bg-surface-container-low/70 flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-outline line-through">
                      {formatPrice(product.original_price)}
                    </span>
                  )}
                  {product.discount_percent && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-tertiary-container text-on-primary">
                      Tiết kiệm {product.discount_percent}%
                    </span>
                  )}
                </div>

                {/* Danh sách Biến thể (Variants) */}
                {variants.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-on-surface">
                        Lựa chọn phiên bản / SKU:
                      </span>
                      {selectedVariant && (
                        <span className="text-xs text-outline font-mono">
                          Mã: {selectedVariant.sku}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => {
                              setSelectedVariantOverride(v);
                              if (v.image_url) setSelectedImageOverride(v.image_url);
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-outline-variant hover:border-primary/50 text-on-surface bg-surface-container-lowest"
                            }`}
                          >
                            <span>{v.name || v.sku}</span>
                            <span className="text-[10px] text-outline font-normal">
                              ({v.stock > 0 ? `${v.stock} sẵn` : "Hết hàng"})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tồn kho */}
                <div className="text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    inventory
                  </span>
                  <span>
                    Tồn kho:{" "}
                    <strong className={currentStock > 5 ? "text-on-surface" : "text-tertiary font-bold"}>
                      {currentStock > 0 ? `${currentStock} sản phẩm sẵn có` : "Tạm hết hàng"}
                    </strong>
                  </span>
                </div>

                {/* Mô tả sản phẩm */}
                {product.description && (
                  <div className="pt-2 border-t border-outline-variant/40">
                    <span className="text-sm font-semibold text-on-surface">Mô tả sản phẩm:</span>
                    <p className="text-xs md:text-sm text-on-surface-variant mt-1 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Thông tin Cửa hàng (Shop Box) */}
                {shop && (
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/50 flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onOpenShop?.(shop.id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary overflow-hidden">
                          {shop.logo_url ? (
                            <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            shop.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-on-surface hover:text-primary">
                              {shop.name}
                            </span>
                            <span className="material-symbols-outlined text-secondary text-[16px]">
                              verified
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">
                            {followState.follower_count} người theo dõi
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenShop && (
                          <button
                            onClick={() => onOpenShop(shop.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Xem Shop
                          </button>
                        )}

                        <button
                          onClick={handleFollowClick}
                          disabled={followLoading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            followState.following
                              ? "bg-surface-container text-on-surface hover:bg-error-container/20 hover:text-error"
                              : "bg-primary text-on-primary hover:bg-primary-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {followState.following ? "check" : "add"}
                          </span>
                          <span>{followState.following ? "Đang theo dõi" : "Theo dõi"}</span>
                        </button>
                      </div>
                    </div>

                    {followMessage && (
                      <p className="text-[11px] font-medium text-error mt-1 animate-fade-in">
                        {followMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
