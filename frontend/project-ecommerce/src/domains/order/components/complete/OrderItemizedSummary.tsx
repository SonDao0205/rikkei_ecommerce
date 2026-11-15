import React from "react";
import { useTranslation } from "react-i18next";
import { formatCurrencyVND } from "@/shared/utils/currency";

export interface CompleteOrderItem {
  id: number;
  productId: number;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  lineTotal: number;
  imageUrl: string;
  stockStatusBadge?: string;
  shopDiscountText?: string;
}

export interface CompleteOrderShopGroup {
  shopId: number;
  shopName: string;
  shopBadge?: string;
  shopAvatarText?: string;
  warehouseLocation?: string;
  items: CompleteOrderItem[];
  subtotal: number;
}

interface OrderItemizedSummaryProps {
  groups: CompleteOrderShopGroup[];
  itemsSubtotal: number;
  shippingFee: number;
  shippingDiscount: number;
  shopDiscount: number;
  platformDiscount: number;
  totalAmount: number;
  paymentMethodCode?: string;
}

export const OrderItemizedSummary: React.FC<OrderItemizedSummaryProps> = ({
  groups,
  itemsSubtotal,
  shippingFee,
  shippingDiscount,
  shopDiscount,
  platformDiscount,
  totalAmount,
  paymentMethodCode = "COD",
}) => {
  const { t } = useTranslation("customer");

  const totalItemCount = groups.reduce(
    (acc, g) => acc + g.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  const getStockBadgeDisplay = (badge?: string) => {
    if (!badge) return t("order_complete.items.ready_to_ship");
    const lower = badge.toLowerCase();
    if (lower.includes("còn hàng") || lower.includes("in stock")) {
      return t("order_complete.items.in_stock");
    }
    if (lower.includes("bảo hành") || lower.includes("warranty")) {
      return t("order_complete.items.warranty_12m");
    }
    if (lower.includes("đã xác nhận") || lower.includes("ready")) {
      return t("order_complete.items.ready_to_ship");
    }
    return badge;
  };

  const getShopDiscountDisplay = (text?: string) => {
    if (!text) return "";
    if (text.includes("Voucher Shop")) {
      return text.replace("Voucher Shop", t("checkout.shop_items.shop_voucher", { defaultValue: "Voucher Shop:" }).replace(":", ""));
    }
    return text;
  };

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/40 p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="font-bold text-base sm:text-lg text-on-surface">
            {t("order_complete.items.title")}
          </h2>
          <span className="text-xs text-outline">
            {t("order_complete.items.subtitle", { count: totalItemCount })}
          </span>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          {groups.length === 1
            ? t("order_complete.items.package_count_one")
            : t("order_complete.items.package_count_other", { count: groups.length })}
        </span>
      </div>

      {/* Shop Groups */}
      <div className="flex flex-col gap-6 mb-6">
        {groups.map((group) => (
          <div
            key={group.shopId}
            className="rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container-lowest"
          >
            {/* Merchant Banner */}
            <div className="flex items-center justify-between p-3.5 bg-surface-container-low border-b border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-center font-bold text-sm">
                  {group.shopAvatarText || group.shopName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-on-surface">
                      {group.shopName}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      verified
                    </span>
                    {group.shopBadge && (
                      <span className="px-1.5 py-0.2 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase tracking-wider">
                        {group.shopBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-outline">
                    {group.warehouseLocation || t("order_complete.items.default_warehouse")}
                  </span>
                </div>
              </div>

              <a
                href={`/shop/${group.shopId}`}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-0.5"
              >
                <span>{t("order_complete.items.visit_shop")}</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </a>
            </div>

            {/* Products in this Shop */}
            <div className="divide-y divide-outline-variant/20 px-4">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-on-surface truncate">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-outline">
                        <span className="bg-surface-container px-2 py-0.5 rounded text-[11px]">
                          {t("order_complete.items.variant_prefix", { variant: item.variantLabel })}
                        </span>
                        <span>{t("order_complete.items.quantity_prefix", { quantity: item.quantity })}</span>
                        {item.shopDiscountText && (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                            {getShopDiscountDisplay(item.shopDiscountText)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[13px]">
                          inventory
                        </span>
                        <span>
                          {getStockBadgeDisplay(item.stockStatusBadge)}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                    <span className="font-bold text-sm sm:text-base text-on-surface">
                      {formatCurrencyVND(item.lineTotal)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.unitPrice && (
                      <span className="text-xs text-outline line-through">
                        {formatCurrencyVND(item.originalPrice * item.quantity)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Financial Breakdown Table */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low max-w-xl ml-auto border border-outline-variant/30 flex flex-col gap-2.5 text-xs sm:text-sm">
        <div className="flex justify-between items-center text-on-surface-variant">
          <span>{t("order_complete.items.breakdown.subtotal", { count: totalItemCount })}</span>
          <span className="font-semibold text-on-surface">
            {formatCurrencyVND(itemsSubtotal)}
          </span>
        </div>

        <div className="flex justify-between items-center text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span>{t("order_complete.items.breakdown.shipping_fee")}</span>
            <span
              className="material-symbols-outlined text-[14px] text-outline cursor-help"
              title={t("order_complete.items.breakdown.shipping_fee_tooltip")}
            >
              info
            </span>
          </span>
          <span className="font-semibold text-on-surface">
            {formatCurrencyVND(shippingFee)}
          </span>
        </div>

        {shippingDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">
                local_shipping
              </span>
              <span>{t("order_complete.items.breakdown.shipping_discount")}</span>
            </span>
            <span>-{formatCurrencyVND(shippingDiscount)}</span>
          </div>
        )}

        {shopDiscount > 0 && (
          <div className="flex justify-between items-center text-secondary font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">store</span>
              <span>{t("order_complete.items.breakdown.shop_discount")}</span>
            </span>
            <span>-{formatCurrencyVND(shopDiscount)}</span>
          </div>
        )}

        {platformDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-semibold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">redeem</span>
              <span>{t("order_complete.items.breakdown.platform_discount")}</span>
            </span>
            <span>-{formatCurrencyVND(platformDiscount)}</span>
          </div>
        )}

        <div className="pt-3 mt-1 border-t border-outline-variant/40 flex justify-between items-baseline">
          <div>
            <span className="font-bold text-sm sm:text-base text-on-surface block">
              {t("order_complete.items.breakdown.total_payment", { method: paymentMethodCode })}
            </span>
            <span className="text-[11px] text-outline">
              {t("order_complete.items.breakdown.courier_collection_note")}
            </span>
          </div>
          <span className="font-headline-md text-xl sm:text-2xl font-bold text-primary tracking-tight">
            {formatCurrencyVND(totalAmount)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default OrderItemizedSummary;
