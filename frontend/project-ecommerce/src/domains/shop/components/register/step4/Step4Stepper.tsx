import React from "react";
import { Link } from "react-router-dom";

interface Step4StepperProps {
  onStepClick?: (step: number) => void;
  shopName?: string;
  accountType?: string;
  kycSummary?: string;
}

export const Step4Stepper: React.FC<Step4StepperProps> = ({
  onStepClick,
  shopName = "UrbanStep Sneaker Hub",
  accountType = "Cá nhân / Hộ kinh doanh",
  kycSummary = "CCCD & Vietcombank",
}) => {
  return (
    <div className="flex flex-col gap-space-md sm:gap-space-lg w-full">
      {/* Top Navigation Context & Security Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
        <nav className="flex items-center flex-wrap gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <Link
            to="/register-open-shop"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Kênh Người Bán
          </Link>
          <span className="text-outline-variant font-body-sm text-body-sm">/</span>
          <span className="text-on-surface-variant">Đăng ký đối tác Merchant</span>
          <span className="text-outline-variant font-body-sm text-body-sm">/</span>
          <span className="bg-primary-container text-on-primary-container font-bold rounded-lg px-2 py-0.5">
            Quy trình thiết lập gian hàng
          </span>
        </nav>

        <div className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-space-sm py-space-xs rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-outline-variant/30 w-fit">
          <span
            className="material-symbols-outlined text-secondary text-[16px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span>Hệ thống bảo mật KYC chuẩn e-Commerce Việt Nam (Nghị định 52 &amp; 13/2023/NĐ-CP)</span>
        </div>
      </div>

      {/* Stepper Progress Bar (4 Bước) */}
      <section className="w-full bg-surface-container-lowest shadow-sm rounded-xl border border-outline-variant/30">
        <div className="w-full p-space-md sm:p-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md relative">
            {/* Step 1 Complete */}
            <Link
              to="/register-open-shop"
              onClick={() => onStepClick?.(1)}
              className="group flex items-center gap-space-sm p-space-sm rounded-xl transition-all duration-200 hover:bg-surface-container-low cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Bước 1
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">
                    Hoàn tất
                  </span>
                </div>
                <p className="font-label-lg text-label-lg text-on-surface truncate group-hover:text-primary transition-colors font-bold">
                  Loại hình &amp; Tài khoản
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {accountType}
                </p>
              </div>
            </Link>

            {/* Step 2 Complete */}
            <Link
              to="/register-open-shop/step2"
              onClick={() => onStepClick?.(2)}
              className="group flex items-center gap-space-sm p-space-sm rounded-xl transition-all duration-200 hover:bg-surface-container-low cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Bước 2
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">
                    Hoàn tất
                  </span>
                </div>
                <p className="font-label-lg text-label-lg text-on-surface truncate group-hover:text-primary transition-colors font-bold">
                  Shop &amp; Kho hàng
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {shopName}
                </p>
              </div>
            </Link>

            {/* Step 3 Complete */}
            <Link
              to="/register-open-shop/step3"
              onClick={() => onStepClick?.(3)}
              className="group flex items-center gap-space-sm p-space-sm rounded-xl transition-all duration-200 hover:bg-surface-container-low cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Bước 3
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">
                    Hoàn tất
                  </span>
                </div>
                <p className="font-label-lg text-label-lg text-on-surface truncate group-hover:text-primary transition-colors font-bold">
                  KYC &amp; Ngân hàng
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {kycSummary}
                </p>
              </div>
            </Link>

            {/* Step 4 Active Highlight */}
            <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-primary-fixed shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-md">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  assignment_turned_in
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                    Bước 4 • Hiện tại
                  </span>
                </div>
                <p className="font-label-lg text-label-lg text-primary font-bold truncate">
                  Duyệt &amp; Hoàn tất
                </p>
                <p className="font-body-sm text-body-sm text-on-primary-fixed-variant truncate font-medium">
                  Xem lại &amp; Gửi hồ sơ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Step4Stepper;
