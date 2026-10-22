import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  sendPasswordResetOtp,
  clearPasswordResetState,
} from "../../redux/slices/authSlice";

interface ForgotPasswordStep1Props {
  onSuccessStep?: (identity: string, mode: "email" | "phone", otp?: string) => void;
}

export const ForgotPasswordStep1 = ({ onSuccessStep }: ForgotPasswordStep1Props) => {
  const dispatch = useAppDispatch();
  const {
    resetPasswordLoading,
    resetPasswordError,
    resetPasswordSuccess,
    resetPasswordSession,
  } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [identity, setIdentity] = useState("user123@gmail.com");
  const [inputError, setInputError] = useState<string | null>(null);

  // Clear stale messages on mount
  useEffect(() => {
    dispatch(clearPasswordResetState());
  }, [dispatch]);

  // Handle mode change
  const handleModeChange = (newMode: "email" | "phone") => {
    setMode(newMode);
    setInputError(null);
    dispatch(clearPasswordResetState());
    if (newMode === "email") {
      setIdentity("user123@gmail.com");
    } else {
      setIdentity("0900000002");
    }
  };

  // Live validation check
  const isValid = (): boolean => {
    const val = identity.trim();
    if (!val) return false;
    if (mode === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    } else {
      return /^[0-9\s\-+()]{9,15}$/.test(val);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentity(e.target.value);
    if (inputError) setInputError(null);
    if (resetPasswordError) dispatch(clearPasswordResetState());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = identity.trim();
    if (!val) {
      setInputError(
        mode === "email"
          ? "Vui lòng nhập địa chỉ email của bạn."
          : "Vui lòng nhập số điện thoại của bạn."
      );
      return;
    }

    if (mode === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setInputError("Địa chỉ email không đúng định dạng. Ví dụ: nguyenvana@gmail.com");
      return;
    }

    if (mode === "phone" && !/^[0-9\s\-+()]{9,15}$/.test(val)) {
      setInputError("Số điện thoại không hợp lệ (từ 9 đến 15 chữ số).");
      return;
    }

    setInputError(null);
    const resultAction = await dispatch(
      sendPasswordResetOtp({ identity: val, mode })
    );

    if (sendPasswordResetOtp.fulfilled.match(resultAction)) {
      if (onSuccessStep) {
        onSuccessStep(val, mode, resultAction.payload.otp);
      }
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl shadow-surface-tint/5 p-6 sm:p-10 flex flex-col gap-6 relative border border-slate-100">
      {/* System Header Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary">
          <span className="material-symbols-outlined text-[15px]">shield_person</span>
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
            MARKETPULSE ID • TRUNG TÂM PHỤC HỒI TÀI KHOẢN
          </span>
        </div>
      </div>

      {/* 3-Step Interactive Process Stepper */}
      <div className="pt-2">
        <div className="relative flex items-center justify-between">
          {/* Background Stepper Connector Lines */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-surface-container-high -z-0" />

          {/* Step 1: Active Highlighted */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary-fixed shadow-md animate-pulse">
              <span className="font-label-md text-xs font-bold">1</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-label-md text-xs text-primary font-bold">1. Yêu cầu mã</span>
              <span className="font-body-sm text-[11px] text-primary">Nhập thông tin</span>
            </div>
          </div>

          {/* Step 2: Inactive / Pending */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
              <span className="font-label-md text-xs font-semibold">2</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-label-md text-xs text-on-surface-variant">2. Xác thực OTP</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">6 chữ số</span>
            </div>
          </div>

          {/* Step 3: Inactive / Pending */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
              <span className="font-label-md text-xs font-semibold">3</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-label-md text-xs text-on-surface-variant">3. Đặt mật khẩu</span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">Mật khẩu mới</span>
            </div>
          </div>
        </div>
      </div>

      {/* Headline & Explanatory Context */}
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-1.5 text-secondary">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-label-sm text-xs font-semibold tracking-wide uppercase">
            Bước 1: Gửi mã xác nhận
          </span>
        </div>
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Quên mật khẩu?
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Vui lòng nhập địa chỉ Email hoặc Số điện thoại đã đăng ký để nhận mã xác thực bảo mật OTP khôi phục quyền truy cập tài khoản MarketPulse của bạn.
        </p>
      </div>

      {/* Form Section */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {/* Verification Dispatch Modes Quick Switcher */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs font-semibold text-on-surface-variant">
              Kênh nhận mã ưu tiên:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-xl">
            <button
              id="tabEmail"
              type="button"
              onClick={() => handleModeChange("email")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-label-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "email"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span>Gửi qua Email</span>
            </button>
            <button
              id="tabPhone"
              type="button"
              onClick={() => handleModeChange("phone")}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-label-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "phone"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">sms</span>
              <span>SMS / Zalo ZNS</span>
            </button>
          </div>
        </div>

        {/* Input Container */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              className="font-label-lg text-xs font-semibold text-on-surface flex items-center gap-1"
              htmlFor="recoveryIdentity"
            >
              <span>Email hoặc Số điện thoại đăng ký</span>
              <span className="text-tertiary-container font-bold">*</span>
            </label>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-secondary">
              <span className="material-symbols-outlined text-[22px]">contact_mail</span>
            </div>

            <input
              id="recoveryIdentity"
              name="recoveryIdentity"
              type={mode === "email" ? "email" : "tel"}
              value={identity}
              onChange={handleInputChange}
              placeholder={
                mode === "email"
                  ? "Ví dụ: nguyenvana@gmail.com"
                  : "Ví dụ: 0909 123 456"
              }
              className={`w-full pl-12 pr-12 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all focus:ring-2 ${
                inputError || resetPasswordError
                  ? "ring-2 ring-red-400 border-red-400"
                  : "focus:ring-primary-container"
              }`}
              required
            />

            <div className="absolute right-3.5 flex items-center">
              {isValid() ? (
                <span
                  className="material-symbols-outlined text-[20px] text-emerald-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  title="Thông tin hợp lệ"
                >
                  check_circle
                </span>
              ) : null}
            </div>
          </div>

          {/* Input Error Message */}
          {inputError && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {inputError}
            </p>
          )}
        </div>

        {/* Global Error Banner */}
        {resetPasswordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
              error
            </span>
            <span>{resetPasswordError}</span>
          </div>
        )}

        {/* Success Banner */}
        {resetPasswordSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                check_circle
              </span>
              <span>{resetPasswordSuccess}</span>
            </div>
            {resetPasswordSession?.otp && (
              <div className="p-2.5 rounded-lg bg-white border border-emerald-300 font-mono text-center">
                <span className="text-slate-500 text-[11px] block">
                  Mã OTP mô phỏng để thử nghiệm:
                </span>
                <span className="text-lg font-bold text-emerald-700 tracking-widest">
                  {resetPasswordSession.otp}
                </span>
              </div>
            )}
            <p className="text-[11px] text-emerald-700 italic">
              Đã hoàn thành bước 1. Bạn đã sẵn sàng để tiếp tục xác thực OTP ở bước 2.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={resetPasswordLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-primary-container text-on-primary font-label-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-primary-container/20 hover:brightness-110 active:scale-[0.99] transition-all group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                <span>Đang gửi mã xác thực...</span>
              </>
            ) : (
              <>
                <span>Gửi mã xác thực &amp; Tiếp tục</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordStep1;
