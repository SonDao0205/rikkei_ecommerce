import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Step2FooterBarProps {
  onSaveDraft: () => void;
  onNextStep: () => void;
  isSavingDraft?: boolean;
  lastSavedAt?: string | null;
}

export const Step2FooterBar: React.FC<Step2FooterBarProps> = ({
  onSaveDraft,
  onNextStep,
  isSavingDraft = false,
  lastSavedAt = "15:25",
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleNextClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onNextStep();
    }, 800);
  };

  return (
    <div className="mt-space-lg bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
      {/* Left: Draft autosave status */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-start">
        <button
          id="btnSaveDraft"
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
            {isSavingDraft ? "sync" : "save"}
          </span>
          <span className="hidden sm:inline">
            {isSavingDraft ? "Đang lưu..." : "Lưu bản nháp"}
          </span>
        </button>

        <span className="text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
          <span id="draftStatus">
            {manualSavedTime
              ? `Đã lưu bản nháp thủ công lúc ${manualSavedTime}`
              : `Đã lưu tự động lúc ${lastSavedAt || "15:25"}`}
          </span>
        </span>
      </div>

      {/* Right: Navigation controls */}
      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
        {/* Back to Step 1 */}
        <Link
          to="/register-open-shop"
          className="px-5 py-3 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Quay lại (Bước 1)</span>
        </Link>

        {/* Continue to Step 3 */}
        <button
          id="btnNextStep"
          onClick={handleNextClick}
          disabled={isSyncing}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-all font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer disabled:opacity-75"
          type="button"
        >
          {isSyncing ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
              <span>Đang đồng bộ dữ liệu...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục (Bước 3: KYC &amp; Ngân hàng)</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step2FooterBar;
