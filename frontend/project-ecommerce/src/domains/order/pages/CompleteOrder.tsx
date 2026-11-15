import React from "react";
import { useLocation } from "react-router-dom";
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

export const CompleteOrder: React.FC = () => {
  const { t } = useTranslation("customer");
  const location = useLocation();
  const passedData = (location.state as CompleteOrderState) || {};

  // Default realistic mock fallback matching complete_order.html
  const orderCode = passedData.orderCode || "#ORD-9821";
  const customerEmail = passedData.customerEmail || "nguyen.vana***@gmail.com";
  const customerName = passedData.customerName || "Nguyễn Văn A";
  const customerPhone = passedData.customerPhone || "+84 909 123 456";
  const deliveryAddress =
    passedData.deliveryAddress ||
    "Số 142/8 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh";
  const deliveryNote =
    passedData.deliveryNote || t("order_complete.shipping.default_delivery_note");
  const carrierName = passedData.carrierName || t("order_complete.shipping.standard_delivery");
  const trackingCode = passedData.trackingCode || "GHN-VN-98234120";
  const estimatedDeliveryDate =
    passedData.estimatedDeliveryDate || t("order_complete.shipping.default_estimated_days");
  const orderTime = passedData.orderTime || "26/10/2026 • 15:30";
  const paymentMethodCode = passedData.paymentMethodCode || "COD";
  const paymentMethodName =
    passedData.paymentMethodName ||
    t("checkout.payment.methods.cod.name", { defaultValue: "Thanh toán khi nhận hàng" });

  const itemsSubtotal = passedData.itemsSubtotal ?? 1640000;
  const shippingFee = passedData.shippingFee ?? 45000;
  const shippingDiscount = passedData.shippingDiscount ?? 30000;
  const shopDiscount = passedData.shopDiscount ?? 0;
  const platformDiscount = passedData.platformDiscount ?? 0;
  const totalAmount = passedData.totalAmount ?? 1655000;
  const totalSavings = shippingDiscount + shopDiscount + platformDiscount;

  const shopGroups: CompleteOrderShopGroup[] =
    passedData.shopGroups && passedData.shopGroups.length > 0
      ? passedData.shopGroups
      : [
          {
            shopId: 920001,
            shopName: "UrbanStep Official Store",
            shopBadge: "Mall",
            shopAvatarText: "U",
            warehouseLocation: t("order_complete.items.default_warehouse"),
            subtotal: 1640000,
            items: [
              {
                id: 1,
                productId: 960001,
                productName: "Sneaker Retro Runner V2 Cổ Thấp Da Lộn Thủ Công",
                variantLabel: "Size: 42 • Màu: Đen Tuyền",
                quantity: 1,
                unitPrice: 890000,
                originalPrice: 1050000,
                lineTotal: 890000,
                imageUrl:
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                stockStatusBadge: t("order_complete.items.in_stock"),
              },
              {
                id: 2,
                productId: 960002,
                productName: "Túi du lịch da bò sáp mộc Minimalist Vintage Duffel",
                variantLabel: "Màu: Nâu Cà phê Sáp",
                quantity: 1,
                unitPrice: 750000,
                originalPrice: 880000,
                lineTotal: 750000,
                imageUrl:
                  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
                stockStatusBadge: t("order_complete.items.warranty_12m"),
                shopDiscountText: "Voucher Shop -15%",
              },
            ],
          },
        ];

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
            currentStepIndex={1}
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
