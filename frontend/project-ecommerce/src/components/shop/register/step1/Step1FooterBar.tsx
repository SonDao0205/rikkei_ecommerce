import React from "react";

export interface Step1FooterBarProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  lastSavedAt?: string | null;
}

export const Step1FooterBar: React.FC<Step1FooterBarProps> = ({
  currentStep,
  onPrevStep,
  onNextStep,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  isSavingDraft = false,
  lastSavedAt = null,
}) => {
  return (
    <div className="mt-space-lg bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
      {/* Draft Auto-save indicator */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={onSaveDraft}
          disabled={isSavingDraft}
          className="px-4 py-2.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSavingDraft ? "sync" : "save"}
          </span>
          {isSavingDraft ? "Đang lưu..." : "Lưu bản nháp"}
        </button>

        <span className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
          {lastSavedAt ? `Đã lưu lên máy chủ lúc ${lastSavedAt}` : "Bản nháp chưa được lưu lên máy chủ"}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
        {currentStep > 1 && (
          <button
            id="btn-back"
            onClick={onPrevStep}
            className="px-5 py-3 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại
          </button>
        )}

        {currentStep < 4 ? (
          <button
            id="btn-next"
            onClick={onNextStep}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <span>Tiếp tục (Bước kế tiếp)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        ) : (
          <button
            id="btn-submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSubmitting ? "sync" : "send"}
            </span>
            <span>{isSubmitting ? "Đang nộp hồ sơ..." : "Gửi hồ sơ đăng ký gian hàng"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const OnboardingFooterBar = Step1FooterBar;
export default Step1FooterBar;
