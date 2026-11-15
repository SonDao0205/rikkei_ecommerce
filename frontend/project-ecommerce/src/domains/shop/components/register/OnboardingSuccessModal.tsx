import React from "react";
import { Link } from "react-router-dom";

interface OnboardingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  shopName: string;
  ownerEmail?: string;
  message?: string;
}

export const OnboardingSuccessModal: React.FC<OnboardingSuccessModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  shopName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-inverse-surface/60 backdrop-blur-sm animate-fade-in"
      id="successSubmissionModal"
    >
      <div className="w-full max-w-xl rounded-2xl bg-surface-container-lowest shadow-2xl p-space-xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top aesthetic badge */}
        <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-space-md shadow-md">
          <span
            className="material-symbols-outlined text-[42px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
        </div>

        <div className="flex items-center gap-space-xs mb-space-xs">
          <span className="px-space-sm py-0.5 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider">
            Hồ sơ đã được gửi thành công
          </span>
        </div>

        <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Chào mừng đến với MarketPulse!
        </h2>

        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-md">
          Hồ sơ gian hàng của bạn đã được chuyển đến bộ phận Thẩm định Người bán. Kết quả xét duyệt sẽ được thông báo qua SMS và Email trong 24h làm việc.
        </p>

        {/* Ticket Metadata Box */}
        <div className="w-full mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs text-left">
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Mã hồ sơ phê duyệt:
            </span>
            <span className="font-label-md text-label-md text-primary font-bold font-mono">
              {applicationId || "#REQ-SHOP-8812"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Trạng thái hồ sơ:
            </span>
            <span className="px-space-sm py-0.5 rounded bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold">
              PENDING_APPROVAL (Đang thẩm định)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tên gian hàng đã tạo:
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold">
              {shopName || "UrbanStep Sneaker Hub"}
            </span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-space-sm mt-space-lg">
          <Link
            to="/shop/dashboard"
            onClick={onClose}
            className="grow py-3 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors flex items-center justify-center gap-space-xs shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            <span>Vào tham quan Seller Center</span>
          </Link>
          <button
            onClick={onClose}
            type="button"
            className="grow py-3 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-medium transition-colors cursor-pointer"
          >
            Về trang chủ MarketPulse
          </button>
        </div>

        {/* Close Icon Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          title="Đóng modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default OnboardingSuccessModal;
