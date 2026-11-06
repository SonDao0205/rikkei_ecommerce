import React from "react";
import type { ShopRegistrationFormData, ShopAgreementData } from "@/shared/types";

interface Step4ReviewPanelProps {
  formData: ShopRegistrationFormData;
  onJumpToStep: (step: number) => void;
  onAgreementChange: (fields: Partial<ShopAgreementData>) => void;
}

export const Step4ReviewPanel: React.FC<Step4ReviewPanelProps> = ({
  formData,
  onJumpToStep,
  onAgreementChange,
}) => {
  const { account, store, kyc, agreements } = formData;

  const maskedAccount = kyc.accountNumber
    ? (kyc.accountNumber.length > 5
        ? `STK: *******${kyc.accountNumber.slice(-5)}`
        : `STK: ${kyc.accountNumber}`)
    : "Chưa nhập STK";

  return (
    <div className="space-y-space-lg" id="step-panel-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-2">
          <span className="material-symbols-outlined text-[15px]">fact_check</span>
          <span>Tổng kết &amp; Cam kết quy chế</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
          Rà soát thông tin &amp; Gửi duyệt hồ sơ
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Vui lòng kiểm tra lại toàn bộ thông tin đăng ký gian hàng trước khi hoàn tất nộp hồ sơ.
        </p>
      </div>

      {/* Comprehensive Summary Pills Bento Grid */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
            Bản tóm tắt hồ sơ Merchant
          </h3>
          <button
            className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
            onClick={() => onJumpToStep(1)}
            type="button"
          >
            Chỉnh sửa bước 1
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
          {/* Card 1: Business model */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Mô hình kinh doanh
            </span>
            <p className="font-label-lg text-label-lg font-bold text-on-surface">
              Cá nhân / Hộ kinh doanh
            </p>
            <span className="text-[11px] text-primary">eKYC qua CCCD gắn chip</span>
          </div>

          {/* Card 2: Shop name */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Tên gian hàng
            </span>
            <p className="font-label-lg text-label-lg font-bold text-on-surface truncate">
              {store.shopName || "Chưa thiết lập"}
            </p>
            <span className="text-[11px] text-secondary truncate block">
              Ngành: {store.category}
            </span>
          </div>

          {/* Card 3: Owner */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Chủ sở hữu &amp; Đại diện
            </span>
            <p className="font-label-lg text-label-lg font-bold text-on-surface">
              {account.fullName || "Chưa thiết lập"}
            </p>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {account.phone || "Chưa có SĐT"}
            </span>
          </div>

          {/* Card 4: Warehouse */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Địa chỉ kho lấy hàng
            </span>
            <p className="font-label-lg text-label-lg font-bold text-on-surface truncate">
              {store.addressDetail || "Chưa thiết lập"}
            </p>
            <span className="text-[11px] text-on-surface-variant truncate block">
              {store.addressDetail
                ? `${store.ward}, ${store.district}, ${store.province}`
                : "Chưa nhập địa chỉ"}
            </span>
          </div>

          {/* Card 5: Bank account */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Tài khoản nhận doanh thu
            </span>
            <p className="font-label-lg text-label-lg font-bold text-on-surface truncate">
              {kyc.bankName ? kyc.bankName.split("-")[0].trim() : "Chưa chọn ngân hàng"}
            </p>
            <span className="text-[11px] text-on-surface font-mono">{maskedAccount}</span>
          </div>

          {/* Card 6: Review Time */}
          <div className="p-4 rounded-lg bg-surface-container-lowest space-y-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Thời gian xét duyệt
            </span>
            <p className="font-label-lg text-label-lg font-bold text-secondary">
              24 - 48 giờ làm việc
            </p>
            <span className="text-[11px] text-on-surface-variant">
              Thông báo qua Email &amp; SMS
            </span>
          </div>
        </div>
      </div>

      {/* Merchant Legal Compliance Checklist */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-4">
        <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
          Cam kết &amp; Điều khoản pháp lý
        </h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container transition-colors">
            <input
              checked={agreements.agreeServicePolicy}
              onChange={(e) =>
                onAgreementChange({ agreeServicePolicy: e.target.checked })
              }
              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary mt-0.5"
              type="checkbox"
            />
            <span className="font-body-md text-body-md text-on-surface leading-normal">
              Tôi đã đọc kỹ và hoàn toàn đồng ý với{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Điều khoản dịch vụ Nhà bán hàng
              </button>
              ,{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Quy chế hoạt động sàn Thương mại Điện tử MarketPulse
              </button>{" "}
              và{" "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline cursor-pointer"
              >
                Chính sách bảo mật thông tin
              </button>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container transition-colors">
            <input
              checked={agreements.agreeAuthenticCommitment}
              onChange={(e) =>
                onAgreementChange({ agreeAuthenticCommitment: e.target.checked })
              }
              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary mt-0.5"
              type="checkbox"
            />
            <span className="font-body-md text-body-md text-on-surface leading-normal">
              Cam kết 100% hàng hóa kinh doanh trên gian hàng là hàng chính hãng, có nguồn gốc
              xuất xứ rõ ràng, đầy đủ hóa đơn chứng từ hợp pháp, không kinh doanh hàng giả, hàng
              nhái hoặc các danh mục hàng hóa bị pháp luật nghiêm cấm.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container transition-colors">
            <input
              checked={agreements.agreeEkycConsent}
              onChange={(e) =>
                onAgreementChange({ agreeEkycConsent: e.target.checked })
              }
              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary mt-0.5"
              type="checkbox"
            />
            <span className="font-body-md text-body-md text-on-surface leading-normal">
              Đồng ý để MarketPulse sử dụng thông tin CCCD và tài khoản ngân hàng để thực hiện kiểm
              tra đối soát tự động eKYC phòng chống gian lận thương mại.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step4ReviewPanel;
