import React from "react";
import { Link } from "react-router-dom";
import type { ShopAccountData, ShopKycData } from "../../../../types";

interface Step4AccountCardProps {
  account: ShopAccountData;
  kyc: ShopKycData;
}

export const Step4AccountCard: React.FC<Step4AccountCardProps> = ({ account, kyc }) => {
  return (
    <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
        <div className="flex items-center gap-space-sm">
          <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-label-md text-label-md flex items-center justify-center font-bold">
            1
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Thông tin mô hình &amp; Tài khoản quản trị
          </h2>
        </div>
        <Link
          to="/register-open-shop"
          className="px-space-md py-space-xs rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md flex items-center gap-space-xs transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span>Chỉnh sửa (Bước 1)</span>
        </Link>
      </div>

      {/* Grid: 4 items (Loại hình gian hàng deleted, replaced by Thông tin ngân hàng at the end) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
        {/* 1. Họ và tên chủ sở hữu */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Họ và tên chủ sở hữu
          </span>
          <span className="font-label-lg text-label-lg text-on-surface font-bold">
            {account.fullName || "Nguyễn Văn An"}
          </span>
        </div>

        {/* 2. Số điện thoại đăng ký */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Số điện thoại đăng ký
          </span>
          <div className="flex items-center justify-between">
            <span className="font-label-lg text-label-lg text-on-surface font-bold tracking-wide">
              {account.phone || "0909 123 456"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded-full font-bold shadow-xs">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Đã xác thực OTP
            </span>
          </div>
        </div>

        {/* 3. Email quản trị thông báo */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Email quản trị thông báo
          </span>
          <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
            {account.email || "nguyen.vana@gmail.com"}
          </span>
        </div>

        {/* 4. Thông tin ngân hàng nhận tiền (Thêm vào cuối thay cho Loại hình gian hàng) */}
        <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-[16px]">account_balance</span>
              Thông tin ngân hàng nhận tiền
            </span>
            <span className="text-[11px] font-label-sm text-secondary bg-surface-container-lowest px-2 py-0.5 rounded font-bold shadow-xs">
              Napas 24/7
            </span>
          </div>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <div className="flex items-center gap-2">
              <span className="font-label-lg text-label-lg text-primary font-bold">
                {kyc.bankName || "Vietcombank"}
              </span>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="font-mono font-bold text-on-surface text-label-md">
                {kyc.accountNumber || "1029384756"}
              </span>
            </div>
            <div className="text-body-sm text-body-sm text-on-surface-variant truncate">
              Chủ TK: <strong className="text-on-surface uppercase font-medium">{kyc.accountHolder || account.fullName || "NGUYEN VAN AN"}</strong>
              {kyc.settlementCycle && (
                <span className="ml-2 text-primary font-semibold">({kyc.settlementCycle})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Partner Tier Proposal Callout */}
      <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary">workspace_premium</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Hạng đề xuất đối tác khởi tạo:
          </span>
          <span className="font-label-md text-label-md text-primary font-bold">
            Silver Partner Merchant (Cấp độ tiêu chuẩn)
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-xs">
          Cấp hạn ngạch 100 SKU
        </span>
      </div>
    </div>
  );
};

export default Step4AccountCard;
