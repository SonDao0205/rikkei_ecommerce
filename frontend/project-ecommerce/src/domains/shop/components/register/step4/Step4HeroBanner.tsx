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
            • Mã hồ sơ tạm thời: #ONB-2025-VNM-9481
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
          Kiểm tra lại thông tin &amp; Gửi hồ sơ phê duyệt
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Vui lòng rà soát kỹ các dữ liệu đã khai báo trước khi gửi lên Hội đồng Thẩm định MarketPulse. Hồ sơ sẽ được xử lý trong vòng 24 giờ làm việc.
        </p>
      </div>

      {/* Security Alert Banner */}
      <div className="mt-space-xs p-space-md rounded-xl bg-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-sm border border-outline-variant/30">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-secondary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <p className="font-label-lg text-label-lg text-on-surface font-bold">
              Cam kết bảo mật &amp; Tuân thủ pháp lý sàn MarketPulse
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Hồ sơ của bạn đã sẵn sàng nộp. Tất cả dữ liệu định danh và thông tin thuế được bảo vệ theo Nghị định 13/2023/NĐ-CP và mã hóa đầu cuối AES-256.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-center bg-surface-container-lowest px-3 py-1.5 rounded-full shadow-xs">
          <span className="material-symbols-outlined text-secondary text-[18px]">lock</span>
          <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
            SSL TLS 1.3 Certified
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step4HeroBanner;
