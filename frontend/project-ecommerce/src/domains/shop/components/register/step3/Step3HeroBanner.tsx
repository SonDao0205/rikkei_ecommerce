import React from "react";

export const Step3HeroBanner: React.FC = () => {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center gap-space-md justify-between">
        <div className="flex items-start sm:items-center gap-space-md">
          <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">badge</span>
          </div>
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold">
                Thông tin bổ sung
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-label-sm">
                Chưa thu thập KYC
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Bước này hiện chỉ giải thích phạm vi dữ liệu. Backend chưa tiếp nhận giấy tờ định danh hoặc thông tin tài khoản ngân hàng.
            </p>
          </div>
        </div>
      </div>

      {/* High-security Legal Notice Callout */}
      <div className="p-space-md rounded-2xl bg-surface-container-low flex items-start gap-space-md shadow-sm border border-outline-variant/30">
        <div className="w-9 h-9 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">privacy_tip</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-space-xs mb-0.5 flex-wrap">
            <span className="font-label-md text-label-md text-on-surface font-bold">
              Không gửi dữ liệu nhạy cảm trong bước này
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Không nhập CCCD, mã số thuế, ảnh giấy tờ hoặc thông tin ngân hàng. Khi backend có API và quy trình bảo vệ dữ liệu phù hợp, hệ thống mới yêu cầu các thông tin này.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3HeroBanner;
