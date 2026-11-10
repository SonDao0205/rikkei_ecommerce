import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "@/app/layout/CustomerLayout";
import {
  CartBreadcrumbStepper,
  CartFreeShippingTracker,
  CartSelectAllBar,
  CartShopGroup,
  CartOrderSummary,
  CartEmptyState,
} from "@/domains/customer/components/cart";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
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
  clearCartError,
} from "@/domains/customer/state/cartSlice";
import type { CartItem, CartShopGroup as ICartShopGroup } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

export const ShoppingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items, shopVouchers, platformVoucher, summary, error } =
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

  const activeNotification =
    notification ||
    (error
      ? {
          type: "error" as const,
          message: error,
        }
      : null);

  const handleDismissNotification = () => {
    setNotification(null);
    if (error) {
      dispatch(clearCartError());
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Flash notification timer
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auto-clear Redux cart error after timer
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearCartError());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

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
        message: "Vui lòng chọn ít nhất một sản phẩm còn hàng để tiếp tục thanh toán.",
      });
      return;
    }
    navigate("/checkout");
  };

  return (
    <CustomerLayout
      cartItemCount={summary.total_items}
      cartTotal={formatCurrencyVND(summary.grand_total)}
    >
      <div className="w-full pb-16">
        {/* Stepper Header */}
        <CartBreadcrumbStepper currentStep={1} />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Notification Toast Alert */}
          {activeNotification && (
            <div
              className={`mb-4 p-4 rounded-xl flex items-center justify-between shadow-sm transition-all ${
                activeNotification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : activeNotification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="material-symbols-outlined text-[20px]">
                  {activeNotification.type === "success"
                    ? "check_circle"
                    : activeNotification.type === "error"
                    ? "error"
                    : "info"}
                </span>
                <span>{activeNotification.message}</span>
              </div>
              <button
                type="button"
                onClick={handleDismissNotification}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Cart Header & Free Shipping Status Banner */}
          <CartFreeShippingTracker
            totalItems={summary.total_items}
            onGoBack={handleGoBack}
          />

          {!isAuthenticated ? (
            <div className="py-16 text-center max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[40px]">lock</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Đăng nhập để xem giỏ hàng</h2>
              <p className="text-sm text-outline mb-6">
                Vui lòng đăng nhập tài khoản để xem các sản phẩm trong giỏ hàng và tiếp tục thanh toán.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login?redirect=/cart")}
                className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-container transition-all cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : items.length === 0 ? (
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
                    shopBadge={group.shop_badge || "Chính hãng"}
                    shopAvatarText={group.shop_avatar_text || "SHOP"}
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
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default ShoppingCart;
