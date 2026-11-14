import React from "react";
import { useTranslation } from "react-i18next";

interface OrderSuccessHeroProps {
  orderCode: string;
  customerEmail: string;
  paymentMethodName?: string;
  paymentMethodCode?: string;
}

export const OrderSuccessHero: React.FC<OrderSuccessHeroProps> = ({
  orderCode,
  customerEmail,
  paymentMethodName,
  paymentMethodCode = "COD",
}) => {
  const { t } = useTranslation("customer");

  const getPaymentMethodDisplay = () => {
    const code = (paymentMethodCode || "").toLowerCase();
    if (code === "cod") {
      return t("checkout.payment.methods.cod.name", { defaultValue: "Thanh toán khi nhận hàng" });
    }
    if (code === "bank_transfer") {
      return t("checkout.payment.methods.bank_transfer.name", { defaultValue: "Chuyển khoản ngân hàng" });
    }
    if (code === "cards_wallets") {
      return t("checkout.payment.methods.cards_wallets.name", { defaultValue: "Thẻ tín dụng / Ghi nợ & Ví điện tử" });
    }
    return paymentMethodName || t("checkout.payment.methods.cod.name");
  };

  return (
    <section className="flex flex-col items-center text-center pt-4 pb-6 max-w-3xl mx-auto">
      {/* Animated Emerald Pulse Badge */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/20 animate-ping"></span>
        <div className="relative w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 shadow-xl shadow-emerald-500/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-[44px]">check_circle</span>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs sm:text-sm mb-3 shadow-xs border border-emerald-200">
        <span className="material-symbols-outlined text-[18px] text-emerald-600">
          payments
        </span>
        <span>{t("order_complete.hero.recorded", { paymentMethod: getPaymentMethodDisplay() })}</span>
      </div>

      <h1 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight mb-2">
        {t("order_complete.hero.title")}
      </h1>

      <p className="font-body-md text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
        {t("order_complete.hero.order_code_prefix")}{" "}
        <span className="font-bold text-primary font-mono bg-surface-container-high px-2.5 py-1 rounded-lg select-all">
          {orderCode}
        </span>
        {t("order_complete.hero.email_sent_to")}{" "}
        <span className="font-semibold text-on-surface">{customerEmail}</span>.
      </p>
    </section>
  );
};

export default OrderSuccessHero;
