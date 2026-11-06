import React from "react";

export const Step4HeroBanner: React.FC = () => {
  return (
    <div className="flex flex-col gap-space-md w-full">
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center gap-space-xs flex-wrap">
          <span className="px-space-sm py-space-xs rounded bg-surface-container-high text-primary font-label-sm text-label-sm uppercase font-bold tracking-wider">
            Giai đoạn cuối cùng
          </span>
          <span className="text-on-surface-variant font-body-sm text-body-sm">
            • Mã hồ sơ sẽ được cấp sau khi gửi lên máy chủ
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Kiểm tra lại thông tin &amp; Gửi hồ sơ phê duyệt
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-4xl">
          Kiểm tra thông tin shop và gửi hồ sơ để quản trị viên xét duyệt. Trạng thái sẽ được cập nhật theo phản hồi từ máy chủ.
        </p>
      </div>

      {/* Security Alert Banner */}
      <div className="mt-space-xs p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-secondary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <p className="font-label-lg text-label-lg text-on-surface font-bold">
              Cam kết bảo mật &amp; Tuân thủ pháp lý sàn MarketPulse
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Chỉ thông tin cơ bản của shop được gửi lên backend. Dữ liệu KYC và ngân hàng chưa được thu thập.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-xs">
          <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
            Chờ xác nhận từ máy chủ
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step4HeroBanner;
