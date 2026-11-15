import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface OrderActionsBarProps {
  orderCode: string;
}

export const OrderActionsBar: React.FC<OrderActionsBarProps> = ({ orderCode }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("customer");

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/40">
      <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          <span>{t("order_complete.actions.print_invoice")}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/profile/orders")}
          className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-semibold text-xs sm:text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>{t("order_complete.actions.order_detail", { code: orderCode })}</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{t("order_complete.actions.continue_shopping")}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};

export default OrderActionsBar;
