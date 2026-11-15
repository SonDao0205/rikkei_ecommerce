import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { CartBreadcrumbStepper } from "@/domains/customer/components/cart/CartBreadcrumbStepper";
import {
  CheckoutAddressCard,
  CheckoutShopItems,
  CheckoutShippingSelect,
  CheckoutPaymentSelect,
  CheckoutOrderSummary,
  CheckoutSuccessModal,
} from "@/domains/order/components/checkout";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  fetchCart,
  applyShopVoucherAction,
  applyPlatformVoucherAction,
  removeShopVoucher,
  removePlatformVoucher,
} from "@/domains/customer/state/cartSlice";
import {
  cartApi,
  apiErrorMessage,
  type CheckoutAddress,
  type CheckoutMethod,
  type CheckoutQuote,
  type CreatedOrder,
} from "@/domains/customer/api/cartApi";
import type { CartItem } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";

export const Checkout: React.FC = () => {
  const { t } = useTranslation("customer");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items, shopVouchers, platformVoucher, summary } = useAppSelector(
    (state) => state.cart
  );

  // Checkout Options & Address state
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [shippingMethods, setShippingMethods] = useState<CheckoutMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [selectedShippingId, setSelectedShippingId] = useState<number>(0);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number>(0);

  // Quote State
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Loading & Submission State
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>("");
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const submissionInFlight = useRef(false);
  const activeSubmissionKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const submissionStorageKey = `checkout.idempotency.v1:${user?.id ?? "anonymous"}`;

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/cart");
    }
  };

  // Filter selected & available items for checkout
  const selectedItems = useMemo(
    () => items.filter((it) => it.selected && it.is_available !== false),
    [items]
  );

  // Group selected items by shop
  const groupedShopItems = useMemo(() => {
    const map = new Map<
      number,
      {
        shopId: number;
        shopName: string;
        shopBadge?: string;
        items: CartItem[];
        shopSubtotal: number;
      }
    >();

    for (const item of selectedItems) {
      if (!map.has(item.shop_id)) {
        map.set(item.shop_id, {
          shopId: item.shop_id,
          shopName: item.shop_name,
          shopBadge: item.shop_badge || "Chính hãng",
          items: [],
          shopSubtotal: 0,
        });
      }
      const g = map.get(item.shop_id)!;
      g.items.push(item);
      g.shopSubtotal += (item.unit_price ?? item.price ?? 0) * item.quantity;
    }

    return Array.from(map.values());
  }, [selectedItems]);

  // Initial Fetch Cart, Addresses, and Checkout Options
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }

    const loadData = async () => {
      setIsLoadingInitialData(true);
      try {
        await dispatch(fetchCart()).unwrap();
        const [loadedAddresses, options] = await Promise.all([
          cartApi.getAddresses().catch(() => [] as CheckoutAddress[]),
          cartApi.getCheckoutOptions().catch(() => ({
            shipping_methods: [
              {
                id: 980001,
                code: "STANDARD",
                name: "Giao hàng tiêu chuẩn",
                base_fee: 30000,
                estimated_days: "2-4 ngày",
              },
              {
                id: 980002,
                code: "EXPRESS",
                name: "Giao hàng nhanh",
                base_fee: 50000,
                estimated_days: "1-2 ngày",
              },
            ],
            payment_methods: [
              {
                id: 980101,
                code: "COD",
                name: "Thanh toán khi nhận hàng (COD)",
              },
              {
                id: 980102,
                code: "BANK_TRANSFER",
                name: "Chuyển khoản ngân hàng",
              },
            ],
          })),
        ]);

        setAddresses(loadedAddresses);
        setShippingMethods(options.shipping_methods);
        setPaymentMethods(options.payment_methods);

        // If the browser closed after the server committed but before the response arrived,
        // replay the stored request once to recover the authoritative order response.
        if (user?.id) {
          try {
            const rawPending = sessionStorage.getItem(submissionStorageKey);
            if (rawPending) {
              const pending = JSON.parse(rawPending) as {
                fingerprint?: string;
                key?: string;
                request?: Parameters<typeof cartApi.createOrder>[0];
              };
              if (
                pending.key &&
                pending.request &&
                pending.fingerprint === JSON.stringify(pending.request)
              ) {
                const recoveredOrder = await cartApi.createOrder(pending.request, pending.key);
                setCreatedOrder(recoveredOrder);
                setCreatedOrderCode(recoveredOrder.order_code);
                setIsSuccessModalOpen(true);
                sessionStorage.removeItem(submissionStorageKey);
                await dispatch(fetchCart()).unwrap().catch(() => undefined);
              }
            }
          } catch {
            // Leave the saved key/body in place so a later retry can safely resolve the outcome.
          }
        }

        // Pick default address or first
        const defaultAddr =
          loadedAddresses.find((a) => a.is_default) || loadedAddresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }

        // Pick default shipping
        if (options.shipping_methods.length > 0) {
          setSelectedShippingId(options.shipping_methods[0].id);
        }

        // Pick default payment (prefer COD)
        const codMethod =
          options.payment_methods.find((m) => m.code === "COD") ||
          options.payment_methods[0];
        if (codMethod) {
          setSelectedPaymentId(codMethod.id);
        }
      } catch (err: unknown) {
        setQuoteError(apiErrorMessage(err, "Không thể tải dữ liệu thanh toán"));
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadData();
  }, [isAuthenticated, dispatch, navigate, user?.id, submissionStorageKey]);

  // Recalculate quote with Backend API
  const calculateServerQuote = useCallback(async () => {
    if (
      !selectedAddressId ||
      !selectedShippingId ||
      !selectedPaymentId ||
      selectedItems.length === 0
    ) {
      return;
    }

    try {
      setIsCalculatingQuote(true);
      setQuoteError(null);

      // Collect active shop vouchers
      const shopCodes: Record<string, string> = {};
      for (const [idStr, voucher] of Object.entries(shopVouchers)) {
        if (voucher.is_applied && voucher.code) {
          shopCodes[idStr] = voucher.code;
        }
      }

      const res = await cartApi.quoteCheckout({
        address_id: selectedAddressId,
        shipping_method_id: selectedShippingId,
        payment_method_id: selectedPaymentId,
        cart_item_ids: selectedItems.map((it) => it.id),
        ...(platformVoucher?.is_applied ? { platform_voucher: platformVoucher.code } : {}),
        ...(Object.keys(shopCodes).length > 0 ? { shop_vouchers: shopCodes } : {}),
      });

      setCheckoutQuote(res);
      setQuoteError(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data as
          | { errors?: Array<{ code?: string; message?: string }> }
          | undefined;
        const errCode = errData?.errors?.[0]?.code;
        if (errCode && errCode.startsWith("voucher_")) {
          try {
            // Obtain base server quote without the failing voucher
            const baseQuote = await cartApi.quoteCheckout({
              address_id: selectedAddressId,
              shipping_method_id: selectedShippingId,
              payment_method_id: selectedPaymentId,
              cart_item_ids: selectedItems.map((it) => it.id),
            });
            setCheckoutQuote(baseQuote);
            setQuoteError(apiErrorMessage(err, "Mã ưu đãi không hợp lệ trên máy chủ."));
            return;
          } catch {
            // Fall through to offline calculation
          }
        }
      }
      const msg = apiErrorMessage(
        err,
        "Không thể tính báo giá tự động từ server. Đang dùng tạm tính offline."
      );
      setQuoteError(msg);
      setCheckoutQuote(null);
    } finally {
      setIsCalculatingQuote(false);
    }
  }, [
    selectedAddressId,
    selectedShippingId,
    selectedPaymentId,
    selectedItems,
    shopVouchers,
    platformVoucher,
  ]);

  // Recalculate when dependencies change
  useEffect(() => {
    let isMounted = true;
    if (!isLoadingInitialData && selectedItems.length > 0 && selectedAddressId > 0) {
      const timer = setTimeout(() => {
        if (isMounted) {
          calculateServerQuote();
        }
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [
    isLoadingInitialData,
    selectedItems.length,
    selectedAddressId,
    selectedShippingId,
    selectedPaymentId,
    shopVouchers,
    platformVoucher,
    calculateServerQuote,
  ]);

  // Voucher Handlers
  const handleApplyShopVoucher = async (shopId: number, code: string) => {
    await dispatch(applyShopVoucherAction({ shopId, code })).unwrap();
  };

  const handleRemoveShopVoucher = (shopId: number) => {
    dispatch(removeShopVoucher(shopId));
  };

  const handleApplyPlatformVoucher = async (code: string) => {
    await dispatch(applyPlatformVoucherAction(code)).unwrap();
  };

  const handleRemovePlatformVoucher = () => {
    dispatch(removePlatformVoucher());
  };

  // Submit Order Handler
  const handlePlaceOrder = async () => {
    if (submissionInFlight.current) return;
    if (selectedItems.length === 0) {
      setQuoteError("Không có sản phẩm nào trong giỏ hàng để thanh toán.");
      return;
    }

    if (!selectedAddressId) {
      setQuoteError("Vui lòng thêm hoặc chọn địa chỉ nhận hàng.");
      return;
    }

    if (!checkoutQuote || isCalculatingQuote || quoteError) {
      setQuoteError("Chưa có báo giá hợp lệ từ hệ thống. Vui lòng kiểm tra lựa chọn và thử lại.");
      return;
    }

    const shopCodes: Record<string, string> = {};
    for (const [idStr, voucher] of Object.entries(shopVouchers)) {
      if (voucher.is_applied && voucher.code) shopCodes[idStr] = voucher.code;
    }
    const request = {
      address_id: selectedAddressId,
      shipping_method_id: selectedShippingId,
      payment_method_id: selectedPaymentId,
      cart_item_ids: selectedItems.map((item) => item.id),
      ...(platformVoucher?.is_applied ? { platform_voucher: platformVoucher.code } : {}),
      ...(Object.keys(shopCodes).length ? { shop_vouchers: shopCodes } : {}),
    };
    const fingerprint = JSON.stringify(request);
    const storageKey = submissionStorageKey;
    let key = activeSubmissionKey.current?.fingerprint === fingerprint
      ? activeSubmissionKey.current.key
      : "";
    if (!key) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as { fingerprint?: string; key?: string };
          if (parsed.fingerprint === fingerprint && parsed.key) key = parsed.key;
        }
      } catch {
        // sessionStorage may be unavailable in private browsing.
      }
    }
    if (!key) {
      key = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    }
    activeSubmissionKey.current = { fingerprint, key };
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint, key, request }));
    } catch {
      // The in-memory key still protects retries until leaving this page.
    }

    submissionInFlight.current = true;
    setIsSubmittingOrder(true);
    setQuoteError(null);
    try {
      const order = await cartApi.createOrder(request, key);
      setCreatedOrder(order);
      setCreatedOrderCode(order.order_code);
      setIsSuccessModalOpen(true);
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved && (JSON.parse(saved) as { key?: string }).key === key) {
          sessionStorage.removeItem(storageKey);
        }
      } catch {
        // The server response is already committed.
      }
      activeSubmissionKey.current = null;
      await dispatch(fetchCart()).unwrap().catch(() => undefined);
    } catch (err: unknown) {
      setQuoteError(apiErrorMessage(err, "Không thể tạo đơn lúc này. Hãy thử lại; hệ thống sẽ chống tạo đơn trùng."));
    } finally {
      submissionInFlight.current = false;
      setIsSubmittingOrder(false);
    }
  };

  // Fallback financial calculations in case server quote is loading/failed
  const fallbackShippingFee =
    shippingMethods.find((m) => m.id === selectedShippingId)?.base_fee ?? 30000;
  const fallbackSubtotal = summary.items_subtotal;
  const fallbackShopDiscount = summary.store_vouchers_discount;
  const fallbackPlatformDiscount = summary.platform_voucher_discount;
  const fallbackTotal = Math.max(
    0,
    fallbackSubtotal +
      fallbackShippingFee -
      fallbackShopDiscount -
      fallbackPlatformDiscount
  );

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === selectedPaymentId
  );
  const selectedPaymentCode = selectedPaymentMethod?.code || "COD";

  const shopNames = groupedShopItems.map((g) => g.shopName);
  const selectedShippingMethod = shippingMethods.find(
    (m) => m.id === selectedShippingId
  );

  return (
    <CustomerLayout
      cartItemCount={summary.total_items}
      cartTotal={formatCurrencyVND(summary.grand_total)}
    >
      <div className="w-full pb-16">
        {/* Stepper Header (Step 2: Thanh toán) */}
        <CartBreadcrumbStepper currentStep={2} />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* Back Button & Page Title */}
          <div className="flex flex-col gap-2 pb-4 border-b border-outline-variant/30">
            <button
              type="button"
              onClick={handleGoBack}
              className="group inline-flex w-fit items-center gap-1.5 font-semibold text-xs sm:text-sm text-on-surface-variant transition-colors hover:text-primary cursor-pointer py-1"
              title={t("checkout.header.back_title", { defaultValue: "Quay lại trang trước" })}
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span>{t("checkout.header.back", { defaultValue: "Quay lại" })}</span>
            </button>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-headline-md flex items-center gap-2">
                <span>{t("checkout.header.title", { defaultValue: "Thanh toán đơn hàng" })}</span>
                <span className="text-base sm:text-lg font-normal text-on-surface-variant">
                  {t("checkout.header.subtitle", { defaultValue: "(Checkout)" })}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                {t("checkout.header.desc", { defaultValue: "Kiểm tra thông tin nhận hàng, chọn phương thức thanh toán và áp dụng các mã ưu đãi có sẵn." })}
              </p>
            </div>
          </div>

          {isLoadingInitialData ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
              <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
              <p className="text-sm text-on-surface-variant font-medium">
                {t("checkout.loading", { defaultValue: "Đang chuẩn bị thông tin thanh toán..." })}
              </p>
            </div>
          ) : selectedItems.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">shopping_cart</span>
              </div>
              <h2 className="text-lg font-bold text-on-surface mb-2">
                {t("checkout.empty_selected.title", { defaultValue: "Không có sản phẩm nào được chọn" })}
              </h2>
              <p className="text-xs sm:text-sm text-outline mb-6">
                {t("checkout.empty_selected.desc", { defaultValue: "Vui lòng quay lại giỏ hàng và chọn ít nhất một sản phẩm còn hàng để tiếp tục thanh toán." })}
              </p>
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all cursor-pointer"
              >
                {t("checkout.empty_selected.back_to_cart", { defaultValue: "Quay lại giỏ hàng" })}
              </button>
            </div>
          ) : (
            /* Main 2-Column Workflow (8 cols Left / 4 cols Right on desktop) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-6">
              {/* Left Column: Items, Address, Shipping, Payment (8 of 12) */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* 1. Items Grouped by Shop with Available Shop Vouchers */}
                <CheckoutShopItems
                  groups={groupedShopItems}
                  shopVouchers={shopVouchers}
                  onApplyShopVoucher={handleApplyShopVoucher}
                  onRemoveShopVoucher={handleRemoveShopVoucher}
                  isCalculating={isCalculatingQuote}
                />

                {/* 2. Delivery Address Card */}
                <CheckoutAddressCard
                  addresses={addresses}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={setSelectedAddressId}
                  isLoading={isCalculatingQuote}
                />

                {/* 3. Shipping Method Selector */}
                <CheckoutShippingSelect
                  shippingMethods={shippingMethods}
                  selectedShippingId={selectedShippingId}
                  onSelectShipping={setSelectedShippingId}
                />

                {/* 4. Payment Method Selector */}
                <CheckoutPaymentSelect
                  paymentMethods={paymentMethods}
                  selectedPaymentId={selectedPaymentId}
                  onSelectPayment={setSelectedPaymentId}
                />
              </div>

              {/* Right Column: Sticky Order Summary & Platform Vouchers (4 of 12) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <CheckoutOrderSummary
                  quote={checkoutQuote}
                  fallbackSubtotal={fallbackSubtotal}
                  fallbackShippingFee={fallbackShippingFee}
                  fallbackShopDiscount={fallbackShopDiscount}
                  fallbackPlatformDiscount={fallbackPlatformDiscount}
                  fallbackTotal={fallbackTotal}
                  platformVoucher={platformVoucher}
                  onApplyPlatformVoucher={handleApplyPlatformVoucher}
                  onRemovePlatformVoucher={handleRemovePlatformVoucher}
                  onSubmitOrder={handlePlaceOrder}
                  isCalculating={isCalculatingQuote}
                  isSubmitting={isSubmittingOrder}
                  selectedPaymentCode={selectedPaymentCode}
                  errorMessage={quoteError}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Success Modal from checkout.html */}
      <CheckoutSuccessModal
        isOpen={isSuccessModalOpen}
        orderCode={createdOrderCode}
        totalAmount={createdOrder?.total_amount ?? checkoutQuote?.total ?? fallbackTotal}
        shopNames={createdOrder?.shop_orders.map((shopOrder) => shopOrder.shop_name) ?? shopNames}
        shippingCarrier={selectedShippingMethod?.name}
        paymentMethodCode={createdOrder?.payment_method.code}
        paymentReference={createdOrder?.payment.transaction_ref}
        onViewOrders={() => {
          if (!createdOrder) return;
          const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
          const fullAddress = selectedAddr
            ? [selectedAddr.street_detail, selectedAddr.ward, selectedAddr.district, selectedAddr.province]
                .filter(Boolean)
                .join(", ")
            : "Địa chỉ nhận hàng";

          navigate("/order/complete", {
            state: {
              orderCode: createdOrder.order_code,
              customerName: selectedAddr?.recipient_name || "Quý khách",
              customerPhone: selectedAddr?.phone || "",
              deliveryAddress: createdOrder.shipping_address || fullAddress,
              carrierName: selectedShippingMethod?.name || "GHN Express",
              estimatedDeliveryDate: selectedShippingMethod?.estimated_days || "2-4 ngày tới",
              paymentMethodName: selectedPaymentMethod?.name || "Thu hộ COD",
              paymentMethodCode: selectedPaymentCode,
              itemsSubtotal: createdOrder.subtotal,
              shippingFee: createdOrder.shipping_fee,
              shopDiscount: createdOrder.shop_discount_total,
              platformDiscount: createdOrder.platform_discount,
              totalAmount: createdOrder.total_amount,
              transactionReference: createdOrder.payment.transaction_ref,
              shopGroups: groupedShopItems.map((g) => ({
                shopId: g.shopId,
                shopName: g.shopName,
                shopBadge: g.shopBadge,
                items: g.items.map((it) => ({
                  id: it.id,
                  productId: it.product_id,
                  productName: it.name || it.product_name,
                  variantLabel: it.variant_label || "Mặc định",
                  quantity: it.quantity,
                  unitPrice: it.unit_price ?? it.price ?? 0,
                  originalPrice: it.original_price,
                  lineTotal: (it.unit_price ?? it.price ?? 0) * it.quantity,
                  imageUrl: it.image_url || it.product_thumbnail_url || "",
                })),
                subtotal: g.shopSubtotal,
              })),
            },
          });
        }}
        onContinueShopping={() => navigate("/")}
      />
    </CustomerLayout>
  );
};

export default Checkout;

