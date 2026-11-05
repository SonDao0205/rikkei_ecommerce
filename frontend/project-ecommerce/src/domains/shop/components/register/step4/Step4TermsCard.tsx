import React from "react";

export interface Step4TermsState {
  authVerified: boolean;
  platformRules: boolean;
  antiCounterfeit: boolean;
}

interface Step4TermsCardProps {
  terms: Step4TermsState;
  onChange: (key: keyof Step4TermsState, value: boolean) => void;
}

export const Step4TermsCard: React.FC<Step4TermsCardProps> = ({ terms, onChange }) => {
  return (
    <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md border border-outline-variant/30">
      <div className="flex items-center gap-space-sm pb-space-xs border-b border-outline-variant/20">
        <span className="w-7 h-7 rounded-full bg-primary-fixed text-primary font-label-md text-label-md flex items-center justify-center font-bold">
          4
        </span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
          Điều khoản &amp; Cam kết tuân thủ sàn TMĐT
        </h2>
      </div>

      <div className="flex flex-col gap-space-md">
        {/* Checkbox 1 */}
        <label className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-outline-variant/20">
          <input
            type="checkbox"
            checked={terms.authVerified}
            onChange={(e) => onChange("authVerified", e.target.checked)}
            className="mt-1 w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
          />
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Cam kết tính xác thực của thông tin cung cấp
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tôi xác nhận tất cả thông tin khai báo trên là hoàn toàn chính xác, trung thực và thuộc quyền sở hữu hợp pháp của tôi. Chịu mọi trách nhiệm pháp lý nếu phát hiện hành vi gian lận hồ sơ.
            </span>
          </div>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-outline-variant/20">
          <input
            type="checkbox"
            checked={terms.platformRules}
            onChange={(e) => onChange("platformRules", e.target.checked)}
            className="mt-1 w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
          />
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Đồng ý quy chế hoạt động, bảo mật và chính sách phí sàn
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tôi đã đọc, hiểu rõ và đồng ý với{" "}
              <span className="text-primary underline cursor-pointer">Quy chế hoạt động sàn</span>,{" "}
              <span className="text-primary underline cursor-pointer">Chính sách bảo mật dữ liệu khách hàng</span>, và{" "}
              <span className="text-primary underline cursor-pointer">Biểu phí hoa hồng người bán MarketPulse 2025</span>.
            </span>
          </div>
        </label>

        {/* Checkbox 3 */}
        <label className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer select-none border border-outline-variant/20">
          <input
            type="checkbox"
            checked={terms.antiCounterfeit}
            onChange={(e) => onChange("antiCounterfeit", e.target.checked)}
            className="mt-1 w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
          />
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-surface font-bold">
              Chính sách chống hàng giả, hàng nhái &amp; Hàng cấm lưu hành
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Cam kết 100% hàng hóa kinh doanh là hàng chính hãng, có nguồn gốc xuất xứ rõ ràng; tuyệt đối không kinh doanh hàng giả, hàng nhái hoặc các mặt hàng cấm theo Pháp luật Việt Nam.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default Step4TermsCard;
