import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ProductItem, ProductVariant } from "@/domains/storefront/types";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { addCartItem, selectVariantForCheckout } from "@/domains/customer/state/cartSlice";
import { toggleWishlistItem } from "@/domains/customer/state/wishlistSlice";
import WishlistToast from "@/domains/customer/components/wishlist/WishlistToast";
import { cleanCategoryName } from "@/domains/storefront/utils/categoryUtils";
import { productApi, type CategoryVariantAttribute } from "@/domains/storefront/api/productApi";

interface ProductOrderSectionProps {
  product: ProductItem;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

interface AttributeOption {
  value: string;
  hex?: string;
  badge?: string;
  isAvailable: boolean;
}

interface AttributeTier {
  name: string;
  options: AttributeOption[];
}

const COLOR_HEX_MAP: Record<string, string> = {
  "đen": "#18181b",
  "trắng": "#ffffff",
  "xám": "#64748b",
  "đỏ": "#dc2626",
  "xanh": "#2563eb",
  "vàng": "#fbbf24",
  "hồng": "#f472b6",
  "cam": "#f97316",
  "nâu": "#78350f",
};

export const ProductOrderSection: React.FC<ProductOrderSectionProps> = ({
  product,
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const { t } = useTranslation("customer");
  const [requestedQuantity, setRequestedQuantity] = useState<number>(1);
  const [cartToastMessage, setCartToastMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryVariantAttribute[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const roles = user?.roles?.map((role) => role.toLowerCase()) ?? (user?.role ? [user.role] : []);
  const canUseCustomerFeatures = roles.includes("client");
  const isWishlisted = useAppSelector((state) => state.wishlist.items.some((item) => item.product_id === product.id));
  const isWishlistPending = useAppSelector((state) => state.wishlist.mutatingIds.includes(product.id));
  const isCartUpdating = useAppSelector((state) => state.cart.updating);

  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
    actionText?: string;
    actionLink?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    actionText: "Xem giỏ",
    actionLink: "/cart",
  });

  useEffect(() => {
    if (toastState.isOpen) {
      const timer = setTimeout(() => {
        setToastState((prev) => ({ ...prev, isOpen: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState.isOpen]);

  // Fetch real category attributes from API
  useEffect(() => {
    let isMounted = true;
    if (product.category_id && product.category_id > 0) {
      productApi
        .fetchCategoryAttributes(product.category_id)
        .then((res) => {
          if (isMounted) {
            setCategoryAttributes(res?.attributes || []);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCategoryAttributes([]);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [product.category_id]);

  // Build dynamic attribute tiers purely from API (variant.attributes or categoryAttributes)
  const { attributeTiers, isRealApiData } = useMemo(() => {
    // 1. Kiểm tra attributes thực tế từ các biến thể (variants)
    const attrMap = new Map<string, Set<string>>();
    for (const v of variants) {
      if (v.attributes && Array.isArray(v.attributes)) {
        for (const attr of v.attributes) {
          if (attr.name && attr.value) {
            if (!attrMap.has(attr.name)) {
              attrMap.set(attr.name, new Set());
            }
            attrMap.get(attr.name)!.add(attr.value);
          }
        }
      }
    }

    if (attrMap.size > 0) {
      const tiers: AttributeTier[] = Array.from(attrMap.entries()).map(([name, valSet]) => {
        const isColorAttr = name.toLowerCase().includes("màu") || name.toLowerCase().includes("color");
        const options: AttributeOption[] = Array.from(valSet).map((val) => {
          const matchedVariant = variants.find((v) =>
            v.attributes?.some((a) => a.name === name && a.value === val)
          );
          return {
            value: val,
            hex: isColorAttr ? COLOR_HEX_MAP[val.toLowerCase()] : undefined,
            isAvailable: (matchedVariant?.stock ?? 1) > 0,
            badge: matchedVariant ? `${matchedVariant.stock} sẵn` : undefined,
          };
        });

        return {
          name,
          options,
        };
      });

      return { attributeTiers: tiers, isRealApiData: true };
    }

    // 2. Kiểm tra thuộc tính từ API danh mục (categoryAttributes)
    if (categoryAttributes && categoryAttributes.length > 0) {
      const validAttrs = categoryAttributes.filter(
        (cat) => cat.name && cat.values && cat.values.length > 0
      );

      if (validAttrs.length > 0) {
        const tiers: AttributeTier[] = validAttrs.map((cat) => {
          const isColorAttr =
            cat.name.toLowerCase().includes("màu") || cat.name.toLowerCase().includes("color");
          const options: AttributeOption[] = (cat.values || []).map((v) => ({
            value: v.value,
            hex: isColorAttr ? COLOR_HEX_MAP[v.value.toLowerCase()] : undefined,
            isAvailable: true,
          }));

          return {
            name: cat.name,
            options,
          };
        });

        return { attributeTiers: tiers, isRealApiData: true };
      }
    }

    // 3. Nếu không có cấu hình phân nhóm thuộc tính nào từ API:
    // Trả về danh sách rỗng để hiển thị trực tiếp danh sách biến thể thực tế
    return { attributeTiers: [], isRealApiData: false };
  }, [variants, categoryAttributes]);

  // Xác định giá trị thuộc tính đang chọn tương ứng với selectedVariant hoặc lựa chọn người dùng
  const currentSelectedAttributes = useMemo(() => {
    const map: Record<string, string> = { ...selectedAttributes };
    if (selectedVariant?.attributes && selectedVariant.attributes.length > 0) {
      for (const attr of selectedVariant.attributes) {
        if (attr.name && attr.value && !selectedAttributes[attr.name]) {
          map[attr.name] = attr.value;
        }
      }
    }
    // Gán giá trị mặc định nếu chưa chọn
    for (const tier of attributeTiers) {
      if (!map[tier.name] && tier.options.length > 0) {
        map[tier.name] = tier.options[0].value;
      }
    }
    return map;
  }, [selectedAttributes, selectedVariant, attributeTiers]);

  const handleSelectAttribute = (attrName: string, attrVal: string) => {
    const nextAttributes = {
      ...currentSelectedAttributes,
      [attrName]: attrVal,
    };
    setSelectedAttributes(nextAttributes);

    if (variants.length === 0) return;

    // 1. Tìm biến thể khớp với tất cả thuộc tính đang chọn
    let matched = variants.find((v) => {
      if (!v.attributes || v.attributes.length === 0) return false;
      return Object.entries(nextAttributes).every(([name, val]) =>
        v.attributes?.some(
          (a) => a.name.toLowerCase() === name.toLowerCase() && a.value.toLowerCase() === val.toLowerCase()
        )
      );
    });

    // 2. Nếu không khớp tất cả, tìm biến thể khớp với thuộc tính vừa click
    if (!matched) {
      matched = variants.find((v) =>
        v.attributes?.some(
          (a) => a.name.toLowerCase() === attrName.toLowerCase() && a.value.toLowerCase() === attrVal.toLowerCase()
        )
      );
    }

    // 3. Nếu variant không có mảng attributes cấu trúc, tìm theo tên variant
    if (!matched) {
      matched = variants.find((v) =>
        (v.name || "").toLowerCase().includes(attrVal.toLowerCase())
      );
    }

    if (matched) {
      onSelectVariant(matched);
    }
  };

  const currentPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const quantity = Math.max(1, Math.min(requestedQuantity, currentStock || 1));
  const currentSku = selectedVariant?.sku || `MP-PRD-${product.id}`;

  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " ₫";
  };

  const handleQtyMinus = () => {
    if (quantity > 1) {
      setRequestedQuantity((prev) => prev - 1);
    }
  };

  const handleQtyPlus = () => {
    if (quantity < currentStock) {
      setRequestedQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!canUseCustomerFeatures) {
      setActionError("Giỏ hàng chỉ dành cho tài khoản người mua.");
      return;
    }
    const variantId = selectedVariant?.id || (variants.length > 0 ? variants[0].id : null);
    if (!variantId || currentStock < 1) {
      setActionError("Vui lòng chọn phiên bản còn hàng trước khi thêm vào giỏ.");
      return;
    }
    setActionError(null);
    setIsAdding(true);
    try {
      await dispatch(addCartItem({ variantId, quantity })).unwrap();
      setCartToastMessage(t("product.order.cart_added_msg", { name: product.name, quantity }));
      setToastState({
        isOpen: true,
        title: t("product.order.cart_added_title"),
        message: t("product.order.cart_added_msg", { name: product.name, quantity }),
        type: "success",
        actionText: t("product.order.view_cart"),
        actionLink: "/cart",
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("product.order.cannot_add_title");
      setActionError(msg);
      setToastState({
        isOpen: true,
        title: t("product.order.cannot_add_title"),
        message: msg,
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!canUseCustomerFeatures) {
      setActionError(t("home.product_card.cart_error_buyer_only"));
      return;
    }
    const variantId = selectedVariant?.id || (variants.length > 0 ? variants[0].id : null);
    if (!variantId || currentStock < 1) {
      setActionError(t("product.order.select_variant_prompt"));
      return;
    }
    setActionError(null);
    setIsBuyingNow(true);
    try {
      await dispatch(addCartItem({ variantId, quantity })).unwrap();
      dispatch(selectVariantForCheckout(variantId));
      navigate("/checkout");
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("product.order.cannot_buy_title");
      setActionError(msg);
      setToastState({
        isOpen: true,
        title: t("product.order.cannot_buy_title"),
        message: msg,
        type: "error",
      });
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!canUseCustomerFeatures) {
      setActionError(t("home.product_card.wishlist_error_buyer_only"));
      return;
    }
    setActionError(null);
    try {
      const wasLiked = isWishlisted;
      await dispatch(toggleWishlistItem(product.id)).unwrap();
      setToastState({
        isOpen: true,
        title: wasLiked
          ? t("home.product_card.wishlist_removed_title")
          : t("home.product_card.wishlist_added_title"),
        message: wasLiked
          ? t("home.product_card.wishlist_removed_msg", { name: product.name })
          : t("home.product_card.wishlist_added_msg", { name: product.name }),
        type: "success",
        actionText: t("home.product_card.view_wishlist"),
        actionLink: "/wishlist",
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : t("product.shop_info.action_failed");
      setActionError(msg);
      setToastState({
        isOpen: true,
        title: t("home.product_card.action_failed"),
        message: msg,
        type: "error",
      });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href).then(
        () => setCartToastMessage("Đã sao chép liên kết sản phẩm."),
        () => setActionError("Không thể sao chép liên kết sản phẩm.")
      );
    } else {
      setActionError("Trình duyệt không hỗ trợ sao chép liên kết.");
    }
  };

  const displayCategory = cleanCategoryName(product.category_name, product.category_id);

  return (
    <div className="flex flex-col gap-4">
      {/* Product Identity, Ratings & Micro-Engagement */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-label-md font-label-md text-secondary font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <span>{displayCategory ? `${displayCategory} • Season 2025` : "Marketplace Verified • Official"}</span>
            {isRealApiData && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Live Data
              </span>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleToggleWishlist()}
              disabled={isWishlistPending}
              className="w-9 h-9 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-tertiary-container flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title={isWishlisted ? "Bỏ thích sản phẩm" : "Thêm vào danh sách yêu thích"}
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

      {/* Dynamic Pricing Box */}
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
      </div>

      {/* Dynamic Variant Selector hoàn toàn từ API thực tế */}
      <div className="flex flex-col gap-4">
        {/* Render các tầng thuộc tính thực tế (nếu có từ API) */}
        {attributeTiers.map((tier, index) => {
          const activeValue = currentSelectedAttributes[tier.name] || tier.options[0]?.value || "";

          return (
            <div key={tier.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-lg font-bold text-on-surface text-sm">
                  {index + 1}. Chọn {tier.name}:
                </span>
                {activeValue && (
                  <span className="text-xs text-primary font-semibold">
                    {activeValue}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {tier.options.map((opt) => {
                  const isSelected = activeValue.toLowerCase() === opt.value.toLowerCase();

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectAttribute(tier.name, opt.value)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                        isSelected
                          ? "bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20"
                          : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/40"
                      }`}
                    >
                      {opt.hex && (
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-xs"
                          style={{ backgroundColor: opt.hex }}
                        />
                      )}
                      <span>{opt.value}</span>
                      {opt.badge && (
                        <span
                          className={`text-[10px] font-normal ${
                            isSelected ? "text-on-primary/80" : "text-outline"
                          }`}
                        >
                          ({opt.badge})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Khi không có thuộc tính phân nhóm theo tier, hiển thị trực tiếp danh sách biến thể thực tế từ API */}
        {attributeTiers.length === 0 && variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-lg font-bold text-on-surface text-sm">
                Phiên bản ({variants.length} lựa chọn):
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
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20"
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
                      (
                      {v.stock > 0
                        ? t("product.order.stock_suffix", { count: v.stock })
                        : t("product.order.out_of_stock")}
                      )
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Stepper & Stock status */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-label-lg font-bold text-on-surface text-sm">
              {t("product.order.quantity")}
            </span>
            <div className="inline-flex items-center rounded-xl bg-surface-container-lowest p-1 shadow-sm border border-outline-variant/30">
              <button
                type="button"
                onClick={handleQtyMinus}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center font-bold transition-all disabled:opacity-40 cursor-pointer"
                title="Giảm số lượng"
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
                title="Tăng số lượng"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {currentStock <= 5 && currentStock > 0 ? (
              <span className="text-amber-600 flex items-center gap-1 animate-pulse font-bold">
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                {t("product.order.low_stock", { count: currentStock })}
              </span>
            ) : currentStock <= 0 ? (
              <span className="text-error font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">block</span>
                {t("product.order.out_of_stock")}
              </span>
            ) : (
              <span className="text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {t("product.order.in_stock", { count: currentStock })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* High-Impact Conversion Action Row (Thêm Vào Giỏ Hàng & Mua Ngay) */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
        {/* Cart Secondary CTA */}
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={currentStock <= 0 || !selectedVariant || isAdding || isBuyingNow || isCartUpdating}
          className="flex-1 py-4 px-6 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-label-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm transform active:scale-[0.98] border border-primary/30 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          <span>
            {isAdding
              ? t("product.order.adding_to_cart")
              : t("product.order.add_to_cart")}
          </span>
        </button>

        {/* Buy Now Primary CTA (Replaces View cart button) */}
        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={currentStock <= 0 || !selectedVariant || isAdding || isBuyingNow || isCartUpdating}
          className="flex-1 py-4 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px]">flash_on</span>
          <span>
            {isBuyingNow
              ? t("product.order.buying_now")
              : t("product.order.buy_now")}
          </span>
        </button>
      </div>

      {actionError && (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-sm text-error">
          {actionError}
        </p>
      )}

      {/* Added to Cart Feedback Toast */}
      {cartToastMessage && (
        <div className="p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-between shadow-lg transition-all animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            <span className="font-body-sm font-semibold text-xs md:text-sm">{cartToastMessage}</span>
          </div>
          <Link
            to="/cart"
            className="text-secondary-fixed text-label-sm font-bold uppercase underline text-xs cursor-pointer"
          >
            Xem giỏ hàng
          </Link>
        </div>
      )}

      {/* Pinned Bottom-Right Toast Notification */}
      <WishlistToast
        isOpen={toastState.isOpen}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
        actionText={toastState.actionText || "Xem yêu thích"}
        actionLink={toastState.actionLink || "/wishlist"}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ProductOrderSection;
