import React, { useState, useEffect } from "react";
import type { ShopVoucherItem } from "@/domains/shop/types/shopVoucher.types";
import { shopVoucherApi } from "@/domains/shop/api/shopVoucherApi";
import ShopVouchersModal from "./ShopVouchersModal";
import { useAppSelector } from "@/app/state/store";

interface ShopVoucherStripProps {
  shopId?: number;
  shopName?: string;
}

export const ShopVoucherStrip: React.FC<ShopVoucherStripProps> = ({
  shopId,
  shopName = "Gian hàng",
}) => {
  const [vouchers, setVouchers] = useState<ShopVoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});
  const [claimError, setClaimError] = useState("");
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const roles = user?.roles?.map((role) => role.toUpperCase()) ?? (user?.role ? [user.role.toUpperCase()] : []);
  const isBuyer = roles.includes("CLIENT");

  // Tải danh sách voucher thông qua Mock API của shop
  useEffect(() => {
    let isMounted = true;

    const loadVouchers = async () => {
      try {
        if (!shopId) { setVouchers([]); return; }
        const data = await shopVoucherApi.getPublicShopVouchers(shopId);
        if (!isMounted) return;
        setVouchers(data);
        if (isAuthenticated && isBuyer) {
          const ids = await shopVoucherApi.getClaimedVoucherIDs();
          if (isMounted) setClaimedMap(Object.fromEntries(ids.map((id) => [id, true])));
        } else setClaimedMap({});
      } catch {
        if (isMounted) setVouchers([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadVouchers();

    return () => {
      isMounted = false;
    };
  }, [shopId, isAuthenticated, isBuyer, user?.role, user?.roles]);

  const handleClaim = async (id: string) => {
    setClaimError("");
    try {
      await shopVoucherApi.claimShopVoucher(id);
      setClaimedMap((prev) => ({ ...prev, [id]: true }));
    } catch {
      setClaimError("Đăng nhập bằng tài khoản người mua để lưu voucher.");
    }
  };

  // 3 mã nổi bật hiển thị ở dải banner trang shop
  const featuredVouchers = vouchers.slice(0, 3);

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

        {/* Nút mở popup tất cả ưu đãi (đã xóa thông báo alert) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container cursor-pointer transition-colors self-start sm:self-auto group"
        >
          <span>Xem tất cả ưu đãi</span>
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </button>
      </div>
      {claimError && <p role="alert" className="text-sm text-error">{claimError}</p>}

      {/* Voucher Cards Grid (Hiển thị 3 mã hàng đầu) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredVouchers.map((voucher) => {
          const isClaimed = !!claimedMap[voucher.id];
          const isShipping = voucher.type === "shipping";
          const isPercent = voucher.type === "percent";

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
                      : isPercent
                      ? "bg-purple-100 text-purple-700"
                      : "bg-primary-fixed text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {isShipping
                      ? "local_shipping"
                      : isPercent
                      ? "percent"
                      : "local_offer"}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-headline-md text-headline-md font-bold tracking-tight truncate ${
                      isShipping
                        ? "text-secondary"
                        : isPercent
                        ? "text-purple-700"
                        : "text-primary"
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

      {/* Popup Modal hiển thị toàn bộ ưu đãi của Shop */}
      <ShopVouchersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shopName={shopName}
        vouchers={vouchers}
        claimedMap={claimedMap}
        onClaimVoucher={handleClaim}
        isLoading={loading}
      />
    </div>
  );
};

export default ShopVoucherStrip;
