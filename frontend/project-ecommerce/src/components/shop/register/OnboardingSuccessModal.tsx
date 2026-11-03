import React from "react";
import { Link } from "react-router-dom";

interface OnboardingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  shopName?: string;
  ownerEmail?: string;
}

export const OnboardingSuccessModal: React.FC<OnboardingSuccessModalProps> = ({
  isOpen,
  onClose,
  applicationId = "#REQ-SHOP-8812",
  shopName = "UrbanStep Official Store",
  ownerEmail = "nguyen.vana@gmail.com",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-on-background/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      id="modal-success"
    >
      <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-xl p-6 sm:p-8 space-y-space-lg relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
          onClick={onClose}
          type="button"
          title="Đóng modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Success Badge & Icon */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">hourglass_top</span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold uppercase tracking-wide">
              PENDING_APPROVAL
            </div>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
              Hồ sơ mở gian hàng đã được gửi!
            </h3>
          </div>
        </div>

        {/* Application Details Callout */}
        <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
          <div className="flex justify-between items-center text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Mã định danh hồ sơ:</span>
            <span className="font-mono font-bold text-primary text-[14px]">
              {applicationId}
            </span>
          </div>
          <div className="flex justify-between items-center text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Tên gian hàng yêu cầu:</span>
            <span className="font-semibold text-on-surface">{shopName}</span>
          </div>
          <div className="flex justify-between items-center text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Thời gian dự kiến phản hồi:</span>
            <span className="font-semibold text-secondary">
              Trong vòng 24 - 48 giờ làm việc
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-outline-variant/30">
            Đội ngũ vận hành MarketPulse đang thẩm định tính hợp lệ của CCCD và thông tin kho hàng
            của bạn. Thông báo chính thức sẽ được gửi về email{" "}
            <strong className="text-on-surface font-mono">{ownerEmail}</strong>.
          </p>
        </div>

        {/* Approval Timeline Track */}
        <div className="space-y-space-sm">
          <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
            Tiến trình xét duyệt tự động:
          </h4>
          <div className="space-y-3 pl-2">
            {/* Step 1 (Done) */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 text-[14px]">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  1. Nộp hồ sơ đăng ký trực tuyến
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Đã hoàn thành lúc 15:25 - Dữ liệu đã mã hóa an toàn
                </div>
              </div>
            </div>

            {/* Step 2 (In progress) */}
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center flex-shrink-0 text-[14px] animate-pulse">
                <span className="material-symbols-outlined text-[14px]">sync</span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-bold text-primary">
                  2. Thẩm định pháp lý &amp; KYC tự động
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Đang xử lý đối soát cổng ngân hàng và CCCD gắn chip
                </div>
              </div>
            </div>

            {/* Step 3 (Upcoming) */}
            <div className="flex items-start gap-3 relative opacity-60">
              <div className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center flex-shrink-0 text-[14px]">
                <span className="material-symbols-outlined text-[14px]">storefront</span>
              </div>
              <div>
                <div className="font-label-md text-label-md font-bold text-on-surface">
                  3. Kích hoạt gian hàng &amp; Đăng bán sản phẩm
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Dự kiến hoàn thành trong 24 giờ tới
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-space-sm pt-2">
          <Link
            to="/admin/shops"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md text-center hover:bg-primary-container transition-colors shadow-sm"
          >
            Vào trang quản lý tạm thời (Seller Dashboard)
          </Link>
          <Link
            to="/"
            onClick={onClose}
            className="py-3 px-5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md text-center hover:bg-surface-container-high transition-colors"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccessModal;
