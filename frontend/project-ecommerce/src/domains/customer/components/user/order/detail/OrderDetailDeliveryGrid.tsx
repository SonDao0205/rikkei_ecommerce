import React from 'react';
import { useTranslation } from 'react-i18next';
import { type UserOrder } from '@/shared/types';

interface OrderDetailDeliveryGridProps {
  order: UserOrder;
}

export const OrderDetailDeliveryGrid: React.FC<OrderDetailDeliveryGridProps> = ({ order }) => {
  const { t } = useTranslation("customer");
  const rawRecipient = order.recipient;
  const recipient = {
    name: rawRecipient?.name || 'Nguyễn Văn A',
    phone: rawRecipient?.phone || '(+84) 909 123 456',
    address: rawRecipient?.address || 'Số 142/8 Ung Văn Khiêm, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh',
    tag: rawRecipient?.tag || rawRecipient?.addressType || 'Nhà riêng',
    notes: rawRecipient?.notes || rawRecipient?.note || 'Giao giờ hành chính, gọi trước 15 phút. Cho kiểm tra hàng (Đồng kiểm COD).',
  };

  const isPaid = order.paymentStatusText === 'PAID';
  const formatCurrency = (val: number) => `${val.toLocaleString('vi-VN')} ₫`;

  const getPaymentMethodLabel = () => {
    switch (order.paymentMethod) {
      case 'COD':
        return t("profile.orders.detail.delivery_grid.payment_cod");
      case 'MOMO':
        return t("profile.orders.detail.delivery_grid.payment_momo");
      case 'VISA':
        return t("profile.orders.detail.delivery_grid.payment_visa");
      default:
        return t("profile.orders.detail.delivery_grid.payment_zalopay");
    }
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Shipping Address */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-4">
            <span className="material-symbols-outlined text-[20px] text-primary">location_on</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("profile.orders.detail.delivery_grid.address_title")}
            </h3>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">{recipient.name}</span>
              {recipient.tag && (
                <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
                  {recipient.tag === 'Nhà riêng' ? t("address.home", "Nhà riêng") : recipient.tag}
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant font-mono">{recipient.phone}</p>
            <p className="font-body-md text-body-md text-on-surface leading-relaxed mt-1">{recipient.address}</p>
            {recipient.notes && (
              <div className="mt-3 p-3 rounded-xl bg-surface-container-low flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">info</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {t("profile.orders.detail.delivery_grid.notes_prefix")} {recipient.notes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Shipping Method */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-4">
            <span className="material-symbols-outlined text-[20px] text-secondary">local_shipping</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("profile.orders.detail.delivery_grid.shipping_method_title")}
            </h3>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                {order.shippingCarrier || t("profile.orders.detail.delivery_grid.default_carrier")}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t("profile.orders.detail.delivery_grid.est_delivery_title")} <strong className="text-on-surface">{order.estimatedDeliveryDate || '28/10/2026'}</strong>
            </p>
            <div className="mt-3 p-3.5 rounded-xl bg-surface-container flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center shrink-0 text-primary">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {t("profile.orders.detail.delivery_grid.insurance_title")}
                </span>
                <span className="font-body-sm text-body-sm text-outline">
                  {t("profile.orders.detail.delivery_grid.insurance_desc")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Payment Method */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 pb-4">
            <span className="material-symbols-outlined text-[20px] text-tertiary">payments</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t("profile.orders.detail.delivery_grid.payment_method_title")}
            </h3>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-lg text-label-lg text-on-surface font-bold">
                {getPaymentMethodLabel()}
              </span>
              <span
                className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-bold ${
                  isPaid
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed'
                }`}
              >
                {isPaid
                  ? t("profile.orders.detail.delivery_grid.paid")
                  : t("profile.orders.detail.delivery_grid.unpaid")}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-outline">
              {order.paymentMethod === 'COD'
                ? t("profile.orders.detail.delivery_grid.cod_desc")
                : t("profile.orders.detail.delivery_grid.online_desc")}
            </p>
            {order.paymentMethod === 'COD' && (
              <div className="mt-4 p-4 rounded-xl bg-surface-container-low flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-bold">
                  {t("profile.orders.detail.delivery_grid.prepare_cash_title")}
                </span>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">
                  {formatCurrency(order.totalAmount)}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary">check_circle</span>
                  {t("profile.orders.detail.delivery_grid.prepare_cash_hint")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
