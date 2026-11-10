import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { toggleWishlistItem } from "@/domains/customer/state/wishlistSlice";
import WishlistToast from "@/domains/customer/components/wishlist/WishlistToast";
import type { ProductItem } from "@/shared/types";

interface ProductCardProps {
  product: ProductItem;
  onQuickAdd?: (product: ProductItem) => void | Promise<void>;
  onToggleWishlist?: (product: ProductItem) => void;
  onClick?: (product: ProductItem) => void;
  onShopClick?: (shopId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickAdd,
  onToggleWishlist,
  onClick,
  onShopClick,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const roles = user?.roles?.map((role) => role.toLowerCase()) ?? (user?.role ? [user.role] : []);
  const canUseCustomerFeatures = roles.includes("client");
  const isWishlisted = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.product_id === product.id)
  );
  const isWishlistPending = useAppSelector((state) =>
    state.wishlist.mutatingIds.includes(product.id)
  );
  const cartUpdating = useAppSelector((state) => state.cart.updating);
  const [actionError, setActionError] = useState<string | null>(null);
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

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!canUseCustomerFeatures) {
      setToastState({
        isOpen: true,
        title: "Không khả dụng",
        message: "Danh sách yêu thích chỉ dành cho tài khoản người mua.",
        type: "error",
      });
      return;
    }

    try {
      const wasLiked = isWishlisted;
      await dispatch(toggleWishlistItem(product.id)).unwrap();
      setToastState({
        isOpen: true,
        title: wasLiked ? "Đã bỏ thích sản phẩm" : "Đã thêm vào yêu thích",
        message: wasLiked
          ? `"${product.name}" đã được xóa khỏi danh sách yêu thích.`
          : `"${product.name}" đã được lưu vào danh sách yêu thích.`,
        type: "success",
      });
      onToggleWishlist?.(product);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại";
      setToastState({
        isOpen: true,
        title: "Thao tác thất bại",
        message: msg,
        type: "error",
      });
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!canUseCustomerFeatures) {
      setActionError("Giỏ hàng chỉ dành cho tài khoản người mua.");
      return;
    }
    void Promise.resolve(onQuickAdd?.(product)).catch((error: unknown) => {
      setActionError(error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ hàng.");
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div
      onClick={() => onClick?.(product)}
      className="group relative flex flex-col rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-outline-variant/30 hover:border-primary/40 transition-all duration-300 ease-out overflow-hidden cursor-pointer will-change-transform"
    >
      {/* Image Box (4:5 Ratio) */}
      <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: `url('${product.thumbnail_url || ""}')`,
          }}
        />

        {/* Badges / Discount */}
        {product.discount_percent && (
          <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded bg-tertiary-container text-on-primary font-label-sm text-[11px] font-bold shadow-sm">
            -{product.discount_percent}%
          </span>
        )}

        {!product.discount_percent && product.tag && (
          <span
            className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded font-label-sm text-[10px] font-bold ${
              product.tag === "NEW IN"
                ? "bg-primary text-on-primary"
                : product.tag.startsWith("-")
                ? "bg-tertiary-container text-on-primary"
                : "bg-surface-container text-on-surface"
            }`}
          >
            {product.tag}
          </span>
        )}

        {/* Wishlist Toggle */}
        <button
          onClick={handleWishlistClick}
          disabled={isWishlistPending}
          aria-label="Add to wishlist"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
            isWishlisted ? "text-tertiary-container" : "text-on-surface-variant hover:text-tertiary-container"
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Cart action appears only when a real cart handler is wired. */}
        {onQuickAdd && <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleQuickAddClick} disabled={cartUpdating} className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-md hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60">
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span><span>Thêm vào giỏ</span>
          </button>
        </div>}
      </div>

      {actionError && <p role="status" className="px-3 pb-3 text-xs text-error">{actionError}</p>}

      {/* Details Box */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div>
          {/* Shop / Brand Info */}
          <div
            className="flex items-center gap-1 mb-1 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={(e) => {
              if (onShopClick) {
                e.stopPropagation();
                onShopClick(product.shop_id);
              }
            }}
          >
            <span className="font-label-sm text-[11px] text-on-surface-variant font-semibold hover:text-primary transition-colors">
              {product.shop_name}
            </span>
            {product.shop_badge && (
              <>
                <span className="material-symbols-outlined text-secondary text-[14px]">
                  {product.shop_badge === "ARTISAN" ? "workspace_premium" : "verified"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ml-auto ${
                    product.shop_badge === "ARTISAN"
                      ? "bg-surface-container text-secondary"
                      : "bg-surface-container text-primary"
                  }`}
                >
                  {product.shop_badge}
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-label-lg text-label-lg text-on-surface font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Rating Section */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="font-body-sm text-body-sm text-outline line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1 text-secondary font-bold">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{product.rating_avg.toFixed(1)}</span>
              <span className="text-outline font-normal">
                ({product.rating_count >= 1000 ? `${(product.rating_count / 1000).toFixed(1)}k` : product.rating_count})
              </span>
            </div>

            {product.stock_alert && (
              <span
                className={`text-[11px] font-label-sm font-bold ${
                  product.stock_alert.includes("Claimed") || product.stock_alert.includes("Fast")
                    ? "text-tertiary"
                    : product.stock_alert.includes("left") || product.stock_alert.includes("sold out")
                    ? "text-tertiary-container"
                    : "text-secondary"
                }`}
              >
                {product.stock_alert}
              </span>
            )}

            {!product.stock_alert && product.badge_info && (
              <span className="text-[11px] font-label-sm text-outline">
                {product.badge_info}
              </span>
            )}
          </div>

          {/* Progress Bar (Flash Sale) */}
          {product.is_flash_sale && product.claimed_percentage !== undefined && (
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  product.claimed_percentage > 70 ? "bg-tertiary-container" : "bg-secondary"
                }`}
                style={{ width: `${product.claimed_percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Pinned Bottom-Right Toast Notification */}
      <WishlistToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
        actionText="Xem yêu thích"
        actionLink="/wishlist"
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ProductCard;
