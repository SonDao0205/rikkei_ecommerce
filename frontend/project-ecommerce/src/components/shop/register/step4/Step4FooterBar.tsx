import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Step4FooterBarProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  lastSavedAt?: string | null;
  canSubmit?: boolean;
}

export const Step4FooterBar: React.FC<Step4FooterBarProps> = ({
  onSaveDraft,
  onSubmit,
  isSubmitting = false,
  isSavingDraft = false,
  lastSavedAt = "15:32",
  canSubmit = true,
}) => {
  const [manualSavedTime, setManualSavedTime] = useState<string | null>(null);
  const [saveSuccessAnimation, setSaveSuccessAnimation] = useState(false);

  const handleManualSave = () => {
    onSaveDraft();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setManualSavedTime(timeStr);
    setSaveSuccessAnimation(true);
    setTimeout(() => setSaveSuccessAnimation(false), 1200);
  };

  return (
    <div className="mt-space-lg bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
      {/* Left side: Auto-save status and draft button */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={handleManualSave}
          disabled={isSavingDraft}
          className={`px-4 py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
            saveSuccessAnimation
              ? "bg-primary-fixed text-on-primary-fixed"
              : "bg-surface-container hover:bg-surface-container-high text-on-surface"
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSavingDraft ? "sync" : "save_as"}
          </span>
          <span className="hidden sm:inline">
            {isSavingDraft ? "Đang lưu..." : "Lưu bản nháp & Thoát"}
          </span>
        </button>

        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>
            Đã tự động lưu hồ sơ lúc{" "}
            <strong className="text-on-surface font-mono">
              {manualSavedTime || lastSavedAt || "15:32"}
            </strong>
          </span>
        </div>
      </div>

      {/* Right side: Step back and Primary Submission CTA */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
        <Link
          to="/register-open-shop/step3"
          className="px-5 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden md:inline">Quay lại (Bước 3: KYC &amp; Ngân hàng)</span>
          <span className="md:hidden">Quay lại</span>
        </Link>

        <button
          onClick={onSubmit}
          disabled={isSubmitting || !canSubmit}
          className={`px-7 py-3 rounded-xl font-label-lg text-label-lg font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
            !canSubmit
              ? "bg-surface-container-high text-outline cursor-not-allowed opacity-70"
              : "bg-primary hover:bg-primary-container text-on-primary active:scale-95 shadow-lg"
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isSubmitting ? "sync" : "rocket_launch"}
          </span>
          <span>{isSubmitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ đăng ký phê duyệt"}</span>
        </button>
      </div>
    </div>
  );
};

export default Step4FooterBar;
