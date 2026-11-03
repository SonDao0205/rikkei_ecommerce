import React from "react";
import { Link } from "react-router-dom";
import type { ShopKycData } from "../../../../types";

interface Step4KycCardProps {
  kyc: ShopKycData;
  accountHolderName?: string;
}

export const Step4KycCard: React.FC<Step4KycCardProps> = ({
  kyc,
  accountHolderName = "Nguyễn Văn An",
}) => {
  return (
    <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-space-sm">
          <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-label-md text-label-md flex items-center justify-center font-bold">
            3
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Định danh pháp lý eKYC &amp; Tài khoản nhận tiền (Payout)
          </h2>
        </div>
        <Link
          to="/register-open-shop/step3"
          className="px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Chỉnh sửa (Bước 3)</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* KYC Details */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
              Dữ liệu Căn cước công dân (CCCD)
            </span>
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold shadow-xs">
              OCR 100% Hợp lệ
            </span>
          </div>

          <div className="flex justify-between items-center mt-2 border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Số thẻ định danh:
            </span>
            <span className="font-label-lg text-label-lg text-on-surface font-bold tracking-wider font-mono">
              {kyc.idNumber || "079095012849"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Họ tên trên thẻ:
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold uppercase">
              {kyc.accountHolder || accountHolderName}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Xác thực khuôn mặt &amp; MRZ:
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">face</span>
              AI Liveness 99.2% Khớp
            </span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Mã số thuế cá nhân:
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold font-mono">
              {kyc.taxCode || "8492019481"}{" "}
              <span className="text-secondary text-[11px] font-normal">(Đang hoạt động)</span>
            </span>
          </div>
        </div>

        {/* Bank Payout Details */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                account_balance
              </span>
              Tài khoản nhận tiền (Payout)
            </span>
            <span className="font-label-sm text-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold shadow-xs">
              Napas 24/7 Checked
            </span>
          </div>

          <div className="flex justify-between items-center mt-2 border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Ngân hàng thụ hưởng:
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold">
              {kyc.bankName || "Vietcombank (Ngoại Thương)"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Số tài khoản:
            </span>
            <span className="font-label-lg text-label-lg text-primary font-bold font-mono tracking-wider">
              {kyc.accountNumber || "1029384756"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-outline-variant/20 pb-1.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tên chủ tài khoản:
            </span>
            <span className="font-label-md text-label-md text-on-surface font-bold uppercase">
              {kyc.accountHolder || accountHolderName}{" "}
              <span className="text-secondary text-[11px]">✓ Trùng 100%</span>
            </span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Chu kỳ thanh toán đối soát:
            </span>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              {kyc.settlementCycle || "T+3"} (Thứ 2, 4, 6 hằng tuần)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4KycCard;
