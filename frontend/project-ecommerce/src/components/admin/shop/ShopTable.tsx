import React from "react";
import type { AdminShopItem } from "../../../types/ecommerce";

interface ShopTableProps {
  shops: AdminShopItem[];
  selectedIds: number[];
  isLoading: boolean;
  onToggleSelectShop: (id: number) => void;
  onToggleSelectAll: () => void;
  onViewKyc: (shop: AdminShopItem) => void;
  onQuickApprove: (id: number) => void;
  onQuickReject: (shop: AdminShopItem) => void;
  onToggleLive: (id: number, currentLive: boolean) => void;
  onEditShop: (shop: AdminShopItem) => void;
  onLockShop: (shop: AdminShopItem) => void;
  onUnlockShop: (id: number) => void;
}

export const ShopTable: React.FC<ShopTableProps> = ({
  shops,
  selectedIds,
  isLoading,
  onToggleSelectShop,
  onToggleSelectAll,
  onViewKyc,
  onQuickApprove,
  onQuickReject,
  onToggleLive,
  onEditShop,
  onLockShop,
  onUnlockShop,
}) => {
  const isAllSelected = shops.length > 0 && selectedIds.length === shops.length;

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case "MALL":
        return (
          <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-[10px] uppercase font-bold tracking-wider">
            MALL
          </span>
        );
      case "PREMIUM":
        return (
          <span className="px-1.5 py-0.5 rounded bg-surface-tint/20 text-surface-tint font-label-sm text-[10px] uppercase font-semibold">
            Premium
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[10px] uppercase font-semibold">
            Standard
          </span>
        );
    }
  };

  const renderStatusBadge = (shop: AdminShopItem) => {
    switch (shop.status) {
      case "PENDING":
        return (
          <div className="flex flex-col gap-1.5 items-start">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Pending Approval
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onQuickApprove(shop.id)}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-[11px] hover:opacity-90 shadow-sm cursor-pointer transition-opacity"
                title="Quick Approve KYC"
              >
                <span className="material-symbols-outlined text-[13px]">check</span> Duyệt nhanh
              </button>
              <button
                type="button"
                onClick={() => onQuickReject(shop)}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container text-error hover:bg-error-container hover:text-on-error-container text-[11px] cursor-pointer transition-colors"
                title="Từ chối hồ sơ KYC"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </div>
          </div>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Active / Verified
          </span>
        );
      case "SUSPENDED":
        return (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
              Suspended
            </span>
            {shop.reject_reason && (
              <span className="text-[11px] text-error truncate max-w-[140px]" title={shop.reject_reason}>
                {shop.reject_reason}
              </span>
            )}
          </div>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-md text-body-md">
          {/* Table Header */}
          <thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center" scope="col">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded text-primary-container focus:ring-primary cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Shop Details
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Owner &amp; Contact
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Catalog &amp; Sales
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Commission &amp; Balance
              </th>
              <th className="py-3.5 px-4 font-semibold" scope="col">
                Shop Status
              </th>
              <th className="py-3.5 px-4 font-semibold text-center" scope="col">
                Account
              </th>
              <th className="py-3.5 px-4 font-semibold text-right" scope="col">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-surface-container-low text-on-surface">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-primary animate-spin">
                      progress_activity
                    </span>
                    <span>Đang tải danh sách đối tác gian hàng...</span>
                  </div>
                </td>
              </tr>
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[40px] text-outline">
                      storefront
                    </span>
                    <span className="font-semibold text-on-surface">
                      Không tìm thấy gian hàng phù hợp
                    </span>
                    <span className="text-body-sm">
                      Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hiện tại.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              shops.map((shop) => {
                const isSelected = selectedIds.includes(shop.id);
                const isSuspended = shop.status === "SUSPENDED";

                return (
                  <tr
                    key={shop.id}
                    className={`transition-colors ${
                      isSuspended
                        ? "bg-error-container/10 hover:bg-error-container/20"
                        : isSelected
                        ? "bg-primary-fixed/30 hover:bg-primary-fixed/40"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectShop(shop.id)}
                        className="w-4 h-4 rounded text-primary-container focus:ring-primary cursor-pointer"
                      />
                    </td>

                    {/* Shop Details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-primary-fixed shadow-sm">
                          <img
                            src={shop.logo_url || undefined}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop";
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => onViewKyc(shop)}
                              className={`font-headline-md text-[15px] font-bold cursor-pointer transition-colors ${
                                isSuspended
                                  ? "line-through opacity-80 text-on-surface hover:text-error"
                                  : "text-on-surface hover:text-primary"
                              }`}
                            >
                              {shop.name}
                            </span>
                            {renderTierBadge(shop.tier)}
                          </div>
                          <div className="flex items-center gap-1.5 text-on-surface-variant text-[12px] font-label-md">
                            <span className="material-symbols-outlined text-[14px]">
                              {shop.category_icon || "store"}
                            </span>
                            <span>{shop.category}</span>
                            <span>•</span>
                            <span className="text-primary font-medium">ID: {shop.code}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner & Contact */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-[13px]">
                        <span className="font-semibold text-on-surface">{shop.owner_name}</span>
                        <span className="text-on-surface-variant">{shop.owner_phone}</span>
                        <span className="text-on-surface-variant text-[12px] truncate max-w-[170px]">
                          {shop.owner_email}
                        </span>
                        <span className="text-outline text-[11px] truncate max-w-[170px]">
                          {shop.location}
                        </span>
                      </div>
                    </td>

                    {/* Catalog & Sales */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-[13px]">
                        <span
                          className={`font-semibold ${
                            isSuspended ? "text-error" : "text-on-surface"
                          }`}
                        >
                          {shop.sku_label}
                        </span>
                        <span className="text-secondary text-[12px] font-medium">
                          {shop.order_label}
                        </span>
                        <span
                          className={`text-[11px] ${
                            isSuspended ? "text-error font-medium" : "text-outline"
                          }`}
                        >
                          {shop.rating_avg > 0
                            ? `Rating: ${shop.rating_avg} ★ (${shop.rating_count} reviews)`
                            : isSuspended
                            ? `Rating: ${shop.rating_avg} ★ (Flagged Disputes)`
                            : "Rating: N/A (Unrated)"}
                        </span>
                      </div>
                    </td>

                    {/* Commission & Balance */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col text-[13px]">
                        <span className="font-bold text-primary-container">
                          {shop.commission_tier_label}
                        </span>
                        <span
                          className={
                            isSuspended
                              ? "text-error font-medium"
                              : "text-on-surface-variant font-medium"
                          }
                        >
                          {isSuspended
                            ? "Locked / Dispute"
                            : `${shop.available_balance.toLocaleString("vi-VN")} ₫ Available`}
                        </span>
                        <span className="text-outline text-[11px]">
                          {isSuspended
                            ? `Escrow: 4.800.000 ₫`
                            : `Cycle: ${shop.settlement_cycle}`}
                        </span>
                      </div>
                    </td>

                    {/* Shop Status */}
                    <td className="py-4 px-4">{renderStatusBadge(shop)}</td>

                    {/* Account Switch Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleLive(shop.id, !shop.is_live)}
                        disabled={isSuspended}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none ${
                          shop.is_live && !isSuspended
                            ? "bg-secondary"
                            : "bg-surface-variant"
                        } ${isSuspended ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={
                          isSuspended
                            ? "Account Status: Frozen"
                            : shop.is_live
                            ? "Account Status: Online (Live)"
                            : "Account Status: Offline"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest shadow-sm transition-transform translate-y-0.5 ${
                            shop.is_live && !isSuspended ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View KYC */}
                        <button
                          type="button"
                          onClick={() => onViewKyc(shop)}
                          className="p-1.5 rounded-lg text-primary hover:bg-surface-container-high transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Xem hồ sơ KYC (View KYC Verification)"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            visibility
                          </span>
                        </button>

                        {/* Edit Commission / Shop */}
                        <button
                          type="button"
                          onClick={() => onEditShop(shop)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Edit Shop Settings & Commission"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>

                        {/* Lock / Unlock */}
                        {isSuspended ? (
                          <button
                            type="button"
                            onClick={() => onUnlockShop(shop.id)}
                            className="p-1.5 rounded-lg text-secondary hover:bg-secondary-fixed transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Reactivate Merchant (Gỡ đình chỉ)"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              lock_open
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onLockShop(shop)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Khóa gian hàng vi phạm chính sách"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ShopTable;
