import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../layout/CustomerLayout";
import {
  CartBreadcrumbStepper,
  CartFreeShippingTracker,
  CartSelectAllBar,
  CartShopGroup,
  CartOrderSummary,
  CartEmptyState,
} from "../../components/cart";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  fetchCart,
  toggleAllSelection,
  toggleShopSelection,
  toggleItemSelection,
  updateItemQuantity,
  removeItem,
  removeSelectedItemsAction,
  applyShopVoucherAction,
  applyPlatformVoucherAction,
  removePlatformVoucher,
  removeShopVoucher,
} from "../../redux/slices/cart/cartSlice";
import type { CartItem, CartShopGroup as ICartShopGroup } from "../../types/cart/cart.types";
import { formatCurrencyVND } from "../../utils/currency";

export const ShoppingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, shopVouchers, platformVoucher, summary } =
    useAppSelector((state) => state.cart);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const [notification, setNotification] = useState<{
    type: "success" | "info" | "error";
    message: string;
  } | null>(null);

  const [showEmptyPreview, setShowEmptyPreview] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Flash notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Group items by shop
  const groupedShops: ICartShopGroup[] = useMemo(() => {
    const map = new Map<number, ICartShopGroup>();
    for (const item of items) {
      if (!map.has(item.shop_id)) {
        map.set(item.shop_id, {
          shop_id: item.shop_id,
          shop_name: item.shop_name,
          shop_badge: item.shop_badge,
          shop_avatar_text: item.shop_avatar_text,
          shop_location: item.shop_location,
          items: [],
          voucher: shopVouchers[item.shop_id],
          is_selected: false,
        });
      }
      map.get(item.shop_id)!.items.push(item);
    }

    return Array.from(map.values()).map((g) => ({
      ...g,
      is_selected: g.items.length > 0 && g.items.every((it) => it.selected),
    }));
  }, [items, shopVouchers]);

  const isAllSelected = items.length > 0 && items.every((it) => it.selected);

  // Handlers
  const handleToggleAll = (checked: boolean) => {
    dispatch(toggleAllSelection(checked));
  };

  const handleToggleShopSelect = (shopId: number, selected: boolean) => {
    dispatch(toggleShopSelection({ shopId, selected }));
  };

  const handleToggleItemSelect = (itemId: number) => {
    dispatch(toggleItemSelection(itemId));
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    dispatch(updateItemQuantity({ itemId, quantity }));
  };

  const handleRemoveItem = (itemId: number) => {
    dispatch(removeItem(itemId));
    setNotification({
      type: "info",
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    });
  };

  const handleDeleteSelected = () => {
    if (summary.selected_count === 0) {
      setNotification({
        type: "error",
        message: "Vui lòng chọn ít nhất một sản phẩm để xóa.",
      });
      return;
    }
    dispatch(removeSelectedItemsAction());
    setNotification({
      type: "info",
      message: `Đã xóa ${summary.selected_count} sản phẩm đã chọn`,
    });
  };

  const handleMoveToWishlist = () => {
    if (summary.selected_count === 0) {
      setNotification({
        type: "error",
        message: "Vui lòng chọn sản phẩm cần lưu vào yêu thích.",
      });
      return;
    }
    setNotification({
      type: "success",
      message: `Đã lưu ${summary.selected_count} sản phẩm vào danh sách yêu thích!`,
    });
  };

  const handleSaveItemForLater = (item: CartItem) => {
    setNotification({
      type: "success",
      message: `Đã lưu "${item.name}" vào danh sách yêu thích!`,
    });
  };

  const handleApplyShopVoucher = async (shopId: number, code: string) => {
    await dispatch(applyShopVoucherAction({ shopId, code })).unwrap();
    setNotification({
      type: "success",
      message: `Đã áp dụng thành công mã ưu đãi của shop!`,
    });
  };

  const handleRemoveShopVoucher = (shopId: number) => {
    dispatch(removeShopVoucher(shopId));
    setNotification({
      type: "info",
      message: "Đã hủy áp dụng mã giảm giá của shop.",
    });
  };

  const handleApplyPlatformVoucher = async (code: string) => {
    await dispatch(applyPlatformVoucherAction(code)).unwrap();
    setNotification({
      type: "success",
      message: `Đã áp dụng thành công mã ưu đãi sàn "${code}"!`,
    });
  };

  const handleRemovePlatformVoucher = () => {
    dispatch(removePlatformVoucher());
    setNotification({
      type: "info",
      message: "Đã hủy mã voucher sàn.",
    });
  };

  const handleCheckout = () => {
    if (summary.selected_count === 0) {
      setNotification({
        type: "error",
        message: "Vui lòng chọn ít nhất 1 sản phẩm để tiến hành đặt hàng.",
      });
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setNotification({
        type: "success",
        message: `Đang chuyển hướng tới cổng thanh toán an toàn cho ${summary.selected_count} sản phẩm (Tổng: ${formatCurrencyVND(summary.grand_total)})...`,
      });
    }, 800);
  };

  return (
    <CustomerLayout
      cartItemCount={summary.total_items}
      cartTotal={formatCurrencyVND(summary.grand_total)}
    >
      <div className="w-full pb-16">
        {/* Stepper Header */}
        <CartBreadcrumbStepper currentStep={1} />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm transition-all ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : notification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="material-symbols-outlined text-[20px]">
                  {notification.type === "success"
                    ? "check_circle"
                    : notification.type === "error"
                    ? "error"
                    : "info"}
                </span>
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Cart Header & Free Shipping Status Banner */}
          <CartFreeShippingTracker
            totalItems={summary.total_items}
            freeShippingThreshold={summary.free_shipping_threshold}
            progress={summary.free_shipping_progress}
            amountLeft={summary.amount_left_for_free_shipping}
            isEligible={summary.is_free_shipping_eligible}
            onGoBack={handleGoBack}
          />

          {items.length === 0 ? (
            /* Empty state when cart has 0 items */
            <CartEmptyState />
          ) : (
            /* Main Two-Column Workflow (70% Left / 30% Right => 8 cols / 4 cols) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Cart Items & Vendors (8 of 12 cols = 66.6%) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {/* Global Select All Control Bar */}
                <CartSelectAllBar
                  totalItems={summary.total_items}
                  isAllSelected={isAllSelected}
                  onToggleAll={handleToggleAll}
                  onDeleteSelected={handleDeleteSelected}
                  onMoveToWishlist={handleMoveToWishlist}
                />

                {/* Vendor Groups */}
                {groupedShops.map((group) => (
                  <CartShopGroup
                    key={group.shop_id}
                    shopId={group.shop_id}
                    shopName={group.shop_name}
                    shopBadge={group.shop_badge}
                    shopAvatarText={group.shop_avatar_text}
                    shopLocation={group.shop_location}
                    items={group.items}
                    voucher={group.voucher}
                    onToggleShopSelect={handleToggleShopSelect}
                    onToggleItemSelect={handleToggleItemSelect}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onSaveForLater={handleSaveItemForLater}
                    onApplyShopVoucher={handleApplyShopVoucher}
                    onRemoveShopVoucher={handleRemoveShopVoucher}
                  />
                ))}
              </div>

              {/* Right Column: Sticky Order Summary Sidebar (4 of 12 cols = 33.3%) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <CartOrderSummary
                  summary={summary}
                  platformVoucher={platformVoucher}
                  onApplyPlatformVoucher={handleApplyPlatformVoucher}
                  onRemovePlatformVoucher={handleRemovePlatformVoucher}
                  onCheckout={handleCheckout}
                  isCheckingOut={isCheckingOut}
                />
              </div>
            </div>
          )}

          {/* Toggleable Empty State Interactive Preview Section from HTML */}
          {items.length > 0 && (
            <div className="mt-10 bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/60">
              <div
                onClick={() => setShowEmptyPreview((v) => !v)}
                className="flex items-center justify-between pb-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    preview
                  </span>
                  <span className="font-headline-md text-base sm:text-lg text-on-surface font-bold">
                    Xem trước: Trạng thái giỏ hàng trống (Empty State Preview)
                  </span>
                </div>
                <button
                  type="button"
                  className="text-xs sm:text-sm text-secondary font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>{showEmptyPreview ? "Thu gọn" : "Mở rộng xem trước"}</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {showEmptyPreview ? "expand_less" : "expand_more"}
                  </span>
                </button>
              </div>

              {showEmptyPreview && (
                <div className="pt-4 border-t border-surface-container">
                  <CartEmptyState isCollapsiblePreview />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ShoppingCart;
