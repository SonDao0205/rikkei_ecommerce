import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

export interface SwitchToShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  shopName?: string;
  userName?: string;
}

export const SwitchToShopModal: React.FC<SwitchToShopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  shopName,
  userName,
}) => {
  const { t } = useTranslation('customer');
  const [isRendered, setIsRendered] = useState(false);

  const handleClose = useCallback(() => {
    setIsRendered(false);
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 20);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-shop-modal-title"
    >
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-6 sm:p-8 z-10 transform transition-all duration-200 ease-out ${
          isRendered
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Storefront Icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-[32px]">storefront</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary ring-2 ring-white"></span>
            </span>
          </div>

          {/* Heading */}
          <h3
            id="switch-shop-modal-title"
            className="text-xl font-extrabold text-slate-900 tracking-tight"
          >
            {t("header.switch_shop_modal.title")}
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm">
            {t("header.switch_shop_modal.description")}
          </p>

          {/* Shop/User Preview Box */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">store</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-slate-900 truncate">
                {shopName || userName || "Kênh Người Bán"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary">
                  Seller Partner
                </span>
                <span className="text-[11px] text-slate-400">• Quản lý bán hàng</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer"
            >
              {t("header.switch_shop_modal.btn_cancel")}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t("header.switch_shop_modal.btn_confirm")}</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwitchToShopModal;

