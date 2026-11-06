import React, { useRef } from "react";
import type { ShopKycData } from "@/shared/types";

interface Step3KycPanelProps {
  data: ShopKycData;
  accountHolderName: string;
  onChange: (fields: Partial<ShopKycData>) => void;
}

const BANKS = [
  "Vietcombank - Ngân hàng Ngoại thương Việt Nam",
  "Techcombank - Ngân hàng TMCP Kỹ Thương",
  "MB Bank - Ngân hàng Quân Đội",
  "BIDV - Ngân hàng Đầu tư và Phát triển",
  "ACB - Ngân hàng Á Châu",
  "VPBank - Ngân hàng Việt Nam Thịnh Vượng",
  "VietinBank - Ngân hàng Công Thương Việt Nam",
];

export const Step3KycPanel: React.FC<Step3KycPanelProps> = ({
  data,
  accountHolderName,
  onChange,
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      onChange({
        frontCardUrl: url,
        frontCardName: file.name,
        frontCardSize: sizeMb,
      });
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      onChange({
        backCardUrl: url,
        backCardName: file.name,
        backCardSize: sizeMb,
      });
    }
  };

  const displayName = (data.accountHolder || accountHolderName || "NGUYEN VAN AN").toUpperCase();

  return (
    <div className="space-y-space-lg" id="step-panel-3">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-2">
          <span className="material-symbols-outlined text-[15px]">security</span>
          <span>Tuân thủ pháp lý &amp; Nhận doanh thu</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
          Định danh điện tử (KYC) &amp; Tài khoản ngân hàng
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Hồ sơ được đối soát tự động với cổng dữ liệu dân cư để đảm bảo tính an toàn cho người bán và người mua.
        </p>
      </div>

      {/* CCCD Identification Form */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">id_card</span>
          Thông tin Căn cước công dân gắn chip (CCCD)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Số CCCD (12 chữ số) *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              maxLength={12}
              value={data.idNumber}
              onChange={(e) => onChange({ idNumber: e.target.value })}
              placeholder="VD: 079094008912"
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Ngày cấp *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              type="date"
              value={data.issueDate}
              onChange={(e) => onChange({ issueDate: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Nơi cấp *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              value={data.issuePlace}
              onChange={(e) => onChange({ issuePlace: e.target.value })}
              placeholder="VD: Cục Cảnh sát QLHC về TTXH"
            />
          </div>
        </div>

        {/* Document Upload Cards (Front & Back) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
          {/* CCCD Front */}
          <div className="p-4 rounded-xl bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                Mặt trước CCCD
              </span>
              {data.frontCardUrl ? (
                <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Đã tải lên
                </span>
              ) : (
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Chưa tải lên
                </span>
              )}
            </div>
            <div
              onClick={() => frontInputRef.current?.click()}
              className="h-40 rounded-lg overflow-hidden bg-surface-container flex flex-col items-center justify-center relative group cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {data.frontCardUrl ? (
                <>
                  <img
                    className="w-full h-full object-cover"
                    alt="Mặt trước CCCD"
                    src={data.frontCardUrl}
                  />
                  <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <span className="px-3 py-1.5 rounded-lg bg-surface text-on-surface font-label-md text-label-md">
                      Thay đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant p-4 text-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">
                    cloud_upload
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    Tải ảnh mặt trước CCCD
                  </span>
                  <span className="font-body-sm text-body-sm">
                    Khuyến nghị ảnh chụp rõ nét, không lóa
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={frontInputRef}
                onChange={handleFrontUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
              <span className="truncate max-w-[200px]">
                {data.frontCardName || "Chưa chọn tệp ảnh"}
              </span>
              <span className="font-mono">{data.frontCardSize || ""}</span>
            </div>
          </div>

          {/* CCCD Back */}
          <div className="p-4 rounded-xl bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                Mặt sau CCCD
              </span>
              {data.backCardUrl ? (
                <span className="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Đã tải lên
                </span>
              ) : (
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Chưa tải lên
                </span>
              )}
            </div>
            <div
              onClick={() => backInputRef.current?.click()}
              className="h-40 rounded-lg overflow-hidden bg-surface-container flex flex-col items-center justify-center relative group cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {data.backCardUrl ? (
                <>
                  <img
                    className="w-full h-full object-cover"
                    alt="Mặt sau CCCD"
                    src={data.backCardUrl}
                  />
                  <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <span className="px-3 py-1.5 rounded-lg bg-surface text-on-surface font-label-md text-label-md">
                      Thay đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-on-surface-variant p-4 text-center">
                  <span className="material-symbols-outlined text-[32px] text-primary">
                    cloud_upload
                  </span>
                  <span className="font-label-md text-label-md font-semibold text-primary">
                    Tải ảnh mặt sau CCCD
                  </span>
                  <span className="font-body-sm text-body-sm">
                    Hiển thị rõ mã vạch và chip điện tử
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={backInputRef}
                onChange={handleBackUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
              <span className="truncate max-w-[200px]">
                {data.backCardName || "Chưa chọn tệp ảnh"}
              </span>
              <span className="font-mono">{data.backCardSize || ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Payout Information */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          Tài khoản ngân hàng thụ hưởng (Đối soát doanh thu)
        </h3>

        {/* Notice Callout Banner */}
        <div className="p-4 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-start gap-3">
          <span className="material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5">
            warning
          </span>
          <div className="font-body-sm text-body-sm leading-relaxed">
            <span className="font-bold">LƯU Ý QUAN TRỌNG:</span> Tên chủ sở hữu tài khoản ngân hàng
            thụ hưởng <strong>BẮT BUỘC PHẢI TRÙNG KHỚP 100%</strong> với họ tên trên CCCD của người
            đăng ký (
            <strong className="uppercase">
              {displayName || "HỌ TÊN NGƯỜI ĐĂNG KÝ"}
            </strong>
            ). MarketPulse sẽ tự động đối soát giao dịch để từ chối rút tiền nếu tên tài khoản không
            trùng khớp.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Ngân hàng thụ hưởng *
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                value={data.bankName}
                onChange={(e) => onChange({ bankName: e.target.value })}
              >
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Số tài khoản ngân hàng *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                type="text"
                value={data.accountNumber}
                onChange={(e) => onChange({ accountNumber: e.target.value })}
                placeholder="VD: 0071001234567"
              />
              {data.accountNumber && (
                <span className="absolute right-3 top-3.5 material-symbols-outlined text-secondary text-[20px]">
                  verified
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Tên chủ tài khoản (In hoa không dấu) *
            </label>
            <div className="flex items-center px-4 py-3 bg-surface-container rounded-lg font-body-md text-body-md text-on-surface font-mono font-bold tracking-wider">
              <span className="material-symbols-outlined text-outline mr-2 text-[20px]">lock</span>
              <span className={displayName ? "text-on-surface" : "text-outline italic"}>
                {displayName || "Tự động khóa theo CCCD"}
              </span>
              <span className="ml-auto text-primary font-label-sm text-label-sm uppercase">
                Khóa theo CCCD
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Chi nhánh ngân hàng *
            </label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              type="text"
              value={data.bankBranch}
              onChange={(e) => onChange({ bankBranch: e.target.value })}
              placeholder="VD: Chi nhánh TP. Hồ Chí Minh"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3KycPanel;
