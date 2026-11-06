import React, { useState } from "react";
import type { SellerAccountData } from "@/shared/types";

interface Step1AccountPanelProps {
  data: SellerAccountData;
  onChange: (fields: Partial<SellerAccountData>) => void;
}

export const Step1AccountPanel: React.FC<Step1AccountPanelProps> = ({
  data,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordsMatch =
    Boolean(data.password && data.confirmPassword && data.password === data.confirmPassword);

  return (
    <div className="space-y-space-lg" id="step-panel-1">
      {/* Header section */}
      <div className="border-b-0 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-2">
          <span className="material-symbols-outlined text-[15px]">person_add</span>
          <span>Thiết lập tài khoản người bán</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface font-bold">
          Đăng ký tài khoản Người bán mới
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Tạo tài khoản quản trị Seller Center để bắt đầu thiết lập gian hàng và kinh doanh trên MarketPulse.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="p-6 bg-surface-container-low rounded-xl space-y-space-md">
        <div className="flex items-center justify-between pb-2 border-b-0">
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            Thông tin tài khoản quản trị
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Họ và tên chủ tài khoản *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                placeholder="VD: Nguyễn Văn An"
                type="text"
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
              />
              <span className="absolute left-3 top-3.5 material-symbols-outlined text-outline text-[20px]">
                person
              </span>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Số điện thoại liên hệ *
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-lg bg-surface-container-highest text-on-surface font-mono font-semibold text-body-md flex-shrink-0">
                +84
              </div>
              <div className="relative flex-1">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="909 123 456"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1 md:col-span-2">
            <label className="font-label-md text-label-md text-on-surface block">
              Email đăng nhập &amp; nhận thông báo *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                placeholder="seller@example.com"
                type="email"
                value={data.email}
                onChange={(e) => onChange({ email: e.target.value })}
              />
              <span className="absolute left-3 top-3.5 material-symbols-outlined text-outline text-[20px]">
                mail
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Dùng để đăng nhập Seller Center, nhận thông báo đơn hàng và hợp đồng số.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Mật khẩu đăng nhập *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary pr-10 pl-10"
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => onChange({ password: e.target.value })}
              />
              <span className="absolute left-3 top-3.5 material-symbols-outlined text-outline text-[20px]">
                lock
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-outline hover:text-on-surface cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {data.password ? (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      data.password.length >= 4 ? "bg-secondary" : "bg-surface-container-highest"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      data.password.length >= 6 ? "bg-secondary" : "bg-surface-container-highest"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      data.password.length >= 8 ? "bg-secondary" : "bg-surface-container-highest"
                    }`}
                  ></div>
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      data.password.length >= 8 && /[A-Z]/.test(data.password) && /[0-9]/.test(data.password)
                        ? "bg-secondary"
                        : "bg-surface-container-highest"
                    }`}
                  ></div>
                  <span className="text-[11px] font-label-sm text-secondary font-bold">
                    {data.password.length >= 8 && /[A-Z]/.test(data.password) && /[0-9]/.test(data.password)
                      ? "Mạnh"
                      : data.password.length >= 6
                      ? "Trung bình"
                      : "Yếu"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.
                </p>
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                Tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface block">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary pr-10 pl-10"
                placeholder="••••••••••••"
                type={showPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => onChange({ confirmPassword: e.target.value })}
              />
              <span className="absolute left-3 top-3.5 material-symbols-outlined text-outline text-[20px]">
                lock_reset
              </span>
              {passwordsMatch && (
                <span className="absolute right-3 top-3.5 material-symbols-outlined text-secondary text-[20px]">
                  check_circle
                </span>
              )}
            </div>
            {data.confirmPassword && (
              passwordsMatch ? (
                <p className="font-body-sm text-body-sm text-secondary font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">done</span> Mật khẩu khớp hoàn toàn
                </p>
              ) : (
                <p className="font-body-sm text-body-sm text-error font-medium mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">close</span> Mật khẩu chưa trùng khớp
                </p>
              )
            )}
          </div>
        </div>

        {/* Terms agreement checkbox */}
        <div className="pt-4 border-t-0">
          <label className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-container-lowest cursor-pointer hover:bg-surface-container transition-colors">
            <input
              checked={data.agreeTerms}
              onChange={(e) => onChange({ agreeTerms: e.target.checked })}
              className="w-5 h-5 rounded text-primary focus:ring-0 cursor-pointer accent-primary mt-0.5"
              type="checkbox"
            />
            <span className="font-body-md text-body-md text-on-surface leading-normal">
              Tôi đồng ý với{" "}
              <button type="button" className="text-primary font-semibold hover:underline cursor-pointer">
                Điều khoản dịch vụ
              </button>{" "}
              và{" "}
              <button type="button" className="text-primary font-semibold hover:underline cursor-pointer">
                Chính sách quyền riêng tư
              </button>{" "}
              dành cho Người bán của MarketPulse.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step1AccountPanel;

