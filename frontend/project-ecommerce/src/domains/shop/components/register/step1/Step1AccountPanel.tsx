import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { SellerAccountData } from "@/domains/shop/types/registerShop.types";
import type { User } from "@/domains/auth/types/auth.types";

export interface Step1AccountPanelProps {
  data: SellerAccountData;
  onChange: (fields: Partial<SellerAccountData>) => void;
  user?: User | null;
}

export const Step1AccountPanel: React.FC<Step1AccountPanelProps> = ({
  data,
  onChange,
  user,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Yếu", color: "bg-error text-error" };
    if (score <= 2) return { score: 2, label: "Trung bình", color: "bg-amber-500 text-amber-600" };
    if (score === 3) return { score: 3, label: "Khá mạnh", color: "bg-primary text-primary" };
    return { score: 4, label: "Rất mạnh", color: "bg-emerald-500 text-emerald-600" };
  };

  const strength = calculatePasswordStrength(data.password);
  const passwordsMatch = Boolean(
    data.password && data.confirmPassword && data.password === data.confirmPassword
  );
  const passwordsMismatch = Boolean(
    data.confirmPassword && data.password !== data.confirmPassword
  );

  return (
    <div className="flex flex-col gap-space-lg w-full" id="step-panel-1">
      {/* Intro Context Banner */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
            <span className="material-symbols-outlined text-[18px]">person_pin</span>
            <span>Bước 1 / 4: Thiết lập tài khoản</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
            {user ? "Tài khoản mở gian hàng" : "Tạo tài khoản Người bán mới"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {user
              ? "Bạn đang sử dụng tài khoản hiện tại để đăng ký bán hàng. Quyền SELLER sẽ được cấp tự động sau khi hồ sơ được duyệt."
              : "Một tài khoản duy nhất trên MarketPulse dùng cho cả mua sắm và quản lý bán hàng đa kênh. Đăng ký hoàn toàn miễn phí."}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/30 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-bold text-on-surface">Bảo mật đa lớp</span>
            <span className="text-xs text-on-surface-variant">Mã hóa 256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Main Account Form Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10 border border-outline-variant/30 flex flex-col gap-6">
        {user ? (
          /* Case 1: Already Logged In User */
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">account_circle</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  1. Thông tin tài khoản chủ shop
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Hệ thống sẽ liên kết hồ sơ gian hàng trực tiếp với tài khoản này
                </p>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary font-bold text-2xl flex items-center justify-center shadow-xs shrink-0 uppercase">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {user.full_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>Đã đăng nhập</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant font-mono">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">mail</span>
                      {user.email || "Chưa cập nhật email"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">phone</span>
                      {user.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1 text-xs text-on-surface-variant">
                <span className="font-medium text-outline">Vai trò hiện tại:</span>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-primary font-bold shadow-2xs border border-outline-variant/20 uppercase">
                  {user.roles?.join(" • ") || user.role || "CUSTOMER"}
                </span>
              </div>
            </div>

            {/* Explanatory Multi-Role Note */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
                info
              </span>
              <div className="flex flex-col gap-1 text-body-sm text-on-surface">
                <span className="font-bold">Cơ chế tài khoản đa vai trò MarketPulse:</span>
                <p className="text-on-surface-variant leading-relaxed">
                  Bạn không cần tạo tài khoản riêng cho người bán. Sau khi hồ sơ mở shop được duyệt, tài khoản này sẽ được bổ sung vai trò <strong>SELLER</strong> để quản lý gian hàng và vẫn giữ trọn vẹn lịch sử mua sắm cùng giỏ hàng hiện tại.
                </p>
              </div>
            </div>

            <p className="text-body-sm text-on-surface-variant text-right">
              Muốn đăng ký bằng tài khoản khác?{" "}
              <Link
                to="/login"
                state={{ from: { pathname: "/register-open-shop" } }}
                className="text-primary font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Đổi tài khoản đăng nhập</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </p>
          </div>
        ) : (
          /* Case 2: Guest User - Complete Registration Form */
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                    1. Thông tin tài khoản chủ gian hàng
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Điền thông tin chính xác để kích hoạt tài khoản quản trị Seller Center
                  </p>
                </div>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                <span className="text-error font-bold">*</span>
                <span>Thông tin bắt buộc</span>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Họ và tên */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span>Họ và tên chủ tài khoản</span>
                  <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px] pointer-events-none">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={data.fullName}
                    onChange={(e) => onChange({ fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-sm border border-outline-variant/40 outline-none transition-all placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)]"
                  />
                  {data.fullName.trim().length >= 3 && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                      check_circle
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  Họ và tên ghi đúng theo CCCD/Hộ chiếu người đại diện shop.
                </span>
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span>Số điện thoại liên hệ</span>
                  <span className="text-error font-bold">*</span>
                </label>
                <div className="flex relative">
                  <div className="flex items-center px-3.5 rounded-l-xl bg-surface-container-high text-on-surface font-mono font-bold text-sm border-y border-l border-outline-variant/40 shrink-0">
                    +84
                  </div>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={data.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    placeholder="0909 123 456"
                    className="w-full h-12 px-3.5 pr-10 rounded-r-xl bg-surface-container-lowest text-on-surface font-mono text-sm border border-outline-variant/40 outline-none transition-all placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)]"
                  />
                  {data.phone.trim().length >= 9 && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                      check_circle
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant">
                  Dùng để xác thực OTP và liên hệ điều phối lấy hàng.
                </span>
              </div>

              {/* Email đăng nhập */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span>Email đăng nhập &amp; nhận thông báo</span>
                  <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px] pointer-events-none">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                    placeholder="seller@example.com"
                    className="w-full h-12 pl-11 pr-10 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-sm border border-outline-variant/40 outline-none transition-all placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)]"
                  />
                  {data.email.includes("@") && data.email.includes(".") && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg flex items-start gap-2 mt-0.5">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    Email dùng để đăng nhập Seller Center, nhận thông báo đơn hàng mới, đối soát doanh thu và hợp đồng số.
                  </span>
                </p>
              </div>

              {/* Mật khẩu */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span>Mật khẩu đăng nhập</span>
                  <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(e) => onChange({ password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-sm border border-outline-variant/40 outline-none transition-all placeholder:text-outline focus:border-primary focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer transition-colors"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Password strength progress bar */}
                {data.password ? (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength.score >= 1 ? strength.color.split(" ")[0] : "bg-surface-container-high"
                        }`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength.score >= 2 ? strength.color.split(" ")[0] : "bg-surface-container-high"
                        }`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength.score >= 3 ? strength.color.split(" ")[0] : "bg-surface-container-high"
                        }`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          strength.score >= 4 ? strength.color.split(" ")[0] : "bg-surface-container-high"
                        }`}
                      />
                      <span className={`text-[11px] font-bold ml-1 ${strength.color.split(" ")[1]}`}>
                        {strength.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số.
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    Tối thiểu 8 ký tự, gồm chữ cái và chữ số.
                  </span>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
                  <span>Xác nhận mật khẩu</span>
                  <span className="text-error font-bold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[20px] pointer-events-none">
                    lock_reset
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={data.confirmPassword}
                    onChange={(e) => onChange({ confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className={`w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-sm border outline-none transition-all placeholder:text-outline focus:shadow-[0_0_0_3px_rgba(67,56,202,0.18)] ${
                      passwordsMismatch
                        ? "border-error focus:border-error"
                        : passwordsMatch
                        ? "border-secondary focus:border-secondary"
                        : "border-outline-variant/40 focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer transition-colors"
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Match feedback */}
                {data.confirmPassword ? (
                  passwordsMatch ? (
                    <span className="text-xs text-secondary font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">done</span>
                      <span>Mật khẩu xác nhận trùng khớp</span>
                    </span>
                  ) : (
                    <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">close</span>
                      <span>Mật khẩu xác nhận chưa khớp</span>
                    </span>
                  )
                ) : (
                  <span className="text-xs text-on-surface-variant mt-0.5">
                    Nhập lại mật khẩu giống ô phía trước.
                  </span>
                )}
              </div>

              {/* Điều khoản thỏa thuận Checkbox */}
              <div className="md:col-span-2 pt-2">
                <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={data.agreeTerms}
                    onChange={(e) => onChange({ agreeTerms: e.target.checked })}
                    className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary mt-0.5 shrink-0"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                    Tôi cam kết thông tin cung cấp là chính xác và đồng ý với{" "}
                    <button type="button" className="text-primary font-bold hover:underline cursor-pointer">
                      Điều khoản dịch vụ
                    </button>{" "}
                    cùng{" "}
                    <button type="button" className="text-primary font-bold hover:underline cursor-pointer">
                      Chính sách bảo mật cho Người bán
                    </button>{" "}
                    của sàn thương mại điện tử MarketPulse.
                  </span>
                </label>
              </div>

              {/* Bottom login switcher */}
              <div className="md:col-span-2 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    account_box
                  </span>
                  <span>Bạn đã có tài khoản trên MarketPulse?</span>
                </div>
                <Link
                  to="/login"
                  state={{ from: { pathname: "/register-open-shop" } }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-xs font-bold transition-all border border-outline-variant/30"
                >
                  <span>Đăng nhập ngay</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1AccountPanel;
