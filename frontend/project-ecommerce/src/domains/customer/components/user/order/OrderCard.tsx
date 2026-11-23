import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrderItemRow from "@/domains/customer/components/user/order/OrderItemRow";
import ReviewProductModal from "@/domains/customer/components/user/order/ReviewProductModal";
import { ShopOrderStatusBadge } from "@/domains/order/components/ShopOrderStatusBadge";
import type { OrderActionTarget, UserOrder, UserOrderShop } from "@/domains/order/types";
import { formatCurrencyVND } from "@/shared/utils/currency";

interface OrderCardProps {
  order: UserOrder;
  onCancelClick: (order: OrderActionTarget) => void;
  onConfirmReceived: (order: OrderActionTarget) => void;
  actionLoading: boolean;
}

function OrderShopSection({
  order,
  shop,
  onCancelClick,
  onConfirmReceived,
  actionLoading,
}: OrderCardProps & { shop: UserOrderShop }) {
  const { t } = useTranslation("customer");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const items = shop.items ?? order.items.filter((item) => item.shopId === shop.shopId);
  const firstItem = items[0];
  const status = shop.status ?? (order.status === "all" ? "pending" : order.status);
  const shopOrderId = shop.shopOrderId;
  const target = {
    id: order.id,
    orderCode: shop.shopOrderCode ?? order.orderCode,
    shopOrderId,
  };
  const detailUrl = order.shops.length > 1 && shopOrderId
    ? `/profile/orders/${order.id}?shopOrderId=${shopOrderId}`
    : `/profile/orders/${order.id}`;

  const secondaryButton = "px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-sm font-semibold";
  const primaryButton = "px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-bold disabled:opacity-50";

  return (
    <section className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to={`/shop/${shop.shopId}`} className="inline-flex items-center gap-2 font-bold hover:text-primary">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">storefront</span>
          {shop.shopName}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {shop.carrier && <span className="text-xs text-on-surface-variant">{shop.carrier}</span>}
          <ShopOrderStatusBadge status={status} />
        </div>
      </div>

      <div>
        {(isExpanded ? items : items.slice(0, 2)).map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {items.length > 2 && (
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full rounded-lg border border-dashed border-outline-variant p-2 text-sm font-semibold text-primary hover:bg-surface-container-low"
        >
          {isExpanded
            ? t("profile.orders.card.collapse")
            : t("profile.orders.card.see_more", { count: items.length - 2 })}
        </button>
      )}

      {status === "cancelled" && shop.cancelReason && (
        <p className="rounded-lg bg-tertiary-fixed/40 p-3 text-sm text-on-tertiary-fixed-variant">
          {t("profile.orders.card.cancel_reason_prefix")} {shop.cancelReason}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        <Link to={detailUrl} className={secondaryButton}>
          {t(status === "shipping" ? "profile.orders.card.track_order" : "profile.orders.card.order_details")}
        </Link>
        {(status === "pending" || status === "confirmed") && shopOrderId && (
          <button type="button" disabled={actionLoading} onClick={() => onCancelClick(target)} className={`${secondaryButton} text-error disabled:opacity-50`}>
            {t("profile.orders.card.cancel_order")}
          </button>
        )}
        {status === "shipping" && shopOrderId && (
          <button type="button" disabled={actionLoading} onClick={() => onConfirmReceived(target)} className={primaryButton}>
            {t("profile.orders.card.received_btn")}
          </button>
        )}
        {status === "completed" && shop.shopOrderCode && (
          <button type="button" onClick={() => setIsReviewOpen(true)} className={secondaryButton}>
            {t("profile.orders.card.review_btn")}
          </button>
        )}
        {firstItem && ["confirmed", "packing", "completed", "cancelled", "returned"].includes(status) && (
          <Link to={`/product/${firstItem.productId}`} className={primaryButton}>
            {t("profile.orders.card.repurchase")}
          </Link>
        )}
      </div>

      {isReviewOpen && (
        <ReviewProductModal orderCode={shop.shopOrderCode} onClose={() => setIsReviewOpen(false)} />
      )}
    </section>
  );
}

export function OrderCard(props: OrderCardProps) {
  const { t } = useTranslation("customer");
  const { order } = props;
  const isPaid = order.paymentStatus === "PAID";
  const paymentMethod = t(order.paymentMethod === "COD" ? "profile.orders.payment_cod" : "profile.orders.payment_online");

  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30 bg-surface-container-low/40 p-4">
        <Link to={`/profile/orders/${order.id}`} className="font-bold text-primary hover:underline">
          {t("profile.orders.card.order_code_prefix")} {order.orderCode}
        </Link>
        <span className="text-xs text-on-surface-variant">
          {t("profile.orders.card.ordered_at", { time: order.createdAt })}
        </span>
      </header>

      <div className="divide-y divide-outline-variant/30">
        {order.shops.map((shop) => (
          <OrderShopSection key={shop.shopOrderId ?? shop.shopId} {...props} shop={shop} />
        ))}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/30 bg-surface-container-low/40 p-4">
        <span className="text-xs text-on-surface-variant">
          {paymentMethod} • {t(isPaid ? "profile.orders.paid" : "profile.orders.unpaid")}
        </span>
        <span className="text-sm text-on-surface-variant">
          {t("profile.orders.card.total_prefix")}{" "}
          <strong className="text-lg text-primary">{formatCurrencyVND(order.totalAmount)}</strong>
        </span>
      </footer>
    </article>
  );
}

export default OrderCard;
