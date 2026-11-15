import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { CartItem, ShopVoucher } from "@/domains/customer/types/cart.types";
import { formatCurrencyVND } from "@/shared/utils/currency";
import { getAvailableShopVouchers } from "@/domains/customer/data/availableVouchers";

export interface ShopOrderGroup {
  shopId: number;
  shopName: string;
  shopBadge?: string;
  items: CartItem[];
  shopSubtotal: number;
}

interface CheckoutShopItemsProps {
  groups: ShopOrderGroup[];
  shopVouchers: Record<number, ShopVoucher>;
  onApplyShopVoucher: (shopId: number, code: string) => Promise<void>;
  onRemoveShopVoucher: (shopId: number) => void;
  isCalculating?: boolean;
}

export const CheckoutShopItems: React.FC<CheckoutShopItemsProps> = ({
  groups,
  shopVouchers,
  onApplyShopVoucher,
  onRemoveShopVoucher,
  isCalculating = false,
}) => {
  const { t } = useTranslation("customer");
  const [manualCodeInputs, setManualCodeInputs] = useState<Record<number, string>>({});
  const [showManualInputs, setShowManualInputs] = useState<Record<number, boolean>>({});
  const [shopErrors, setShopErrors] = useState<Record<number, string | null>>({});

  const handleCustomSubmit = async (shopId: number, e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCodeInputs[shopId]?.trim();
    if (!code) return;
    try {
      setShopErrors((prev) => ({ ...prev, [shopId]: null }));
      await onApplyShopVoucher(shopId, code);
      setShowManualInputs((prev) => ({ ...prev, [shopId]: false }));
    } catch (err: unknown) {
      setShopErrors((prev) => ({
        ...prev,
        [shopId]:
          typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : t("checkout.shop_items.apply_voucher_failed"),
      }));
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-on-surface">
            {t("checkout.shop_items.title")}
          </h3>
          <span className="text-xs text-on-surface-variant">
            {t("checkout.shop_items.subtitle")}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/40">
          {t("checkout.shop_items.summary_count", {
            shops: groups.length,
            items: groups.reduce((acc, g) => acc + g.items.reduce((s, it) => s + it.quantity, 0), 0),
          })}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group) => {
          const appliedVoucher = shopVouchers[group.shopId];
          const availableVouchers = getAvailableShopVouchers(group.shopId);
          const currentShopSubtotal = group.shopSubtotal;

          return (
            <div
              key={group.shopId}
              className="rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container-lowest"
            >
              {/* Shop Header */}
              <div className="bg-surface-container-low/60 px-4 py-2.5 flex items-center justify-between border-b border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    storefront
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-on-surface">
                    {group.shopName}
                  </span>
                  {group.shopBadge && (
                    <span className="px-1.5 py-0.2 rounded bg-tertiary/10 text-tertiary text-[10px] uppercase font-bold tracking-wider">
                      {group.shopBadge === "Chính hãng"
                        ? t("checkout.shop_items.official_badge", { defaultValue: "Chính hãng" })
                        : group.shopBadge}
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-on-surface-variant">
                  {t("checkout.shop_items.shop_subtotal")}{" "}
                  <strong className="text-on-surface font-bold">
                    {formatCurrencyVND(currentShopSubtotal)}
                  </strong>
                </span>
              </div>

              {/* Product Rows */}
              <div className="divide-y divide-outline-variant/20 px-4">
                {group.items.map((item) => {
                  const lineTotal =
                    (item.unit_price ?? item.price ?? 0) * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-start gap-3 sm:gap-4"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/30">
                        <img
                          src={
                            item.image_url ||
                            item.product_thumbnail_url ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-on-surface truncate">
                          {item.name || item.product_name}
                        </h4>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {t("checkout.shop_items.variant", {
                            variant:
                              item.variant_label ||
                              t("checkout.shop_items.default_variant", { defaultValue: "Mặc định" }),
                            quantity: item.quantity,
                            defaultValue: `Phân loại: ${item.variant_label || "Mặc định"} • SL: ${item.quantity}`,
                          })}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-xs text-on-surface-variant">
                            {formatCurrencyVND(item.unit_price ?? item.price ?? 0)}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-on-surface">
                            {formatCurrencyVND(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shop Vouchers Section */}
              <div className="bg-surface-container-low/50 px-4 py-3 border-t border-outline-variant/40 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      sell
                    </span>
                    <span>{t("checkout.shop_items.shop_voucher", { defaultValue: "Voucher của Shop:" })}</span>
                  </div>

                  {appliedVoucher && appliedVoucher.is_applied && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        check_circle
                      </span>
                      <span>
                        {t("checkout.shop_items.discounted", {
                          amount: formatCurrencyVND(appliedVoucher.discount_amount),
                          defaultValue: `Đã giảm ${formatCurrencyVND(appliedVoucher.discount_amount)}`,
                        })}
                      </span>
                    </span>
                  )}
                </div>

                {/* Available Shop Vouchers List */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {availableVouchers.map((v) => {
                    const isApplied =
                      appliedVoucher?.is_applied && appliedVoucher.code === v.code;
                    const isEligible = currentShopSubtotal >= v.minOrderValue;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isCalculating}
                        onClick={async () => {
                          if (isApplied) {
                            onRemoveShopVoucher(group.shopId);
                          } else {
                            try {
                              setShopErrors((prev) => ({ ...prev, [group.shopId]: null }));
                              await onApplyShopVoucher(group.shopId, v.code);
                            } catch (err: unknown) {
                              setShopErrors((prev) => ({
                                ...prev,
                                [group.shopId]:
                                  typeof err === "string"
                                    ? err
                                    : err instanceof Error
                                    ? err.message
                                    : t("checkout.shop_items.apply_voucher_failed"),
                              }));
                            }
                          }
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                          isApplied
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : isEligible
                            ? "bg-surface-container-lowest text-on-surface hover:border-primary/50 border-outline-variant/60"
                            : "bg-surface-container/60 text-outline border-outline-variant/30 opacity-70"
                        }`}
                        title={v.description}
                      >
                        <span className="font-bold text-[10px] uppercase">
                          {v.highlightText}
                        </span>
                        <span className="opacity-75">• {v.code}</span>
                        {isApplied && (
                          <span className="material-symbols-outlined text-[13px]">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Shop Voucher Input Toggle */}
                  {!showManualInputs[group.shopId] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowManualInputs((prev) => ({ ...prev, [group.shopId]: true }))
                      }
                      className="text-xs text-primary hover:underline font-semibold cursor-pointer py-1 px-1 flex items-center gap-0.5"
                    >
                      <span>{t("checkout.shop_items.enter_code", { defaultValue: "+ Nhập mã khác" })}</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={(e) => handleCustomSubmit(group.shopId, e)}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        placeholder={t("checkout.shop_items.shop_voucher_placeholder", {
                          defaultValue: "Mã voucher shop",
                        })}
                        value={manualCodeInputs[group.shopId] || ""}
                        onChange={(e) =>
                          setManualCodeInputs((prev) => ({
                            ...prev,
                            [group.shopId]: e.target.value,
                          }))
                        }
                        className="h-7 px-2 rounded bg-surface-container-lowest text-xs focus:outline-none focus:ring-1 focus:ring-primary w-32 border border-outline-variant/60 uppercase font-semibold"
                      />
                      <button
                        type="submit"
                        disabled={
                          isCalculating || !manualCodeInputs[group.shopId]?.trim()
                        }
                        className="h-7 px-2.5 rounded bg-primary text-xs text-on-primary font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Áp dụng
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowManualInputs((prev) => ({ ...prev, [group.shopId]: false }))
                        }
                        className="text-xs text-outline hover:text-on-surface cursor-pointer px-1"
                      >
                        Hủy
                      </button>
                    </form>
                  )}

                  {appliedVoucher?.is_applied && (
                    <button
                      type="button"
                      onClick={() => onRemoveShopVoucher(group.shopId)}
                      className="text-xs text-error hover:underline cursor-pointer font-medium ml-auto"
                    >
                      Gỡ voucher
                    </button>
                  )}
                </div>

                {shopErrors[group.shopId] && (
                  <p className="text-xs text-error font-medium">
                    {shopErrors[group.shopId]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutShopItems;

