import React from "react";

interface OnboardingStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

interface StepItem {
  step: number;
  label: string;
  sublabel: string;
  note: string;
  icon: string;
}

const STEPS: StepItem[] = [
  { step: 1, label: "Bước 01", sublabel: "Loại hình & Tài khoản", note: "Thiết lập hồ sơ", icon: "badge" },
  { step: 2, label: "Bước 02", sublabel: "Shop & Kho hàng", note: "Thiết lập vận hành", icon: "storefront" },
  { step: 3, label: "Bước 03", sublabel: "KYC & Ngân hàng", note: "Định danh doanh nghiệp", icon: "account_balance" },
  { step: 4, label: "Bước 04", sublabel: "Duyệt & Hoàn tất", note: "Kích hoạt bán hàng", icon: "task_alt" },
];

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  onStepClick,
}) => {
  const getProgressPercentage = () => {
    switch (currentStep) {
      case 1:
        return "25%";
      case 2:
        return "50%";
      case 3:
        return "75%";
      case 4:
        return "100%";
      default:
        return "25%";
    }
  };

  return (
    <section className="w-full bg-surface-container-low py-space-lg">
      <div className="max-w-[1080px] mx-auto px-gutter">
        {/* Breadcrumb and Support Prompt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-lg">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <span className="text-primary font-bold">Kênh Người Bán</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Đăng ký đối tác Merchant</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-bold">Quy trình thiết lập gian hàng</span>
          </div>
          <div className="flex items-center gap-space-xs px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm shadow-sm w-fit">
            <span className="material-symbols-outlined text-[16px] text-secondary">
              verified_user
            </span>
            <span>Hệ thống bảo mật KYC chuẩn e-Commerce Việt Nam</span>
          </div>
        </div>

        {/* 4-Step Horizontal Stepper Navigation */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {STEPS.map((item) => {
              const isCurrent = item.step === currentStep;
              const isPast = item.step < currentStep;

              if (isCurrent) {
                return (
                  <div
                    key={item.step}
                    id={`step-nav-${item.step}`}
                    className="flex items-center gap-3"
                  >
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md shadow-md ring-4 ring-primary-fixed">
                        <span>0{item.step}</span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                        {item.label} • Đang làm
                      </span>
                      <span className="font-label-lg text-label-lg text-primary font-bold truncate">
                        {item.sublabel}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {item.note}
                      </span>
                    </div>
                  </div>
                );
              }

              if (isPast) {
                return (
                  <button
                    key={item.step}
                    id={`step-nav-${item.step}`}
                    type="button"
                    onClick={() => onStepClick(item.step)}
                    className="flex items-center gap-3 group text-left cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm transition-transform group-hover:scale-105">
                        <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        {item.label}
                      </span>
                      <span className="font-label-md text-label-md text-on-surface truncate group-hover:text-primary transition-colors">
                        {item.sublabel}
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary flex items-center gap-0.5">
                        Đã xác nhận
                      </span>
                    </div>
                  </button>
                );
              }

              // Future unreached step: no links / unclickable
              return (
                <div
                  key={item.step}
                  id={`step-nav-${item.step}`}
                  className="flex items-center gap-3 opacity-60 text-left select-none cursor-default"
                >
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
                      <span>0{item.step}</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface truncate">
                      {item.sublabel}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.note}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Linear Progress Tracker Indicator */}
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              id="stepper-progress-bar"
              style={{ width: getProgressPercentage() }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingStepper;
