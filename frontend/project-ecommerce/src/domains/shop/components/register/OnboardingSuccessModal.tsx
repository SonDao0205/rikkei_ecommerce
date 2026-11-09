import React from "react";
import { Link } from "react-router-dom";

interface OnboardingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  shopName: string;
  ownerEmail: string;
  message?: string;
}

export const OnboardingSuccessModal: React.FC<OnboardingSuccessModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  shopName,
  ownerEmail,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-on-background/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      id="modal-success"
    >
      <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200">
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer"
          onClick={onClose}
          type="button"
          title="Đóng modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-center gap-4 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">info</span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-label-sm font-bold uppercase tracking-wide">
              Đang chờ xét duyệt
            </div>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
              Hồ sơ đã được gửi
            </h3>
          </div>
        </div>

        <div role="status" className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <p className="font-body-md text-body-md text-amber-950">
            {message || "Hồ sơ shop đã được lưu trên máy chủ và đang chờ xét duyệt."}
          </p>
          <p className="font-body-sm text-body-sm text-amber-900">
            Thông tin giấy tờ định danh và tài khoản ngân hàng chưa được thu thập trong luồng này.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low space-y-2 text-body-sm">
          <div className="flex justify-between gap-4">
            <span className="text-on-surface-variant">Mã hồ sơ:</span>
            <span className="font-mono font-bold text-on-surface">{applicationId || "Chưa tạo"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-on-surface-variant">Tên gian hàng:</span>
            <span className="font-semibold text-on-surface">{shopName || "Chưa nhập"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-on-surface-variant">Email tài khoản:</span>
            <span className="font-mono text-on-surface">{ownerEmail || "Chưa nhập"}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-space-sm pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md text-center hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
          >
            Đóng
          </button>
          <Link
            to="/"
            onClick={onClose}
            className="py-3 px-5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md text-center hover:bg-surface-container-high transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccessModal;
