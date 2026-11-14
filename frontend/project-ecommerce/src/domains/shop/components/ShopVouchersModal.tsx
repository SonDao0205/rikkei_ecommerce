import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  ShopVoucherItem,
  VoucherFilterCategory,
} from "@/domains/shop/types/shopVoucher.types";

export interface ShopVouchersModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  vouchers: ShopVoucherItem[];
  claimedMap: Record<string, boolean>;
  onClaimVoucher: (id: string) => void;
  isLoading?: boolean;
}

export const ShopVouchersModal: React.FC<ShopVouchersModalProps> = ({
  isOpen,
  onClose,
  shopName = "Gian hàng",
  vouchers,
  claimedMap,
  onClaimVoucher,
  isLoading = false,
}) => {
  const { t } = useTranslation("customer");
  const [activeCategory, setActiveCategory] = useState<VoucherFilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Khóa cuộn trang khi mở modal & lắng nghe phím ESC
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Bộ lọc danh mục
  const counts = useMemo(() => {
    return {
      all: vouchers.length,
      money: vouchers.filter((v) => v.type === "money").length,
      percent: vouchers.filter((v) => v.type === "percent").length,
      shipping: vouchers.filter((v) => v.type === "shipping").length,
    };
  }, [vouchers]);

  // Danh sách voucher sau khi lọc theo tab và ô tìm kiếm
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      // Lọc danh mục
      if (activeCategory !== "all" && voucher.type !== activeCategory) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        return (
          voucher.code.toLowerCase().includes(query) ||
          voucher.title.toLowerCase().includes(query) ||
          voucher.amountText.toLowerCase().includes(query) ||
          voucher.minOrderText.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [vouchers, activeCategory, searchQuery]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback nếu browser không hỗ trợ clipboard API
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-vouchers-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Click outside backdrop overlay */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Dialog Box: Cố định kích thước chiều rộng (max-w-2xl) và chiều cao (640px) */}
      <div className="relative w-full max-w-4xl h-[800px] max-h-[92vh] bg-surface-container-lowest text-on-surface rounded-3xl shadow-2xl border border-outline-variant/40 flex flex-col overflow-hidden">
        {/* Modal Header (Cố định, không co lại) */}
        <div className="px-6 pt-5 pb-4 border-b border-outline-variant/30 flex items-start justify-between gap-4 shrink-0 bg-surface-container-lowest">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">
                confirmation_number
              </span>
            </div>
            <div>
              <h2
                id="shop-vouchers-title"
                className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface leading-tight"
              >
                {t("public_shop.vouchers.modal.title", { shopName })}
              </h2>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
                {t("public_shop.vouchers.modal.subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            aria-label={t("public_shop.vouchers.modal.close")}
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Search & Filter Tabs (Cố định, không co lại) */}
        <div className="px-6 py-3 bg-surface-container-low/50 border-b border-outline-variant/30 flex flex-col gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex items-center w-full h-10 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-3 gap-2 transition-all">
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("public_shop.vouchers.modal.search_placeholder")}
              className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-outline hover:text-on-surface p-1"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {t("public_shop.vouchers.modal.tabs.all", { count: counts.all })}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("money")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "money"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {t("public_shop.vouchers.modal.tabs.money", { count: counts.money })}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("percent")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "percent"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {t("public_shop.vouchers.modal.tabs.percent", { count: counts.percent })}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("shipping")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === "shipping"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {t("public_shop.vouchers.modal.tabs.shipping", { count: counts.shipping })}
            </button>
          </div>
        </div>

        {/* Voucher List Content (Khu vực cuộn thanh cuộn: flex-1 min-h-0 overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3.5 bg-surface-container-low/20">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm font-semibold text-on-surface-variant">
                {t("public_shop.vouchers.modal.loading")}
              </p>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">
                <span className="material-symbols-outlined text-[32px]">
                  confirmation_number
                </span>
              </div>
              <h3 className="font-bold text-base text-on-surface">
                {t("public_shop.vouchers.modal.empty_title")}
              </h3>
              <p className="text-xs text-outline max-w-sm mt-1">
                {t("public_shop.vouchers.modal.empty_desc")}
              </p>
              {(searchQuery || activeCategory !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs cursor-pointer transition-colors"
                >
                  {t("public_shop.vouchers.modal.view_all_btn")}
                </button>
              )}
            </div>
          ) : (
            filteredVouchers.map((voucher) => {
              const isClaimed = !!claimedMap[voucher.id];
              const isShipping = voucher.type === "shipping";
              const isPercent = voucher.type === "percent";
              const isExpanded = expandedId === voucher.id;

              return (
                <div
                  key={voucher.id}
                  className="relative rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group shrink-0"
                >
                  {/* Ticket Cutout Notches */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-low border-r border-outline-variant/40" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-low border-l border-outline-variant/40" />

                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Icon & Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 pl-1 sm:pl-2">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          isShipping
                            ? "bg-secondary-fixed text-secondary"
                            : isPercent
                            ? "bg-purple-100 text-purple-700"
                            : "bg-primary-fixed text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[28px]">
                          {isShipping
                            ? "local_shipping"
                            : isPercent
                            ? "percent"
                            : "local_offer"}
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-headline-md text-base sm:text-lg font-bold tracking-tight ${
                              isShipping
                                ? "text-secondary"
                                : isPercent
                                ? "text-purple-700"
                                : "text-primary"
                            }`}
                          >
                            {voucher.amountText}
                          </span>
                          {voucher.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-tertiary-fixed text-tertiary text-[10px] font-bold uppercase tracking-wider">
                              {voucher.badge}
                            </span>
                          )}
                        </div>

                        <span className="font-body-sm text-xs sm:text-sm text-on-surface font-medium mt-0.5">
                          {voucher.minOrderText}
                        </span>

                        <div className="flex items-center gap-3 text-xs text-outline mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 font-mono font-semibold text-on-surface bg-surface-container px-2 py-0.5 rounded-md">
                            {voucher.code}
                          </span>
                          <span>•</span>
                          <span>{voucher.expiryText}</span>
                        </div>

                        {/* Usage Progress Bar */}
                        {typeof voucher.usagePercent === "number" && (
                          <div className="mt-2 flex items-center gap-2 max-w-xs">
                            <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  voucher.usagePercent > 80
                                    ? "bg-error"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${voucher.usagePercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-outline font-medium shrink-0">
                              {t("public_shop.vouchers.modal.used_percent", { percent: voucher.usagePercent })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        {/* Copy Code Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(voucher.code)}
                          className="h-9 px-3 rounded-xl border border-outline-variant/60 hover:border-primary text-xs font-semibold text-on-surface hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                          title={t("public_shop.vouchers.modal.copy_tooltip")}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedCode === voucher.code ? "check" : "content_copy"}
                          </span>
                          <span>
                            {copiedCode === voucher.code
                              ? t("public_shop.vouchers.modal.copied")
                              : t("public_shop.vouchers.modal.copy_code")}
                          </span>
                        </button>

                        {/* Claim Button */}
                        {isClaimed ? (
                          <button
                            type="button"
                            className="h-9 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-xs flex items-center gap-1.5 cursor-default"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              check_circle
                            </span>
                            <span>{t("public_shop.vouchers.claimed")}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onClaimVoucher(voucher.id)}
                            className="h-9 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              bookmark_add
                            </span>
                            <span>{t("public_shop.vouchers.claim")}</span>
                          </button>
                        )}
                      </div>

                      {/* Expand Details Trigger */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(voucher.id)}
                        className="text-[11px] text-outline hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer mt-0.5"
                      >
                        <span>{t("public_shop.vouchers.modal.conditions")}</span>
                        <span
                          className={`material-symbols-outlined text-[14px] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Terms / Description */}
                  {isExpanded && (
                    <div className="px-5 py-3 bg-surface-container-low/60 border-t border-dashed border-outline-variant/60 text-xs text-on-surface-variant flex flex-col gap-1 animate-in fade-in duration-150">
                      <p className="font-semibold text-on-surface">{t("public_shop.vouchers.modal.conditions_title")}</p>
                      <p>{voucher.description}</p>
                      <p className="text-[11px] text-outline mt-0.5">
                        {t("public_shop.vouchers.modal.conditions_note")}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer (Cố định, không co lại) */}
        <div className="px-6 py-3.5 bg-surface-container-low/80 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">
              tips_and_updates
            </span>
            <span dangerouslySetInnerHTML={{ __html: t("public_shop.vouchers.modal.footer_tip") }} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer self-end sm:self-auto"
          >
            {t("public_shop.vouchers.modal.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopVouchersModal;
