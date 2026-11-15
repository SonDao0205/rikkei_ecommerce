import React from "react";

interface AddProductActionBarProps {
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export const AddProductActionBar: React.FC<AddProductActionBarProps> = ({
  isSubmitting,
  onSaveDraft,
  onSubmit,
}) => {
  return (
    <aside className="fixed bottom-0 left-0 lg:left-72 right-0 bg-surface-container-lowest/95 backdrop-blur-md shadow-xl py-3 px-4 sm:px-6 lg:px-8 z-40 flex items-center justify-between border-t border-outline-variant/20">
      {/* Left Autosave Status & Ghost action */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="hidden sm:inline">Bản nháp tự động lưu liên tục</span>
          <span className="sm:hidden">Tự động lưu</span>
        </div>
        <button
          type="button"
          onClick={onSaveDraft}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Lưu bản nháp</span>
        </button>
      </div>

      {/* Right Primary Actions - Explicitly NO "Xem trước trên gian hàng", only "Thêm sản phẩm" */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-bold"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Thêm sản phẩm</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

