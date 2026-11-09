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
import { apiErrorMessage, cartApi, type CheckoutAddress, type CheckoutMethod, type CheckoutQuote, type CreatedOrder } from "@/domains/customer/api/cartApi";

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

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [shippingMethods, setShippingMethods] = useState<CheckoutMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutMethod[]>([]);
  const [addressId, setAddressId] = useState(0);
  const [shippingMethodId, setShippingMethodId] = useState(0);
  const [paymentMethodId, setPaymentMethodId] = useState(0);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

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

  const handleCheckout = async () => {
    if (summary.selected_count === 0) { setNotification({type:"error",message:"Vui lòng chọn ít nhất một sản phẩm còn hàng."}); return; }
    setIsCheckingOut(true); setCheckoutError(null); setCheckoutQuote(null); setCreatedOrder(null); setOrderNote("");
    try { const [options, savedAddresses] = await Promise.all([cartApi.getCheckoutOptions(), cartApi.getAddresses()]); setShippingMethods(options.shipping_methods); setPaymentMethods(options.payment_methods); setAddresses(savedAddresses); setAddressId(savedAddresses.find((a)=>a.is_default)?.id ?? savedAddresses[0]?.id ?? 0); setShippingMethodId(options.shipping_methods[0]?.id ?? 0); setPaymentMethodId(options.payment_methods[0]?.id ?? 0); setCheckoutOpen(true); }
    catch(err) { setCheckoutError(apiErrorMessage(err, "Không tải được thông tin checkout.")); setCheckoutOpen(true); } finally { setIsCheckingOut(false); }
  };

  const handleCalculateQuote = async () => {
    setIsCheckingOut(true); setCheckoutError(null); setCheckoutQuote(null); setCreatedOrder(null);
    try {
      if (!addressId || !shippingMethodId || !paymentMethodId) throw new Error("Cần có địa chỉ nhận hàng và phương thức giao hàng, thanh toán.");
      const selected=items.filter((item)=>item.selected && item.is_available); if(!selected.length) throw new Error("Chọn ít nhất một sản phẩm còn khả dụng.");
      const shopCodes=Object.fromEntries(Object.entries(shopVouchers).filter(([,v])=>v.is_applied).map(([id,v])=>[id,v.code]));
      setCheckoutQuote(await cartApi.quoteCheckout({address_id:addressId,shipping_method_id:shippingMethodId,payment_method_id:paymentMethodId,cart_item_ids:selected.map((item)=>item.id),...(platformVoucher?.is_applied?{platform_voucher:platformVoucher.code}:{}),...(Object.keys(shopCodes).length?{shop_vouchers:shopCodes}:{})}));
    } catch(err) { setCheckoutError(apiErrorMessage(err, "Không thể tính báo giá. Vui lòng tải lại giỏ hàng.")); } finally { setIsCheckingOut(false); }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true); setCheckoutError(null);
    try {
      if (!addressId || !shippingMethodId || !paymentMethodId) throw new Error("Cần có địa chỉ nhận hàng và phương thức giao hàng, thanh toán.");
      const selected = items.filter((item) => item.selected && item.is_available);
      if (!selected.length) throw new Error("Chọn ít nhất một sản phẩm còn khả dụng.");
      const shopCodes = Object.fromEntries(
        Object.entries(shopVouchers)
          .filter(([, v]) => v.is_applied)
          .map(([id, v]) => [id, v.code])
      );
      const res = await cartApi.createOrder({
        address_id: addressId,
        shipping_method_id: shippingMethodId,
        payment_method_id: paymentMethodId,
        cart_item_ids: selected.map((item) => item.id),
        note: orderNote.trim() || undefined,
        ...(platformVoucher?.is_applied ? { platform_voucher: platformVoucher.code } : {}),
        ...(Object.keys(shopCodes).length ? { shop_vouchers: shopCodes } : {}),
      });
      setCreatedOrder(res);
      setCheckoutQuote(null);
      dispatch(fetchCart());
      setNotification({
        type: "success",
        message: `Đặt hàng thành công! Mã đơn: ${res.order_code}`,
      });
    } catch (err) {
      setCheckoutError(apiErrorMessage(err, "Không thể tạo đơn hàng. Vui lòng thử lại."));
    } finally {
      setIsPlacingOrder(false);
    }
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
                  isCheckingOut={isCheckingOut}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h2 id="checkout-title" className="text-xl font-bold">{createdOrder ? "Đặt hàng thành công!" : "Thông tin giao hàng và báo giá"}</h2><button aria-label="Đóng" onClick={()=>setCheckoutOpen(false)} className="text-2xl">×</button></div>
            {checkoutError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}
            {createdOrder ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                  <span className="material-symbols-outlined text-[48px] text-green-600">check_circle</span>
                  <h3 className="text-lg font-bold text-green-800 mt-2">Cảm ơn bạn đã đặt hàng!</h3>
                  <p className="text-sm text-green-700 mt-1">Mã đơn hàng: <strong className="font-mono text-base">{createdOrder.order_code}</strong></p>
                </div>
                <div className="rounded-xl border bg-slate-50 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-slate-800">Thông tin người nhận:</p>
                  <p className="text-slate-600">{createdOrder.recipient_name} · {createdOrder.recipient_phone}</p>
                  <p className="text-slate-600">{createdOrder.shipping_address}</p>
                  {createdOrder.note && <p className="text-slate-600 italic">Ghi chú: {createdOrder.note}</p>}
                  <div className="border-t pt-2 mt-2">
                    <p className="font-semibold text-slate-800">Hình thức thanh toán: {createdOrder.payment_method?.name}</p>
                    {createdOrder.payment_method?.code === "BANK_TRANSFER" ? (
                      <div className="mt-2 rounded-lg bg-amber-50 p-3 text-amber-900 border border-amber-200 text-xs leading-relaxed">
                        <p className="font-bold">Hướng dẫn chuyển khoản:</p>
                        <p>Số tiền: <strong>{formatCurrencyVND(createdOrder.total_amount)}</strong></p>
                        <p>Nội dung chuyển khoản (bắt buộc): <strong className="font-mono text-sm bg-amber-100 px-1 py-0.5 rounded">{createdOrder.order_code}</strong></p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Vui lòng chuẩn bị đủ tiền mặt khi nhân viên giao hàng liên hệ.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Đơn hàng tách theo shop ({createdOrder.shop_orders?.length} shop):</p>
                  {createdOrder.shop_orders?.map((so) => (
                    <div key={so.id} className="rounded-lg border p-3 text-xs flex justify-between items-center bg-white shadow-sm">
                      <div>
                        <p className="font-bold text-slate-800">{so.shop_name}</p>
                        <p className="text-slate-500 font-mono">Mã: {so.shop_order_code}</p>
                        <p className="text-slate-500">{so.item_count} sản phẩm</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-primary">{formatCurrencyVND(so.total_amount)}</span>
                        <span className="block px-2 py-0.5 mt-1 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 text-center">Chờ xác nhận</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-primary">{formatCurrencyVND(createdOrder.total_amount)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow hover:bg-primary-container transition-all"
                >
                  Hoàn tất
                </button>
              </div>
            ) : addresses.length===0 ? <div className="rounded-xl bg-amber-50 p-4 text-sm">Bạn chưa có địa chỉ giao hàng. Hãy thêm địa chỉ trong trang tài khoản rồi quay lại.<button type="button" onClick={()=>navigate("/profile/address")} className="ml-2 font-bold text-primary underline">Quản lý địa chỉ</button></div> : <div className="space-y-4">
              <label className="block text-sm font-semibold">Địa chỉ nhận hàng<select value={addressId} onChange={(e)=>{setAddressId(Number(e.target.value));setCheckoutQuote(null);}} className="mt-1 w-full rounded-lg border p-3">{addresses.map((a)=><option key={a.id} value={a.id}>{a.recipient_name} · {a.phone} · {a.street_detail}, {a.ward}, {a.district}, {a.province}</option>)}</select></label>
              <label className="block text-sm font-semibold">Vận chuyển<select value={shippingMethodId} onChange={(e)=>{setShippingMethodId(Number(e.target.value));setCheckoutQuote(null);}} className="mt-1 w-full rounded-lg border p-3">{shippingMethods.map((m)=><option key={m.id} value={m.id}>{m.name} · {formatCurrencyVND(m.base_fee??0)}{m.estimated_days?` · ${m.estimated_days}`:""}</option>)}</select></label>
              <label className="block text-sm font-semibold">Thanh toán<select value={paymentMethodId} onChange={(e)=>{setPaymentMethodId(Number(e.target.value));setCheckoutQuote(null);}} className="mt-1 w-full rounded-lg border p-3">{paymentMethods.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
              <button type="button" disabled={isCheckingOut || isPlacingOrder} onClick={handleCalculateQuote} className="w-full rounded-xl bg-slate-800 px-4 py-3 font-bold text-white disabled:opacity-50">{isCheckingOut?"Đang tính...":"Tính phí và xem báo giá"}</button>
              {checkoutQuote && (
                <section aria-live="polite" className="rounded-xl border bg-slate-50 p-4 space-y-3 text-sm">
                  <p className="font-bold text-slate-800">Chi tiết báo giá</p>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between"><span>Tiền hàng:</span><span>{formatCurrencyVND(checkoutQuote.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Phí giao hàng:</span><span>{formatCurrencyVND(checkoutQuote.shipping_fee)}</span></div>
                    {checkoutQuote.shop_discount > 0 && <div className="flex justify-between text-green-700"><span>Giảm giá shop:</span><span>−{formatCurrencyVND(checkoutQuote.shop_discount)}</span></div>}
                    {checkoutQuote.platform_discount > 0 && <div className="flex justify-between text-green-700"><span>Voucher sàn:</span><span>−{formatCurrencyVND(checkoutQuote.platform_discount)}</span></div>}
                    <div className="border-t pt-2 flex justify-between items-center text-base font-black text-on-surface">
                      <span>Tổng thanh toán:</span>
                      <span className="text-lg text-primary">{formatCurrencyVND(checkoutQuote.total)}</span>
                    </div>
                  </div>
                  <label className="block pt-2">
                    <span className="text-xs font-semibold text-slate-700">Ghi chú cho đơn hàng (tùy chọn):</span>
                    <input
                      type="text"
                      maxLength={500}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                      className="mt-1 w-full rounded-lg border bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isPlacingOrder}
                    onClick={handlePlaceOrder}
                    className="w-full rounded-xl bg-primary px-4 py-3.5 font-bold text-white shadow-md hover:bg-primary-container transition-all disabled:opacity-50 cursor-pointer text-base flex items-center justify-center gap-2"
                  >
                    {isPlacingOrder ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        <span>Đang xử lý đơn hàng...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                        <span>Xác nhận đặt hàng</span>
                      </>
                    )}
                  </button>
                </section>
              )}
            </div>}
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default ShoppingCart;
