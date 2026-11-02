import React, { useRef } from "react";
import type { ShopKycData } from "../../../../types";

interface Step3LegalKycCardProps {
  data: ShopKycData;
  accountHolderName?: string;
  onChange: (fields: Partial<ShopKycData>) => void;
}

export const Step3LegalKycCard: React.FC<Step3LegalKycCardProps> = ({
  data,
  accountHolderName = "",
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

  const effectiveHolderName = data.accountHolder || accountHolderName;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-lg">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-sm gap-space-sm border-b border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
            1
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Định danh pháp lý chủ sở hữu gian hàng
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Thông tin giấy tờ tùy thân của người đại diện hợp pháp
            </p>
          </div>
        </div>
      </div>

      {/* Document Upload Box (CCCD Chip 2 mặt) */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1.5">
            <span>Ảnh chụp Căn cước công dân gắn chip (2 mặt)</span>
            <span className="text-tertiary">*</span>
          </label>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          {/* Front ID Card */}
          <div className="flex flex-col gap-space-xs">
            <input
              type="file"
              ref={frontInputRef}
              onChange={handleFrontUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-surface-container flex flex-col justify-between p-3 group border border-dashed border-outline-variant">
              {data.frontCardUrl ? (
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={data.frontCardUrl}
                  alt="Mặt trước CCCD"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="material-symbols-outlined text-[36px] text-primary mb-1">
                    add_a_photo
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Tải lên mặt trước CCCD
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Chụp rõ nét, không lóa sáng
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent pointer-events-none"></div>

              {/* Top Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface font-bold shadow-sm">
                  Mặt trước CCCD
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px]">check</span> OCR 100%
                </span>
              </div>

              {/* Bottom Overlay Controls */}
              <div className="relative z-10 flex items-center justify-between text-on-primary">
                <span className="font-label-sm text-label-sm text-on-primary/90 font-mono">
                  {data.idNumber || "079095012849"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Thay đổi
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                check_circle
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Ảnh rõ 4 góc, chip nhận dạng sắc nét
              </span>
            </div>
          </div>

          {/* Back ID Card */}
          <div className="flex flex-col gap-space-xs">
            <input
              type="file"
              ref={backInputRef}
              onChange={handleBackUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-surface-container flex flex-col justify-between p-3 group border border-dashed border-outline-variant">
              {data.backCardUrl ? (
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={data.backCardUrl}
                  alt="Mặt sau CCCD"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="material-symbols-outlined text-[36px] text-primary mb-1">
                    qr_code_scanner
                  </span>
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Tải lên mặt sau CCCD
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Quét rõ mã MRZ &amp; vân tay
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent pointer-events-none"></div>

              {/* Top Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-surface-container-lowest/90 backdrop-blur-md font-label-sm text-label-sm text-on-surface font-bold shadow-sm">
                  Mặt sau CCCD
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px]">qr_code_2</span> Đã quét MRZ
                </span>
              </div>

              {/* Bottom Overlay Controls */}
              <div className="relative z-10 flex items-center justify-between text-on-primary">
                <span className="font-label-sm text-label-sm text-on-primary/90 font-mono">
                  MRZ: OK
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-sm hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    Thay đổi
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                check_circle
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Không chói sáng, mã MRZ hoàn chỉnh
              </span>
            </div>
          </div>
        </div>

        {/* Upload Guidelines Helper Micro-box */}
        <div className="mt-space-xs p-3 rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-medium text-on-surface">
            <span className="material-symbols-outlined text-[18px] text-primary">photo_camera</span>
            Tiêu chuẩn ảnh hợp lệ:
          </span>
          <div className="flex items-center gap-space-md flex-wrap">
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary">done</span> Giấy tờ gốc, còn hạn
            </span>
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary">done</span> Đầy đủ 4 góc thẻ
            </span>
            <span className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-secondary">done</span> Không chói flash
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Fields Form */}
      <div className="flex flex-col gap-space-md pt-space-xs">
        {/* Full Name & ID Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Họ và tên chủ sở hữu (theo CCCD) <span className="text-tertiary">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl text-on-surface font-label-md text-label-md uppercase font-semibold outline-none border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
                type="text"
                value={effectiveHolderName}
                onChange={(e) => onChange({ accountHolder: e.target.value })}
                placeholder="Nhập họ và tên theo CCCD (VD: NGUYEN VAN AN)"
              />
              <div className="absolute right-3 flex items-center gap-1 text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Khớp OCR
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tên cố định dùng để xác thực thụ hưởng ngân hàng
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Số Căn cước công dân (12 chữ số) <span className="text-tertiary">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 rounded-xl text-on-surface font-mono font-bold text-body-lg outline-none tracking-wider border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-outline"
                type="text"
                maxLength={12}
                value={data.idNumber}
                onChange={(e) => onChange({ idNumber: e.target.value })}
                placeholder="Nhập 12 số CCCD (VD: 079095012849)"
              />
              <div className="absolute right-3 flex items-center gap-1 text-secondary">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-secondary font-medium">
              Định danh xác thực quốc gia: Hợp lệ
            </span>
          </div>
        </div>

        {/* Issue Date & Issue Place */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Ngày cấp <span className="text-tertiary">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                calendar_today
              </span>
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 pl-10 rounded-xl text-on-surface shadow-sm border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-outline"
                type="text"
                value={data.issueDate}
                onChange={(e) => onChange({ issueDate: e.target.value })}
                placeholder="DD/MM/YYYY (VD: 12/04/2021)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Nơi cấp <span className="text-tertiary">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                account_balance
              </span>
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 pl-10 rounded-xl text-on-surface shadow-sm border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-outline"
                type="text"
                value={data.issuePlace}
                onChange={(e) => onChange({ issuePlace: e.target.value })}
                placeholder="Nhập nơi cấp (VD: Cục Cảnh sát QLHC về TTXH)"
              />
            </div>
          </div>
        </div>

        {/* Personal Tax ID (MST) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Mã số thuế cá nhân (MST)
              <span className="text-on-surface-variant font-normal font-body-sm text-body-sm">
                (Không bắt buộc nhưng khuyến nghị)
              </span>
            </label>
            <span className="font-body-sm text-body-sm text-secondary font-medium">
              Khấu trừ TNCN tự động theo Thông tư 40
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
              receipt_long
            </span>
            <input
              className="w-full bg-surface-container-lowest px-4 py-3 pl-10 pr-48 rounded-xl text-on-surface font-mono shadow-sm border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-outline"
              placeholder="Nhập 10 chữ số mã số thuế (VD: 8492019481)"
              type="text"
              value={data.taxCode || ""}
              onChange={(e) => onChange({ taxCode: e.target.value })}
            />
            <span className="absolute right-3 px-2 py-1 rounded bg-secondary-fixed text-on-secondary-container font-label-sm text-label-sm font-semibold">
              Tra cứu thuế: Đang hoạt động
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Khi cung cấp MST cá nhân, sàn sẽ hỗ trợ tự động kê khai thuế quý và cấp chứng từ khấu trừ thuế TNCN hợp pháp.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step3LegalKycCard;
