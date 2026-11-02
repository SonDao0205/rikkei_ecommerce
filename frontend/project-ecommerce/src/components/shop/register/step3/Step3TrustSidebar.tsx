import React from "react";

interface Step3TrustSidebarProps {
  selectedCycle?: string;
  hasIdNumber?: boolean;
  hasAccountNumber?: boolean;
}

export const Step3TrustSidebar: React.FC<Step3TrustSidebarProps> = ({
  selectedCycle = "T+3",
  hasIdNumber = false,
  hasAccountNumber = false,
}) => {
  return (
    <div className="flex flex-col gap-space-lg w-full">
      {/* 1. Live KYC Verification Status Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
            <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
              Tiến trình thẩm định KYC
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-bold">
            3/4 Hợp lệ
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Item 1 */}
          <div className="flex items-start gap-2.5 text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-on-surface block">Mặt trước CCCD gắn chip</span>
              <span className="text-on-surface-variant text-xs">Đã nhận diện OCR độ phân giải cao</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-2.5 text-body-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-on-surface block">Mặt sau &amp; Dải mã MRZ</span>
              <span className="text-on-surface-variant text-xs">Đạt chuẩn định dạng ICAO 9303</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-2.5 text-body-sm">
            <span
              className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                hasAccountNumber ? "text-secondary" : "text-primary"
              }`}
            >
              {hasAccountNumber ? "check_circle" : "sync"}
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-on-surface block">Đối soát tài khoản Napas 24/7</span>
              <span className="text-on-surface-variant text-xs">
                {hasAccountNumber
                  ? "Đã khớp tên thụ hưởng chính chủ"
                  : "Chờ kiểm tra số tài khoản"}
              </span>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start gap-2.5 text-body-sm opacity-60">
            <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">
              radio_button_unchecked
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-on-surface block">Ký hợp đồng đối tác điện tử</span>
              <span className="text-on-surface-variant text-xs">Thực hiện tại Bước 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Settlement Timeline Simulation Widget */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              payments
            </span>
            <h3 className="font-label-lg text-label-lg text-on-surface font-bold">
              Lịch đối soát doanh thu ({selectedCycle})
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-xs font-semibold text-primary">
            0đ Phí chuyển
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Dòng tiền bán hàng được bảo chứng qua cổng ký quỹ và tự động giải ngân theo lịch:
        </p>

        <div className="space-y-3 pt-1 border-l-2 border-primary/30 ml-2 pl-3">
          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-primary absolute -left-[17px] top-1.5"></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold block">
              Thứ 2: Giao hàng thành công
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Người mua ký nhận hoặc đơn hàng hoàn tất
            </span>
          </div>

          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-secondary absolute -left-[17px] top-1.5"></span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold block">
              Thứ 3: Tự động đối soát COD &amp; Phí sàn
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Hệ thống tổng hợp và chốt sao kê doanh thu
            </span>
          </div>

          <div className="relative">
            <span className="w-2 h-2 rounded-full bg-emerald-600 absolute -left-[17px] top-1.5"></span>
            <span className="font-label-sm text-label-sm text-emerald-800 font-bold block">
              Thứ 4: Tiền về tài khoản Napas 24/7
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
              Nhận thông báo biến động số dư tức thì
            </span>
          </div>
        </div>
      </div>

      {/* 3. Security & Legal Badges */}
      <div className="bg-surface-container-low rounded-2xl p-space-md border border-outline-variant/30 flex flex-col gap-space-sm">
        <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md font-bold">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            shield_lock
          </span>
          <span>Chứng chỉ bảo mật &amp; Pháp lý</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
          <div className="p-2.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span className="font-medium">NĐ 13/2023/NĐ-CP</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
            <span className="font-medium">Mã hóa AES-256</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">credit_card</span>
            <span className="font-medium">PCI-DSS Level 1</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-lowest shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
            <span className="font-medium">Bộ Công Thương</span>
          </div>
        </div>
      </div>

      {/* 4. Merchant Support Contact Mini Box */}
      <div className="p-space-md rounded-2xl bg-primary-fixed/30 border border-primary/20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Hỗ trợ Seller KYC 24/7
          </span>
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Cần giải đáp về quy trình định danh hoặc thay đổi thông tin ngân hàng doanh nghiệp?
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono font-bold text-headline-sm text-primary">1900 6868</span>
          <span className="text-xs font-semibold text-secondary hover:underline cursor-pointer">
            Chat chuyên viên
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step3TrustSidebar;
