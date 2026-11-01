import React, { useState } from "react";

interface VoucherItem {
  id: string;
  type: "money" | "percent" | "shipping";
  amountText: string;
  minOrderText: string;
  expiryText: string;
  claimedByDefault?: boolean;
}

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: "voucher-1",
    type: "money",
    amountText: "GIẢM 30.000 ₫",
    minOrderText: "Đơn tối thiểu 300.000 ₫",
    expiryText: "HSD: 31/12/2026",
    claimedByDefault: false,
  },
  {
    id: "voucher-2",
    type: "percent",
    amountText: "GIẢM 10% Tối đa 50k",
    minOrderText: "Đơn tối thiểu 500.000 ₫",
    expiryText: "HSD: 31/12/2026",
    claimedByDefault: false,
  },
  {
    id: "voucher-3",
    type: "shipping",
    amountText: "FREESHIP EXTRA 25k",
    minOrderText: "Đơn tối thiểu 200.000 ₫",
    expiryText: "HSD: 15/01/2027",
    claimedByDefault: true,
  },
];

interface ShopVoucherStripProps {
  shopName?: string;
}

export const ShopVoucherStrip: React.FC<ShopVoucherStripProps> = ({
  shopName = "Shop",
}) => {
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({
    "voucher-3": true,
  });

  const handleClaim = (id: string) => {
    setClaimedMap((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-margin-lg flex flex-col gap-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[22px]">
              confirmation_number
            </span>
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Mã giảm giá độc quyền từ Shop
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Thu thập mã giảm giá để áp dụng ngay tại bước thanh toán của gian hàng{" "}
              {shopName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert("Hiện tất cả mã ưu đãi của shop đã được hiển thị bên dưới.")}
          className="flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container cursor-pointer transition-colors self-start sm:self-auto"
        >
          <span>Xem tất cả ưu đãi</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>

      {/* Voucher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {INITIAL_VOUCHERS.map((voucher) => {
          const isClaimed = !!claimedMap[voucher.id];
          const isShipping = voucher.type === "shipping";

          return (
            <div
              key={voucher.id}
              className="relative rounded-2xl bg-surface-container-lowest p-5 shadow-sm flex items-center justify-between gap-4 overflow-hidden group hover:shadow-md transition-all border border-outline-variant/30"
            >
              {/* Ticket Cutouts */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-outline-variant/40" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-outline-variant/40" />

              <div className="flex items-center gap-3 pl-2 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isShipping
                      ? "bg-secondary-fixed text-secondary"
                      : "bg-primary-fixed text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {voucher.type === "shipping"
                      ? "local_shipping"
                      : voucher.type === "percent"
                      ? "percent"
                      : "local_offer"}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-headline-md text-headline-md font-bold tracking-tight truncate ${
                      isShipping ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {voucher.amountText}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    {voucher.minOrderText}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline mt-0.5">
                    {voucher.expiryText}
                  </span>
                </div>
              </div>

              {isClaimed ? (
                <button
                  type="button"
                  className="shrink-0 h-9 px-3.5 rounded-lg bg-surface-container-high text-emerald-700 font-label-md text-label-md flex items-center gap-1 cursor-default"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  <span>Đã lưu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleClaim(voucher.id)}
                  className="shrink-0 h-9 px-4 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  Lưu mã
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShopVoucherStrip;
