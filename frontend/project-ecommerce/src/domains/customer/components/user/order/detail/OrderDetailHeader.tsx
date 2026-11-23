import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { UserOrder } from "@/shared/types";
import { ShopOrderStatusBadge } from "@/domains/order/components/ShopOrderStatusBadge";

export interface OrderDetailHeaderProps {
  order: UserOrder;
  onPrintInvoice?: () => void;
  onChatWithShop?: () => void;
  onChatShop?: () => void;
}

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
  order,
  onPrintInvoice = () => window.print(),
  onChatWithShop,
  onChatShop,
}) => {
  const { t } = useTranslation("customer");

  const status = order.shops[0]?.status ?? (order.status === "all" ? "pending" : order.status);

  return (
    <section className="flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-outline font-label-md text-label-md flex-wrap"
        >
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>{t("profile.orders.breadcrumb.home")}</span>
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            to="/profile"
            className="hover:text-primary transition-colors"
          >
            {t("profile.orders.breadcrumb.account")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            to="/profile/orders"
            className="hover:text-primary transition-colors"
          >
            {t("profile.orders.breadcrumb.orders")}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-xs sm:max-w-md">
            {t("profile.orders.detail.breadcrumb_detail", { code: order.orderCode })}
          </span>
        </nav>

        <div className="flex flex-wrap gap-2">
          {order.parentOrderCode && (
            <Link
              to={`/profile/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high font-label-md text-label-md"
            >
              {t("profile.orders.card.order_code_prefix")} {order.parentOrderCode}
            </Link>
          )}
          <Link
            to="/profile/orders"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{t("profile.orders.detail.back_to_list")}</span>
          </Link>
        </div>
      </div>

      {/* Top Header Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-sm border border-outline-variant/40 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {t("profile.orders.detail.page_title", { code: order.orderCode })}
            </h1>

            {order.shops.length <= 1 && <ShopOrderStatusBadge status={status} />}
          </div>

          <p className="font-body-md text-body-md text-outline flex items-center gap-2 flex-wrap text-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{t("profile.orders.detail.ordered_at", { time: order.createdAt })}</span>
            </span>
            <span>•</span>
            <span className="text-primary font-medium">
              {order.updatedAtText || t("profile.orders.detail.updated_recent")}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onPrintInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>{t("profile.orders.detail.print_vat")}</span>
          </button>

          <button
            type="button"
            onClick={
              onChatWithShop ||
              onChatShop ||
              (() =>
                alert(
                  t("profile.orders.detail.chat_alert_fallback", { code: order.orderCode })
                ))
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>{t("profile.orders.detail.chat_with_shop")}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderDetailHeader;
