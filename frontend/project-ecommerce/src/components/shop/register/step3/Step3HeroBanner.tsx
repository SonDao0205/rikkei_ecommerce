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
                Định danh điện tử (KYC) &amp; Tài khoản thanh toán
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                Bắt buộc theo luật TMĐT
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Xác thực danh tính chủ sở hữu gian hàng và liên kết tài khoản ngân hàng chính chủ để nhận tiền thanh toán đối soát doanh thu tự động (COD &amp; Online).
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
          <span className="font-label-md text-label-md text-on-surface font-semibold">Tự động OCR 2.0</span>
          <span className="text-on-surface-variant text-body-sm">| Độ chính xác 99.8%</span>
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
              Cam kết bảo mật dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase">
              AES-256 Cloud HSM
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Thông tin căn cước công dân và tài khoản ngân hàng được mã hóa đầu cuối và chỉ được sử dụng cho mục đích định danh pháp lý chủ gian hàng, đối soát dòng tiền và kê khai thuế điện tử với Tổng cục Thuế theo quy định hiện hành.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3HeroBanner;
