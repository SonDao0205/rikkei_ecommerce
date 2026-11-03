import React from "react";
import { Link } from "react-router-dom";

export interface Step1StepperProps {
  onStepClick?: (step: number) => void;
}

export const Step1Stepper: React.FC<Step1StepperProps> = ({
  onStepClick,
}) => {
  return (
    <div className="flex flex-col gap-space-md sm:gap-space-lg w-full">
      {/* Top Navigation Context & Security Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <nav className="flex items-center flex-wrap gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <Link
            to="/register-open-shop"
            onClick={() => onStepClick?.(1)}
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
          {/* Step 1: Đang thực hiện (Active) */}
          <div
            onClick={() => onStepClick?.(1)}
            className="flex items-center gap-3 cursor-default"
          >
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md shadow-md ring-4 ring-primary-fixed">
                <span>01</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                Bước 01 • Đang làm
              </span>
              <span className="font-label-lg text-label-lg text-primary font-bold truncate">
                Loại hình &amp; Tài khoản
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Thiết lập hồ sơ
              </span>
            </div>
          </div>

          {/* Step 2: Chưa thực hiện */}
          <div className="flex items-center gap-3 opacity-60 text-left select-none cursor-default">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                <span>02</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Bước 02
              </span>
              <span className="font-label-md text-label-md text-on-surface truncate">
                Shop &amp; Kho hàng
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Thiết lập vận hành
              </span>
            </div>
          </div>

          {/* Step 3: Chưa thực hiện */}
          <div className="flex items-center gap-3 opacity-60 text-left select-none cursor-default">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                <span>03</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Bước 03
              </span>
              <span className="font-label-md text-label-md text-on-surface truncate">
                KYC &amp; Ngân hàng
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Định danh doanh nghiệp
              </span>
            </div>
          </div>

          {/* Step 4: Chưa thực hiện */}
          <div className="flex items-center gap-3 opacity-60 text-left select-none cursor-default">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                <span>04</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Bước 04
              </span>
              <span className="font-label-md text-label-md text-on-surface truncate">
                Duyệt &amp; Hoàn tất
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Kích hoạt bán hàng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OnboardingStepper = Step1Stepper;
export default Step1Stepper;

