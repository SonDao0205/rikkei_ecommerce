import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  resetPasswordWithToken,
  clearPasswordResetState,
} from "../../redux/slices/authSlice";

interface ForgotPasswordStep3Props {
  onBack: () => void;
  onSuccess?: () => void;
}

export const ForgotPasswordStep3 = ({
  onBack,
  onSuccess,
}: ForgotPasswordStep3Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    resetPasswordSession,
    resetToken,
    resetPasswordLoading,
    resetPasswordError,
  } = useAppSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccessFinished, setIsSuccessFinished] = useState(false);

  // 4 Criteria checks
  const criteria = {
    length: newPassword.length >= 10,
    cases: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const metCount = Object.values(criteria).filter(Boolean).length;

  const getStrengthInfo = () => {
    if (!newPassword || newPassword.length === 0) {
      return { text: "Chưa nhập", color: "text-slate-400", level: 0 };
    }
    if (newPassword.length < 6 || metCount <= 1) {
      return { text: "Yếu", color: "text-red-500", level: 1 };
    }
    switch (metCount) {
      case 2:
        return { text: "Trung bình", color: "text-orange-500", level: 2 };
      case 3:
        return { text: "Mạnh", color: "text-indigo-600", level: 3 };
      case 4:
      default:
        return { text: "Rất mạnh (Khuyên dùng)", color: "text-emerald-600", level: 4 };
    }
  };

  const strength = getStrengthInfo();
  const isMatch = confirmPassword.length > 0 && confirmPassword === newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formError) setFormError(null);

    if (newPassword.length < 10) {
      setFormError("Mật khẩu mới phải có tối thiểu 10 ký tự và có cả chữ lẫn số.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Mật khẩu xác nhận không trùng khớp với mật khẩu mới.");
      return;
    }

    const identity = resetPasswordSession?.identity;
    if (!identity) {
      setFormError("Yêu cầu khôi phục đã hết. Hãy bắt đầu lại từ bước nhập email hoặc số điện thoại.");
      return;
    }
    const resultAction = await dispatch(
      resetPasswordWithToken({
        identity,
        resetToken: resetToken || undefined,
        newPassword,
      })
    );

    if (resetPasswordWithToken.fulfilled.match(resultAction)) {
      setIsSuccessFinished(true);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // If finished successfully, show success confirmation card
  if (isSuccessFinished) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl shadow-surface-tint/5 p-8 sm:p-12 flex flex-col items-center justify-center gap-6 border border-slate-100 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50/50">
          <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đổi mật khẩu thành công!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Mật khẩu mới của tài khoản MarketPulse đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới vừa tạo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full sm:w-auto min-w-[240px] py-3.5 px-8 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Đăng nhập ngay</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl shadow-surface-tint/5 p-6 sm:p-10 relative border border-slate-100 flex flex-col gap-6">
      {/* Header Badge */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/60 text-primary">
          <span className="material-symbols-outlined text-[16px]">shield_person</span>
          <span className="font-label-sm text-[11px] font-bold tracking-wider uppercase">
            MARKETPULSE ID • TRUNG TÂM PHỤC HỒI TÀI KHOẢN
          </span>
        </div>
      </div>

      {/* 3-Step Horizontal Stepper */}
      <div className="w-full px-2 sm:px-4">
        <div className="relative flex items-center justify-between">
          {/* Continuous Connecting Line */}
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-primary-container z-0" />

          {/* Step 1: Request (Completed) */}
          <div className="relative z-10 flex flex-col items-center text-center cursor-default">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm ring-4 ring-surface-container-lowest">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            </div>
            <div className="mt-2 flex flex-col items-center">
              <span className="font-label-md text-xs font-semibold text-on-surface">
                1. Yêu cầu mã
              </span>
              <span className="font-label-sm text-[11px] text-secondary font-medium">
                Đã xác minh
              </span>
            </div>
          </div>

          {/* Step 2: OTP (Completed) */}
          <button
            type="button"
            onClick={onBack}
            className="relative z-10 flex flex-col items-center text-center cursor-pointer group"
            title="Nhấn để quay lại bước 2"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm ring-4 ring-surface-container-lowest group-hover:brightness-110 transition-all">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            </div>
            <div className="mt-2 flex flex-col items-center">
              <span className="font-label-md text-xs font-semibold text-on-surface group-hover:text-primary">
                2. Xác thực OTP
              </span>
              <span className="font-label-sm text-[11px] text-secondary font-medium">
                Thành công
              </span>
            </div>
          </button>

          {/* Step 3: Reset (Active) */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_0_4px_rgba(67,56,202,0.2)] ring-4 ring-surface-container-lowest">
              <span className="font-label-lg text-sm font-bold">3</span>
            </div>
            <div className="mt-2 flex flex-col items-center">
              <span className="font-label-md text-xs font-bold text-primary">
                3. Đặt mật khẩu
              </span>
              <span className="font-label-sm text-[11px] text-primary font-medium">
                Mật khẩu mới
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title & Narrative */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>BƯỚC 3: THIẾT LẬP MẬT KHẨU MỚI</span>
        </div>
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-1 mb-2">
          Tạo mật khẩu mới
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Mật khẩu mới của bạn cần có độ phức tạp cao và khác với các mật khẩu đã từng sử dụng gần đây để bảo vệ tài khoản MarketPulse.
        </p>
      </div>

      {/* Global Error Banner */}
      {(formError || resetPasswordError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
            error
          </span>
          <span>{formError || resetPasswordError}</span>
        </div>
      )}

      {/* Form Elements */}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Field 1: New Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="font-label-lg text-xs font-semibold text-on-surface flex items-center gap-1"
              htmlFor="new-password"
            >
              <span>Mật khẩu mới</span>
              <span className="text-tertiary font-bold">*</span>
            </label>
            <span className="font-label-sm text-[11px] text-on-surface-variant" id="char-count">
              {newPassword.length} ký tự
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
              lock
            </span>
            <input
              id="new-password"
              name="newPassword"
              type={showPass1 ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formError) setFormError(null);
                if (resetPasswordError) dispatch(clearPasswordResetState());
              }}
              placeholder="Nhập mật khẩu mới (tối thiểu 10 ký tự)"
              className="w-full h-12 pl-11 pr-12 bg-surface-container-low rounded-xl text-on-surface font-body-md text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all shadow-inner"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass1(!showPass1)}
              className="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors p-1 flex items-center justify-center rounded-lg cursor-pointer"
              title={showPass1 ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPass1 ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Password Strength Indicator Meter */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                Độ mạnh mật khẩu:
              </span>
              <span className={`font-label-sm text-xs font-bold flex items-center gap-1 ${strength.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {strength.text}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`h-full rounded-full transition-all duration-300 ${
                    bar <= strength.level
                      ? strength.level <= 1
                        ? "bg-red-500"
                        : strength.level === 2
                        ? "bg-orange-400"
                        : "bg-primary-container"
                      : "bg-surface-container-high"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="bg-surface-container-low rounded-xl p-3.5 mt-2 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Rule 1: Length */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    criteria.length
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span
                  className={`font-body-sm font-medium transition-colors ${
                    criteria.length ? "text-on-surface" : "text-slate-400"
                  }`}
                >
                  Tối thiểu 10 ký tự trở lên
                </span>
              </div>

              {/* Rule 2: Upper and Lower case */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    criteria.cases
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span
                  className={`font-body-sm font-medium transition-colors ${
                    criteria.cases ? "text-on-surface" : "text-slate-400"
                  }`}
                >
                  Chữ hoa (A-Z) &amp; chữ thường (a-z)
                </span>
              </div>

              {/* Rule 3: Number */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    criteria.number
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span
                  className={`font-body-sm font-medium transition-colors ${
                    criteria.number ? "text-on-surface" : "text-slate-400"
                  }`}
                >
                  Có ít nhất một chữ số (0-9)
                </span>
              </div>

              {/* Rule 4: Special Char */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    criteria.special
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span
                  className={`font-body-sm font-medium transition-colors ${
                    criteria.special ? "text-on-surface" : "text-slate-400"
                  }`}
                >
                  Ký tự đặc biệt (!@#$%^&amp;*)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Field 2: Confirm Password */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label
              className="font-label-lg text-xs font-semibold text-on-surface flex items-center gap-1"
              htmlFor="confirm-password"
            >
              <span>Xác nhận mật khẩu mới</span>
              <span className="text-tertiary font-bold">*</span>
            </label>
          </div>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
              lock_reset
            </span>
            <input
              id="confirm-password"
              name="confirmPassword"
              type={showPass2 ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError(null);
                if (resetPasswordError) dispatch(clearPasswordResetState());
              }}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full h-12 pl-11 pr-20 bg-surface-container-low rounded-xl text-on-surface font-body-md text-sm placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container transition-all shadow-inner"
              required
            />
            <div className="absolute right-3 flex items-center gap-1">
              {isMatch && (
                <span
                  className="material-symbols-outlined text-secondary text-[20px]"
                  title="Mật khẩu trùng khớp"
                >
                  check_circle
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowPass2(!showPass2)}
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 flex items-center justify-center rounded-lg cursor-pointer"
                title={showPass2 ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPass2 ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={resetPasswordLoading || !isMatch || newPassword.length < 10}
            className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(67,56,202,0.25)] hover:shadow-[0_6px_20px_rgba(67,56,202,0.35)] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resetPasswordLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Đang cập nhật mật khẩu...</span>
              </>
            ) : (
              <>
                <span>Cập nhật mật khẩu &amp; Đăng nhập ngay</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordStep3;
