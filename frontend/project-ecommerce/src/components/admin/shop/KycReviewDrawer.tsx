import React, { useState, useEffect } from "react";
import type { AdminShopItem, ShopTier } from "../../../types/ecommerce";

interface KycReviewDrawerProps {
  isOpen: boolean;
  shop: AdminShopItem | null;
  isActionLoading: boolean;
  onClose: () => void;
  onApprove: (shopId: number, notes?: string) => void;
  onReject: (shopId: number, reason: string) => void;
  onUpdateCommission: (shopId: number, tier: ShopTier, rate: number) => void;
}

export const KycReviewDrawer: React.FC<KycReviewDrawerProps> = ({
  isOpen,
  shop,
  isActionLoading,
  onClose,
  onApprove,
  onReject,
  onUpdateCommission,
}) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTier, setSelectedTier] = useState<ShopTier>("STANDARD");

  useEffect(() => {
    if (shop) {
      setSelectedTier(shop.tier || "STANDARD");
      setAdminNotes(shop.reject_reason || "");
    }
  }, [shop]);

  if (!isOpen || !shop) return null;

  const handleTierChange = (tier: ShopTier) => {
    setSelectedTier(tier);
    const rate = tier === "MALL" ? 12 : tier === "PREMIUM" ? 8 : 5;
    onUpdateCommission(shop.id, tier, rate);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(shop.id, rejectReason.trim());
    setIsRejectModalOpen(false);
    setRejectReason("");
  };

  return (
    <div
      id="kyc-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-inverse-surface/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl h-full bg-surface-container-lowest shadow-2xl flex flex-col justify-between overflow-hidden border-l border-outline-variant/30 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-surface-container-low flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Hồ Sơ Thẩm Định KYC
                </h2>
                <span className="font-label-sm text-label-sm text-primary font-mono bg-surface-container px-2 py-0.5 rounded">
                  {shop.code}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Quy trình xác minh định danh thương nhân sàn Rikkei Ecommerce
              </p>
            </div>
          </div>

          <button
            id="close-drawer-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-body-md text-body-md">
          {/* Shop Brand Identity Card */}
          <div className="bg-surface-container-low/50 rounded-xl p-4 border border-outline-variant/20 flex flex-col gap-3">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-primary-fixed shadow-sm">
                <img
                  src={shop.logo_url || undefined}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-[17px] font-bold text-on-surface">
                    {shop.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-[11px] font-bold">
                    {shop.tier}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant text-[13px] mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">
                    {shop.category_icon || "store"}
                  </span>
                  <span>Ngành hàng: {shop.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-outline text-[12px] mt-1">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  <span>{shop.location}</span>
                </div>
              </div>
            </div>

            <div className="text-[13px] text-on-surface-variant bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
              <span className="font-semibold text-on-surface">Mô tả gian hàng: </span>
              {shop.description || "Thương hiệu cung cấp sản phẩm chính hãng, đầy đủ giấy tờ kiểm định và hóa đơn VAT."}
            </div>
          </div>

          {/* Legal KYC Credentials */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              Thông Tin Định Danh &amp; Pháp Lý Chủ Shop
            </h4>
            <div className="grid grid-cols-2 gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 text-[13px]">
              <div>
                <span className="text-on-surface-variant block text-[11px] uppercase tracking-wide">
                  Họ tên người đại diện
                </span>
                <span className="font-semibold text-on-surface">{shop.owner_name}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] uppercase tracking-wide">
                  Số điện thoại xác thực
                </span>
                <span className="font-semibold text-on-surface">{shop.owner_phone}</span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] uppercase tracking-wide">
                  Email liên hệ
                </span>
                <span className="font-semibold text-on-surface truncate block">
                  {shop.owner_email}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block text-[11px] uppercase tracking-wide">
                  Mã số thuế / GPKD
                </span>
                <span className="font-semibold text-primary font-mono">0317899412</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-surface-container-low flex items-center justify-between">
                <div>
                  <span className="text-on-surface-variant block text-[11px] uppercase tracking-wide">
                    Số CCCD / Hộ chiếu
                  </span>
                  <span className="font-semibold text-on-surface font-mono">
                    079094002814 (Đã đối soát C06)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  Hợp lệ
                </span>
              </div>
            </div>
          </div>

          {/* Catalog & SKU Readiness */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">inventory</span>
              Sản Phẩm &amp; Danh Mục Chờ Duyệt ({shop.sku_label})
            </h4>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Số lượng sản phẩm khởi tạo:</span>
                <span className="font-bold text-on-surface">{shop.sku_count} SKUs</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Chu kỳ đối soát thanh toán:</span>
                <span className="font-bold text-on-surface">{shop.settlement_cycle}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low text-[12px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
                <span>
                  Các sản phẩm nháp đã vượt qua bộ lọc từ khóa cấm &amp; hình ảnh phản cảm tự động.
                </span>
              </div>
            </div>
          </div>

          {/* Commission Tier Configuration */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">
                percent
              </span>
              Thiết Lập Phí Hoa Hồng Sàn (Commission Tier)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { tier: "STANDARD", label: "Standard", rate: 5 },
                  { tier: "PREMIUM", label: "Premium", rate: 8 },
                  { tier: "MALL", label: "Mall Store", rate: 12 },
                ] as const
              ).map((item) => {
                const isSelected = selectedTier === item.tier;
                return (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => handleTierChange(item.tier)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary-fixed/30 ring-2 ring-primary/30"
                        : "border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container"
                    }`}
                  >
                    <span className="font-bold text-[14px] text-on-surface">{item.label}</span>
                    <span className="font-headline-md text-[18px] font-bold text-primary">
                      {item.rate}%
                    </span>
                    <span className="text-[11px] text-on-surface-variant">phí giao dịch</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Audit Notes */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Ghi Chú Phê Duyệt / Quyết Định Thẩm Định
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Nhập ghi chú cho thương nhân hoặc lý do cần bổ sung giấy tờ..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-outline text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 px-6 border-t border-surface-container-low bg-surface-container-lowest flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(true)}
            disabled={isActionLoading || shop.status === "REJECTED"}
            className="px-4 py-2.5 rounded-xl border border-error text-error hover:bg-error-container hover:text-on-error-container font-label-md text-label-md transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            <span>Từ chối hồ sơ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              id="approve-kyc-btn"
              type="button"
              onClick={() => onApprove(shop.id, adminNotes)}
              disabled={isActionLoading || shop.status === "ACTIVE"}
              className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isActionLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">
                    refresh
                  </span>
                  <span>Đang xử lý...</span>
                </>
              ) : shop.status === "ACTIVE" ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Đã duyệt thành công</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Duyệt KYC &amp; Kích Hoạt Shop</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reject Reason Confirmation Modal */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Từ Chối Hồ Sơ Gian Hàng
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {shop.name} ({shop.code})
                </p>
              </div>
            </div>

            <p className="text-body-md text-on-surface-variant">
              Vui lòng cung cấp lý do từ chối hồ sơ đăng ký để thông báo cho thương nhân bổ sung:
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Hình ảnh giấy phép kinh doanh bị mờ, thông tin CCCD không trùng khớp..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-error"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycReviewDrawer;
