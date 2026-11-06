import React, { useState } from "react";
import type { CartItem, ShopVoucher } from "@/domains/customer/types/cart.types";
import CartItemRow from "./CartItemRow";
import { formatCurrencyVND } from "@/shared/utils/currency";

export interface CartShopGroupProps {
  shopId: number;
  shopName: string;
  shopBadge?: string;
  shopAvatarText?: string;
  shopLocation?: string;
  items: CartItem[];
  voucher?: ShopVoucher;
  onToggleShopSelect: (shopId: number, selected: boolean) => void;
  onToggleItemSelect: (itemId: number) => void;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onSaveForLater?: (item: CartItem) => void;
  onApplyShopVoucher: (shopId: number, code: string) => Promise<void>;
  onRemoveShopVoucher?: (shopId: number) => void;
}

export const CartShopGroup: React.FC<CartShopGroupProps> = ({
  shopId,
  shopName,
  shopBadge = "Chính hãng",
  shopAvatarText = "SHOP",
  shopLocation,
  items,
  voucher,
  onToggleShopSelect,
  onToggleItemSelect,
  onUpdateQuantity,
  onRemoveItem,
  onSaveForLater,
  onApplyShopVoucher,
  onRemoveShopVoucher,
}) => {
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherErrorMessage, setVoucherErrorMessage] = useState<string | null>(null);

  const isAllShopItemsSelected = items.length > 0 && items.every((i) => i.selected);
  const selectedItems = items.filter((i) => i.selected);
  const selectedItemsCount = selectedItems.reduce((acc, it) => acc + it.quantity, 0);

  const shopSubtotal = selectedItems.reduce(
    (acc, it) => acc + (it.price ?? it.unit_price ?? 0) * it.quantity,
    0
  );

  const isVoucherApplicable =
    voucher &&
    voucher.is_applied &&
    shopSubtotal >= (voucher.min_order_amount || 0);

  const voucherDiscount = isVoucherApplicable ? voucher.discount_amount : 0;
  const finalShopTotal = Math.max(0, shopSubtotal - voucherDiscount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;
    try {
      setIsApplyingVoucher(true);
      setVoucherErrorMessage(null);
      await onApplyShopVoucher(shopId, voucherCodeInput.trim());
      setVoucherCodeInput("");
      setShowVoucherInput(false);
    } catch (err) {
      setVoucherErrorMessage(
        err instanceof Error ? err.message : "Mã không hợp lệ"
      );
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 ease-out overflow-hidden flex flex-col border border-outline-variant/60 will-change-transform">
      {/* Shop Header */}
      <div className="bg-surface-container-low px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isAllShopItemsSelected}
            onChange={(e) => onToggleShopSelect(shopId, e.target.checked)}
            className="w-5 h-5 rounded text-primary-container accent-primary-container cursor-pointer"
          />
          <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary text-xs shadow-xs">
            {shopAvatarText}
          </div>
          <span className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            {shopName}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 font-semibold ${
              shopBadge.includes("Mall")
                ? "bg-primary-container text-on-primary"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {shopBadge.includes("Mall") ? "verified" : "brush"}
            </span>
            <span>{shopBadge}</span>
          </span>

          <button
            type="button"
            className="text-secondary text-xs sm:text-sm flex items-center gap-0.5 hover:underline ml-1 cursor-pointer font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            <span>Chat</span>
          </button>
        </div>

        {voucher && voucher.is_applied ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-highest text-primary-container text-xs font-bold">
            <span className="material-symbols-outlined text-[15px]">local_activity</span>
            <span>Shop Voucher applied: -{formatCurrencyVND(voucher.discount_amount)}</span>
          </div>
        ) : shopLocation ? (
          <div className="text-outline text-xs font-medium">
            {shopLocation}
          </div>
        ) : null}
      </div>

      {/* Product Items in this Shop */}
      <div className="divide-y divide-surface-container-low">
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onToggleSelect={onToggleItemSelect}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
            onSaveForLater={onSaveForLater}
          />
        ))}
      </div>

      {/* Shop Footer Voucher & Subtotal Strip */}
      <div className="bg-surface-container-low/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-on-surface-variant">
            Shop Voucher:
          </span>

          {voucher && voucher.is_applied && !showVoucherInput ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-lowest text-xs text-primary font-bold shadow-xs">
                <span>{voucher.code} applied</span>
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <button
                type="button"
                onClick={() => setShowVoucherInput(true)}
                className="text-xs text-secondary hover:underline cursor-pointer font-semibold"
              >
                Đổi mã
              </button>
              {onRemoveShopVoucher && (
                <button
                  type="button"
                  onClick={() => onRemoveShopVoucher(shopId)}
                  className="text-xs text-outline hover:text-error transition-colors cursor-pointer"
                  title="Hủy voucher shop"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập mã ưu đãi shop"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="h-8 px-2.5 rounded bg-surface-container-lowest text-xs focus:outline-none focus:ring-1 focus:ring-primary w-40 border border-outline-variant/60"
              />
              <button
                type="submit"
                disabled={isApplyingVoucher || !voucherCodeInput.trim()}
                className="h-8 px-3 rounded bg-surface-container text-xs text-on-surface font-bold hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-50"
              >
                {isApplyingVoucher ? "..." : "Áp dụng"}
              </button>
              {showVoucherInput && (
                <button
                  type="button"
                  onClick={() => setShowVoucherInput(false)}
                  className="text-xs text-outline hover:text-on-surface cursor-pointer"
                >
                  Hủy
                </button>
              )}
            </form>
          )}

          {voucherErrorMessage && (
            <span className="text-xs text-error font-medium">
              {voucherErrorMessage}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-on-surface-variant">
            Tổng shop ({selectedItemsCount} {selectedItemsCount === 1 ? "món" : "món"}):
          </span>
          <span className="font-label-lg text-sm sm:text-base text-on-surface font-bold">
            {formatCurrencyVND(finalShopTotal)}
          </span>
          {voucherDiscount > 0 && (
            <span className="text-secondary text-xs font-bold">
              (Tiết kiệm {formatCurrencyVND(voucherDiscount)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartShopGroup;

