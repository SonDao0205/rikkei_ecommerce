import React from "react";
import { Link } from "react-router-dom";

export const OnboardingHeader: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-[1440px] mx-auto px-gutter flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <Link to="/" className="flex items-center gap-space-xs group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[22px]">insights</span>
            </div>
            <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">
              MarketPulse
            </span>
          </Link>
          <div className="h-5 w-[1px] bg-outline-variant hidden sm:block"></div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm tracking-wide uppercase font-semibold">
            SELLER ONBOARDING PORTAL • Kênh Người Bán
          </span>
        </div>

        <div className="flex items-center gap-space-lg">
          <div className="hidden lg:flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              support_agent
            </span>
            <span>Hotline hỗ trợ Seller:</span>
            <span className="font-label-md text-label-md text-on-surface font-bold">
              1900 6868
            </span>
          </div>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại trang mua sắm (Storefront)
          </Link>

          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm"
            title="Tài khoản người bán"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
      <div
        role="alert"
        className="px-4 py-1.5 bg-amber-50 border-t border-amber-200 text-center text-xs sm:text-sm text-amber-950"
      >
        Bản mô phỏng chưa kết nối BE. Không nhập mật khẩu thật, giấy tờ tùy thân hoặc thông tin ngân hàng.
      </div>
    </header>
  );
};

export default OnboardingHeader;
