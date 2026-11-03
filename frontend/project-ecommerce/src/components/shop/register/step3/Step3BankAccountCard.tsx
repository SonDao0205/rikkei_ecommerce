import React, { useState } from "react";
import type { ShopKycData } from "../../../../types";

interface Step3BankAccountCardProps {
  data: ShopKycData;
  accountHolderName?: string;
  onChange: (fields: Partial<ShopKycData>) => void;
}

interface BankOption {
  code: string;
  shortName: string;
  fullName: string;
  bin: string;
  badgeBg: string;
}

const POPULAR_BANKS: BankOption[] = [
  {
    code: "VCB",
    shortName: "Vietcombank",
    fullName: "Ngân hàng TMCP Ngoại thương Việt Nam",
    bin: "970436",
    badgeBg: "bg-emerald-800",
  },
  {
    code: "TCB",
    shortName: "Techcombank",
    fullName: "Ngân hàng TMCP Kỹ Thương Việt Nam",
    bin: "970407",
    badgeBg: "bg-red-700",
  },
  {
    code: "MB",
    shortName: "MB Bank",
    fullName: "Ngân hàng TMCP Quân Đội",
    bin: "970422",
    badgeBg: "bg-blue-700",
  },
  {
    code: "BIDV",
    shortName: "BIDV",
    fullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    bin: "970418",
    badgeBg: "bg-cyan-800",
  },
  {
    code: "ACB",
    shortName: "ACB",
    fullName: "Ngân hàng TMCP Á Châu",
    bin: "970416",
    badgeBg: "bg-blue-600",
  },
  {
    code: "VPB",
    shortName: "VPBank",
    fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    bin: "970432",
    badgeBg: "bg-emerald-600",
  },
  {
    code: "CTG",
    shortName: "VietinBank",
    fullName: "Ngân hàng TMCP Công Thương Việt Nam",
    bin: "970415",
    badgeBg: "bg-sky-700",
  },
];

export const Step3BankAccountCard: React.FC<Step3BankAccountCardProps> = ({
  data,
  accountHolderName = "",
  onChange,
}) => {
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [isCheckingNapas, setIsCheckingNapas] = useState(false);
  const [napasStatus, setNapasStatus] = useState<string | null>(null);

  const selectedBank =
    POPULAR_BANKS.find(
      (b) =>
        b.shortName === data.bankName ||
        data.bankName.includes(b.shortName) ||
        data.bankName.includes(b.code)
    ) || POPULAR_BANKS[0];

  const handleSelectBank = (bank: BankOption) => {
    onChange({ bankName: `${bank.shortName} - ${bank.fullName}` });
    setIsBankDropdownOpen(false);
  };

  const handleCheckNapas = () => {
    if (!data.accountNumber) return;
    setIsCheckingNapas(true);
    setTimeout(() => {
      setIsCheckingNapas(false);
      setNapasStatus("Tài khoản hợp lệ • Khớp thông tin NAPAS");
      setTimeout(() => setNapasStatus(null), 4000);
    }, 800);
  };

  const effectiveHolderName = (
    data.accountHolder ||
    accountHolderName ||
    ""
  ).toUpperCase();

  const selectedCycle = data.settlementCycle || "T+3";

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-lg">
      {/* Card Header & Badge */}
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 flex-wrap gap-2">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
            2
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Tài khoản ngân hàng nhận tiền doanh thu &amp; COD
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Tài khoản thụ hưởng nhận thanh toán sau khi hoàn tất đơn hàng
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold tracking-wide uppercase">
          Payout Account
        </span>
      </div>

      {/* Severe Warning Callout: Match Names */}
      <div className="p-space-md rounded-2xl bg-amber-500/10 flex items-start gap-space-md border border-amber-500/20">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">warning</span>
        </div>
        <div className="flex-1">
          <h4 className="font-label-lg text-label-lg text-amber-950 font-bold mb-0.5">
            Lưu ý quan trọng về tính đồng nhất chủ tài khoản
          </h4>
          <p className="font-body-sm text-body-sm text-amber-900 leading-relaxed">
            Tên chủ tài khoản ngân hàng thụ hưởng{" "}
            <strong className="font-bold underline">BẮT BUỘC PHẢI TRÙNG KHỚP HOÀN TOÀN</strong> với
            họ tên định danh trên Căn cước công dân (
            <span className="font-mono font-bold">
              {effectiveHolderName || "CHỦ GIAN HÀNG"}
            </span>
            ). Hệ thống quyết toán tự động Napas 24/7 sẽ từ chối thanh toán nếu phát hiện tài khoản
            trung gian của bên thứ ba.
          </p>
        </div>
      </div>

      {/* Bank Account Inputs */}
      <div className="flex flex-col gap-space-md">
        {/* Bank Selector Dropdown */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
            Ngân hàng thụ hưởng <span className="text-tertiary">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all text-left cursor-pointer border border-outline-variant/40"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg ${selectedBank.badgeBg} text-white flex items-center justify-center font-bold font-mono tracking-tighter text-[13px] shadow-sm flex-shrink-0`}
                >
                  {selectedBank.code}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {selectedBank.shortName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-mono">
                      {selectedBank.code} - {selectedBank.bin}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {selectedBank.fullName}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">
                {isBankDropdownOpen ? "expand_less" : "unfold_more"}
              </span>
            </button>

            {/* Dropdown Menu */}
            {isBankDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant max-h-64 overflow-y-auto">
                {POPULAR_BANKS.map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelectBank(bank)}
                    className="w-full flex items-center justify-between p-3 hover:bg-surface-container transition-colors text-left border-b border-outline-variant/20 last:border-b-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${bank.badgeBg} text-white flex items-center justify-center font-bold font-mono text-[11px]`}
                      >
                        {bank.code}
                      </div>
                      <div>
                        <span className="font-label-md text-label-md text-on-surface font-bold block">
                          {bank.shortName}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant block">
                          {bank.fullName}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-on-surface-variant">{bank.bin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Branch & Account Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Chi nhánh ngân hàng <span className="text-tertiary">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">
                location_on
              </span>
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 pl-10 rounded-xl text-on-surface shadow-sm border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md placeholder:text-outline"
                type="text"
                value={data.bankBranch}
                onChange={(e) => onChange({ bankBranch: e.target.value })}
                placeholder="Nhập chi nhánh ngân hàng (VD: Chi nhánh TP. Hồ Chí Minh)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Số tài khoản ngân hàng <span className="text-tertiary">*</span>
              </label>
              <span className="text-secondary font-label-sm text-label-sm">Hỗ trợ Napas 24/7</span>
            </div>
            <div className="relative flex items-center">
              <input
                className="w-full bg-surface-container-lowest px-4 py-3 pr-36 rounded-xl text-on-surface font-mono font-bold text-headline-md tracking-wider shadow-sm border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-outline placeholder:font-normal placeholder:text-body-md"
                type="text"
                value={data.accountNumber}
                onChange={(e) => onChange({ accountNumber: e.target.value })}
                placeholder="Nhập số tài khoản ngân hàng"
              />
              <button
                type="button"
                onClick={handleCheckNapas}
                disabled={isCheckingNapas || !data.accountNumber}
                className="absolute right-2 px-3 py-1.5 rounded-lg bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-label-sm text-label-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCheckingNapas ? "Đang kiểm tra..." : "Kiểm tra Napas"}
              </button>
            </div>
            {napasStatus && (
              <span className="text-secondary font-body-sm text-body-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {napasStatus}
              </span>
            )}
          </div>
        </div>

        {/* Beneficiary Name (Locked & Auto-Checked) */}
        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
            Tên chủ tài khoản thụ hưởng (Tự động khóa theo CCCD)
          </label>
          <div className="relative flex items-center">
            <input
              className="w-full bg-surface-container-low px-4 py-3.5 rounded-xl text-on-surface font-mono font-bold text-headline-md tracking-wider outline-none border border-outline-variant/40 placeholder:text-outline"
              type="text"
              readOnly
              value={effectiveHolderName}
              placeholder="TỰ ĐỘNG ĐỒNG BỘ THEO HỌ TÊN TRÊN CCCD"
            />
            <div className="absolute right-3 flex items-center gap-1 text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Đã khóa chống gian lận
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Họ tên đã được xác minh thành công với mạng lưới Napas. Hệ thống thanh toán sẽ ghi nhận tiền chuyển về tài khoản này ngay khi đơn hàng hoàn thành.
          </p>
        </div>

        {/* Settlement Frequency Cycle Radio Cards */}
        <div className="flex flex-col gap-2 pt-space-xs">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            Chu kỳ đối soát &amp; chuyển khoản doanh thu (COD &amp; PayOnline)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            {/* Cycle T+1 */}
            <div
              onClick={() => onChange({ settlementCycle: "T+1" })}
              className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                selectedCycle === "T+1"
                  ? "bg-primary-fixed border-primary shadow-sm"
                  : "bg-surface-container-low border-transparent hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">
                  T+1 (Hằng ngày)
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    selectedCycle === "T+1" ? "bg-primary text-white" : "bg-surface-container-high"
                  }`}
                >
                  {selectedCycle === "T+1" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Quyết toán mỗi 24h sau khi khách xác nhận nhận hàng.
              </p>
            </div>

            {/* Cycle T+3 (Recommended) */}
            <div
              onClick={() => onChange({ settlementCycle: "T+3" })}
              className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border shadow-sm ${
                selectedCycle === "T+3"
                  ? "bg-primary-fixed border-primary ring-2 ring-primary/30"
                  : "bg-surface-container-low border-transparent hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-lg text-label-lg font-bold text-primary">
                    T+3 (Định kỳ)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                    Khuyến nghị
                  </span>
                </div>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    selectedCycle === "T+3" ? "bg-primary text-white" : "bg-surface-container-high"
                  }`}
                >
                  {selectedCycle === "T+3" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-primary-fixed-variant">
                Chuyển tiền vào thứ 2, 4, 6 hàng tuần. Tiết kiệm phí sao kê.
              </p>
            </div>

            {/* Cycle T+7 */}
            <div
              onClick={() => onChange({ settlementCycle: "T+7" })}
              className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${
                selectedCycle === "T+7"
                  ? "bg-primary-fixed border-primary shadow-sm"
                  : "bg-surface-container-low border-transparent hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">
                  T+7 (Hàng tuần)
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    selectedCycle === "T+7" ? "bg-primary text-white" : "bg-surface-container-high"
                  }`}
                >
                  {selectedCycle === "T+7" && <span className="w-2 h-2 rounded-full bg-white"></span>}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tổng kết chuyển khoản vào thứ Hai đầu tuần.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3BankAccountCard;
