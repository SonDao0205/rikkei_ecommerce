import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomerLayout from "@/app/layout/CustomerLayout";
import { CartBreadcrumbStepper } from "@/domains/customer/components/cart/CartBreadcrumbStepper";
import {
  OrderSuccessHero,
  OrderOverviewMeta,
  OrderShippingBento,
  OrderItemizedSummary,
  OrderActionsBar,
  OrderGuaranteesStrip,
  type CompleteOrderShopGroup,
} from "@/domains/order/components/complete";
import { formatCurrencyVND } from "@/shared/utils/currency";
import { userOrderApi } from "@/domains/customer/api/orderApi";
import type { UserOrder } from "@/domains/order/types";
import type { UserOrderTimelineLog } from "@/domains/order/types/order.types";

export interface CompleteOrderState {
  orderCode?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryNote?: string;
  carrierName?: string;
  trackingCode?: string;
  estimatedDeliveryDate?: string;
  currentStepIndex?: number;
  timeline?: UserOrderTimelineLog[];
  orderTime?: string;
  paymentMethodName?: string;
  paymentMethodCode?: string;
  itemsSubtotal?: number;
  shippingFee?: number;
  shippingDiscount?: number;
  shopDiscount?: number;
  platformDiscount?: number;
  totalAmount?: number;
  shopGroups?: CompleteOrderShopGroup[];
}

function mapUserOrderToCompleteState(order: UserOrder): CompleteOrderState {
  const shopGroups: CompleteOrderShopGroup[] = (order.shops || []).map((shop) => {
    const shopItems = shop.items?.length
      ? shop.items
      : order.items.filter((item) => item.shopId === shop.shopId);
    const subtotal = shopItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    return {
      shopId: shop.shopId,
      shopOrderId: shop.shopOrderId,
      shopName: shop.shopName,
      status: shop.status,
      shopBadge: "Mall",
      shopAvatarText: shop.shopName.charAt(0).toUpperCase(),
      warehouseLocation: "Kho hàng người bán",
      subtotal,
      items: shopItems.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        variantLabel: it.variantName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        originalPrice: it.unitPrice,
        lineTotal: it.unitPrice * it.quantity,
        imageUrl: it.imageUrl,
        stockStatusBadge: "Còn hàng",
      })),
    };
  });

  const lineNameByEventId = new Map(
    order.shops.flatMap((shop) => {
      const lineName = shop.items?.length === 1 ? shop.items[0].productName : shop.shopName;
      return (shop.timeline ?? []).map((event) => [event.id, lineName] as const);
    }),
  );
  const timeline = (order.timeline ?? []).map((event) => {
    const lineName = lineNameByEventId.get(event.id);
    return order.shops.length > 1 && lineName
      ? { ...event, title: `${lineName} · ${event.title}` }
      : event;
  });

  return {
    orderCode: order.orderCode,
    customerName: order.recipient?.name || "Quý khách",
    customerPhone: order.recipient?.phone || "",
    deliveryAddress: order.recipient?.address || "Địa chỉ nhận hàng",
    deliveryNote: order.note,
    carrierName: order.shippingCarrier || order.courierName || "",
    trackingCode: order.trackingCode || "",
    currentStepIndex: orderStatusStep(order.status),
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    timeline,
    orderTime: order.createdAt,
    paymentMethodName: order.paymentStatusText,
    paymentMethodCode: order.paymentMethod || "COD",
    itemsSubtotal: order.subtotal,
    shippingFee: order.shippingFee,
    shippingDiscount: order.shippingDiscount,
    shopDiscount: order.shopDiscount,
    platformDiscount: 0,
    totalAmount: order.totalAmount,
    shopGroups,
  };
}

function orderStatusStep(status: UserOrder["status"]): number {
  switch (status) {
    case "completed": return 4;
    case "shipping": return 3;
    case "packing": return 2;
    default: return 1;
  }
}

export const CompleteOrder: React.FC = () => {
  const { t } = useTranslation("customer");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passedData = (location.state as CompleteOrderState) || {};
  const queryOrderCode =
    searchParams.get("orderCode") || searchParams.get("code") || searchParams.get("id");
  const targetCode = queryOrderCode || passedData.orderCode;

  const [orderData, setOrderData] = useState<CompleteOrderState>(passedData);
  const [loading, setLoading] = useState<boolean>(() => Boolean(targetCode));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetCode) {
      return;
    }

    let isMounted = true;

    userOrderApi
      .fetchUserOrderDetail(targetCode)
      .then((order) => {
        if (!isMounted) return;
        setOrderData((current) => ({
          ...current,
          ...mapUserOrderToCompleteState(order),
          customerEmail: current.customerEmail,
          deliveryNote: order.note || current.deliveryNote,
          carrierName: order.shippingCarrier || order.courierName || current.carrierName || "",
          trackingCode: order.trackingCode || current.trackingCode || "",
          estimatedDeliveryDate: order.estimatedDeliveryDate || current.estimatedDeliveryDate,
        }));
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "Không tìm thấy thông tin đơn hàng này."
        );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetCode]);

  const orderCode = orderData.orderCode || "";
  const customerEmail = orderData.customerEmail || "";
  const customerName = orderData.customerName || "Quý khách";
  const customerPhone = orderData.customerPhone || "";
  const deliveryAddress = orderData.deliveryAddress || "";
  const deliveryNote = orderData.deliveryNote || t("order_complete.shipping.default_delivery_note");
  const carrierName = orderData.carrierName || "";
  const trackingCode = orderData.trackingCode || "";
  const estimatedDeliveryDate = orderData.estimatedDeliveryDate;
  const orderTime = orderData.orderTime || new Date().toLocaleString("vi-VN");
  const paymentMethodCode = orderData.paymentMethodCode || "COD";
  const paymentMethodName =
    orderData.paymentMethodName ||
    t("checkout.payment.methods.cod.name", { defaultValue: "Thanh toán khi nhận hàng" });

  const itemsSubtotal = orderData.itemsSubtotal ?? 0;
  const shippingFee = orderData.shippingFee ?? 0;
  const shippingDiscount = orderData.shippingDiscount ?? 0;
  const shopDiscount = orderData.shopDiscount ?? 0;
  const platformDiscount = orderData.platformDiscount ?? 0;
  const totalAmount = orderData.totalAmount ?? 0;
  const totalSavings = shippingDiscount + shopDiscount + platformDiscount;
  const shopGroups = orderData.shopGroups || [];

  if (loading) {
    return (
      <CustomerLayout cartItemCount={0} cartTotal={formatCurrencyVND(0)}>
        <div className="w-full pb-16">
          <CartBreadcrumbStepper currentStep={3} />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-on-surface-variant text-sm">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if ((!orderCode || loadError) && !loading) {
    return (
      <CustomerLayout cartItemCount={0} cartTotal={formatCurrencyVND(0)}>
        <div className="w-full pb-16">
          <CartBreadcrumbStepper currentStep={3} />
          <div className="max-w-[700px] mx-auto px-4 sm:px-6 mt-12 text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">
              {loadError || "Không tìm thấy thông tin đơn hàng"}
            </h2>
            <p className="text-on-surface-variant text-sm mb-6">
              Bạn có thể xem lịch sử các đơn hàng đã đặt trong trang Đơn mua của tôi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Xem đơn mua của tôi
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface font-medium text-sm hover:bg-surface-container transition-colors"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout cartItemCount={0} cartTotal={formatCurrencyVND(0)}>
      <div className="w-full pb-16">
        {/* Stepper Header (Step 3: Hoàn tất) */}
        <CartBreadcrumbStepper currentStep={3} />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {/* 1. Success Hero Banner */}
          <OrderSuccessHero
            orderCode={orderCode}
            customerEmail={customerEmail}
            paymentMethodName={paymentMethodName}
            paymentMethodCode={paymentMethodCode}
          />

          {/* 2. Order Overview Quick Metadata Grid (4 Cards) */}
          <OrderOverviewMeta
            orderCode={orderCode}
            orderTime={orderTime}
            paymentMethodName={paymentMethodName}
            paymentMethodCode={paymentMethodCode}
            totalAmount={totalAmount}
            totalSavings={totalSavings}
          />

          {/* 3. Shipping & Fulfillment Details (2-Column Bento) */}
          <OrderShippingBento
            recipientName={customerName}
            recipientPhone={customerPhone}
            deliveryAddress={deliveryAddress}
            deliveryNote={deliveryNote}
            carrierName={carrierName}
            trackingCode={trackingCode}
            estimatedDeliveryDate={estimatedDeliveryDate}
            timeline={orderData.timeline || []}
          />

          {/* 4. Itemized Product Summary & Financial Breakdown */}
          <OrderItemizedSummary
            groups={shopGroups}
            itemsSubtotal={itemsSubtotal}
            shippingFee={shippingFee}
            shippingDiscount={shippingDiscount}
            shopDiscount={shopDiscount}
            platformDiscount={platformDiscount}
            totalAmount={totalAmount}
            paymentMethodCode={paymentMethodCode}
          />

          {/* 5. Navigation Actions CTA Row */}
          <OrderActionsBar orderCode={orderCode} />

          {/* 6. Post-Purchase Guarantees Strip */}
          <OrderGuaranteesStrip />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CompleteOrder;
