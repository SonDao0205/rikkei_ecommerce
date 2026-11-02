import React from "react";
import { Link } from "react-router-dom";

interface Step4StepperProps {
  onStepClick?: (step: number) => void;
}

export const Step4Stepper: React.FC<Step4StepperProps> = ({ onStepClick }) => {
  return (
    <div className="flex flex-col gap-space-md sm:gap-space-lg w-full">
      {/* Top Navigation Context & Security Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <nav className="flex items-center flex-wrap gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <Link
            to="/register-open-shop"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Kênh Người Bán</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">
            chevron_right
          </span>
          <span className="hover:text-primary transition-colors">Đăng ký đối tác Merchant</span>
          <span className="material-symbols-outlined text-[14px] text-outline-variant">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">Quy trình thiết lập gian hàng</span>
        </nav>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shadow-sm w-fit">
          <span
            className="material-symbols-outlined text-[18px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span>Bảo mật KYC chuẩn e-Commerce Việt Nam (Nghị định 52 &amp; 13/2023/NĐ-CP)</span>
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse ml-0.5"></span>
        </div>
      </div>

      {/* Stepper Progress Bar (4 Bước) */}
      <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Step 1: Hoàn tất */}
          <Link
            to="/register-open-shop"
            onClick={() => onStepClick?.(1)}
            className="flex items-center gap-3 group text-left cursor-pointer p-2 rounded-xl transition-all hover:bg-surface-container-low"
          >
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  Bước 01
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary">Hoàn tất</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                Loại hình &amp; Tài khoản
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Cá nhân / Hộ kinh doanh
              </span>
            </div>
          </Link>

          {/* Step 2: Hoàn tất */}
          <Link
            to="/register-open-shop/step2"
            onClick={() => onStepClick?.(2)}
            className="flex items-center gap-3 group text-left cursor-pointer p-2 rounded-xl transition-all hover:bg-surface-container-low"
          >
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  Bước 02
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary">Hoàn tất</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                Shop &amp; Kho hàng
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Định vị &amp; Vận chuyển
              </span>
            </div>
          </Link>

          {/* Step 3: Hoàn tất */}
          <Link
            to="/register-open-shop/step3"
            onClick={() => onStepClick?.(3)}
            className="flex items-center gap-3 group text-left cursor-pointer p-2 rounded-xl transition-all hover:bg-surface-container-low"
          >
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[20px] font-bold">check</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  Bước 03
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary">Hoàn tất</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                KYC &amp; Ngân hàng
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                CCCD &amp; Napas 24/7
              </span>
            </div>
          </Link>

          {/* Step 4: Đang làm (Active Highlight) */}
          <div className="flex items-center gap-3 text-left p-2 rounded-xl bg-primary-fixed shadow-sm">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  assignment_turned_in
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Bước 04 • Hiện tại
              </span>
              <span className="font-label-md text-label-md text-primary font-bold truncate">
                Duyệt &amp; Hoàn tất
              </span>
              <span className="font-body-sm text-body-sm text-on-primary-fixed-variant truncate font-medium">
                Xem lại &amp; Gửi hồ sơ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Stepper;
