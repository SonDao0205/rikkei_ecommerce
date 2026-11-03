import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { ProductItem, ProductVariant } from "../../types/product";

interface ProductOrderSectionProps {
  product: ProductItem;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const ProductOrderSection: React.FC<ProductOrderSectionProps> = ({
  product,
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [cartToastMessage, setCartToastMessage] = useState<string | null>(null);

  const currentPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 50;
  const currentSku = selectedVariant?.sku || `MP-PRD-${product.id}`;

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const handleQtyMinus = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQtyPlus = () => {
    if (quantity < currentStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    setCartToastMessage(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng!`);
    setTimeout(() => {
      setCartToastMessage(null);
    }, 3500);
  };

  const handleBuyNow = () => {
    alert(`Tiến hành đặt hàng nhanh COD cho: ${product.name} (Số lượng: ${quantity})`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Product Identity, Ratings & Micro-Engagement */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-label-md font-label-md text-secondary font-bold uppercase tracking-wider text-xs">
            {product.category_name ? `${product.category_name} • Season 2025` : "Marketplace Verified • Official"}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-tertiary-container flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Thêm vào danh sách yêu thích"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isWishlisted ? "text-tertiary-container" : ""
                }`}
                style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Chia sẻ sản phẩm"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-headline-xl text-on-surface font-bold tracking-tight leading-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 pt-1 text-body-md font-body-md flex-wrap text-sm">
          <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg">
            <span className="text-amber-500 font-bold">{product.rating_avg.toFixed(1)}</span>
            <div className="flex items-center text-amber-500 text-[14px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[16px]"
                  style={{
                    fontVariationSettings:
                      product.rating_avg >= star
                        ? "'FILL' 1"
                        : product.rating_avg >= star - 0.5
                        ? "'FILL' 0.5"
                        : "'FILL' 0",
                  }}
                >
                  {product.rating_avg >= star ? "star" : product.rating_avg >= star - 0.5 ? "star_half" : "star"}
                </span>
              ))}
            </div>
            <span className="text-outline text-body-sm text-xs">({product.rating_count} đánh giá xác thực)</span>
          </div>

          <span className="text-outline">•</span>
          <span className="text-on-surface-variant font-label-md">
            <strong className="text-on-surface">{product.sold_count}</strong> Đã bán
          </span>
          <span className="text-outline">•</span>
          <span className="text-on-surface-variant font-label-md">
            <strong className="text-on-surface">Mã SKU:</strong> {currentSku}
          </span>
        </div>
      </div>

      {/* Dynamic Pricing & Flash Voucher Box */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm flex flex-col gap-2.5 border border-outline-variant/30">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold tracking-tight text-primary leading-none">
            {formatPrice(currentPrice)}
          </span>

          {product.original_price && product.original_price > currentPrice && (
            <span className="text-lg font-headline-md text-outline line-through">
              {formatPrice(product.original_price)}
            </span>
          )}

          {product.discount_percent && (
            <span className="px-2.5 py-1 rounded-lg bg-tertiary-container text-on-primary font-label-sm font-bold tracking-wide uppercase text-xs">
              Tiết kiệm {product.discount_percent}%
            </span>
          )}
        </div>

        {/* Promo Incentive Bar */}
        <div className="mt-1 p-3 rounded-xl bg-surface-container flex items-center justify-between text-body-sm font-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-tertiary-container">
              confirmation_number
            </span>
            <span className="text-on-surface text-xs md:text-sm">
              Mã voucher sàn: <strong className="text-tertiary-container font-semibold">-50.000 ₫</strong> trừ trực tiếp khi thanh toán
            </span>
          </div>
          <span className="text-xs font-bold text-primary uppercase cursor-pointer hover:underline shrink-0">
            Đã lưu mã
          </span>
        </div>
      </div>

      {/* Variant Selector */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-lg font-bold text-on-surface text-sm">
              Phiên bản / Phân loại ({variants.length} lựa chọn):
            </span>
            {selectedVariant && (
              <span className="text-xs text-primary font-semibold font-mono">
                {selectedVariant.name || selectedVariant.sku}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const isOutOfStock = v.stock <= 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => !isOutOfStock && onSelectVariant(v)}
                  disabled={isOutOfStock}
                  className={`px-3.5 py-2.5 rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : isOutOfStock
                      ? "bg-surface-container-low text-outline opacity-50 cursor-not-allowed border-transparent line-through"
                      : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/40"
                  }`}
                >
                  <span>{v.name || v.sku}</span>
                  <span
                    className={`text-[11px] font-normal ${
                      isSelected ? "text-on-primary/80" : "text-outline"
                    }`}
                  >
                    ({v.stock > 0 ? `${v.stock} sẵn` : "Hết hàng"})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Real-time Scarcity Indicator */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-label-lg font-bold text-on-surface text-sm">Số lượng:</span>
          <div className="inline-flex items-center rounded-xl bg-surface-container-lowest p-1 shadow-sm border border-outline-variant/30">
            <button
              type="button"
              onClick={handleQtyMinus}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>

            <input
              type="text"
              readOnly
              value={quantity}
              className="w-12 text-center bg-transparent font-label-lg font-bold text-on-surface focus:outline-none"
            />

            <button
              type="button"
              onClick={handleQtyPlus}
              disabled={quantity >= currentStock}
              className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {currentStock <= 5 && currentStock > 0 ? (
            <span className="text-amber-600 flex items-center gap-1 animate-pulse font-bold">
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              Chỉ còn {currentStock} sản phẩm trong kho!
            </span>
          ) : currentStock <= 0 ? (
            <span className="text-error font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">block</span>
              Tạm thời hết hàng
            </span>
          ) : (
            <span className="text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {currentStock} sản phẩm có sẵn
            </span>
          )}
        </div>
      </div>

      {/* High-Impact Conversion Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
        {/* Cart Secondary CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className="flex-1 py-4 px-6 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm transform active:scale-[0.98] border border-primary/20 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          <span>Thêm Vào Giỏ Hàng</span>
        </button>

        {/* Buy Now Instant Checkout Primary CTA */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="flex-[1.4] py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span>Mua Ngay (Giao Hàng COD)</span>
        </button>
      </div>

      {/* Added to Cart Feedback Toast */}
      {cartToastMessage && (
        <div className="p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-between shadow-lg transition-all animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            <span className="font-body-sm font-semibold text-xs md:text-sm">{cartToastMessage}</span>
          </div>
          <Link
            to="/cart"
            className="text-secondary-fixed text-label-sm font-bold uppercase underline text-xs"
          >
            Xem giỏ hàng
          </Link>
        </div>
      )}

      {/* Extra Marketplace Protection & Perks Strip */}
      <div className="rounded-xl bg-surface-container-low p-4 grid grid-cols-3 gap-2 text-center border border-outline-variant/20">
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary text-[20px]">security</span>
          <span className="text-[11px] font-label-sm font-bold text-on-surface">
            Bảo Hiểm Escrow
          </span>
          <span className="text-[10px] text-on-surface-variant">Giữ tiền an toàn tới khi duyệt</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-secondary text-[20px]">payments</span>
          <span className="text-[11px] font-label-sm font-bold text-on-surface">
            Đồng Kiểm Khi Nhận
          </span>
          <span className="text-[10px] text-on-surface-variant">Xem hàng trước khi thanh toán</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-tertiary-container text-[20px]">
            local_shipping
          </span>
          <span className="text-[11px] font-label-sm font-bold text-on-surface">
            Freeship Đơn &gt; 500k
          </span>
          <span className="text-[10px] text-on-surface-variant">Tự động áp dụng toàn quốc</span>
        </div>
      </div>
    </div>
  );
};

export default ProductOrderSection;
