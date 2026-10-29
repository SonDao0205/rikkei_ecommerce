import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  verifyPasswordResetOtp,
  sendPasswordResetOtp,
  clearPasswordResetState,
} from "../../redux/slices/auth/authSlice";

interface ForgotPasswordStep2Props {
  onBack: () => void;
  onSuccessStep?: (resetToken?: string) => void;
}

export const ForgotPasswordStep2 = ({
  onBack,
  onSuccessStep,
}: ForgotPasswordStep2Props) => {
  const dispatch = useAppDispatch();
  const {
    resetPasswordSession,
    resetPasswordLoading,
    resetPasswordError,
    resetPasswordSuccess,
  } = useAppSelector((state) => state.auth);

  // 6 individual digit inputs
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // Countdown timer in seconds (defaults to 48s as in step2.html)
  const [countdown, setCountdown] = useState<number>(60);

  // Timer interval
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Handle single digit change & auto-advance
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    const lastChar = cleaned[cleaned.length - 1];
    const updated = [...otpDigits];
    updated[index] = lastChar;
    setOtpDigits(updated);

    if (resetPasswordError) {
      dispatch(clearPasswordResetState());
    }

    // Auto move to next input if available
    if (index < 5 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split("");
    const updated = [...otpDigits];
    digits.forEach((digit, idx) => {
      if (idx < 6) updated[idx] = digit;
    });
    setOtpDigits(updated);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Resend OTP action
  const handleResend = async () => {
    if (countdown > 0 || !resetPasswordSession) return;
    setCountdown(60);
    await dispatch(
      sendPasswordResetOtp({
        identity: resetPasswordSession.identity,
        mode: resetPasswordSession.mode,
      })
    );
  };

  const fullOtp = otpDigits.join("");
  const isComplete = fullOtp.length === 6;

  // Submit OTP Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    const identity = resetPasswordSession?.identity;
    if (!identity) {
      setFormError("Yêu cầu khôi phục đã hết. Hãy bắt đầu lại từ bước nhập email hoặc số điện thoại.");
      return;
    }
    setFormError(null);
    const resultAction = await dispatch(
      verifyPasswordResetOtp({ identity, otp: fullOtp })
    );

    if (verifyPasswordResetOtp.fulfilled.match(resultAction)) {
      if (onSuccessStep) {
        onSuccessStep(resultAction.payload.resetToken);
      }
    }
  };

  const formatTimer = (sec: number) => {
    const s = sec < 10 ? `0${sec}` : sec;
    return `00:${s}s`;
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl shadow-xl shadow-surface-tint/5 p-6 sm:p-10 flex flex-col gap-6 relative border border-slate-100">
      {/* Header Tag & Identity Breadcrumb */}
      <div className="flex flex-col gap-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary">
            <span className="material-symbols-outlined text-[15px]">shield_person</span>
            <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
              MARKETPULSE ID • TRUNG TÂM PHỤC HỒI TÀI KHOẢN
            </span>
          </div>
        </div>

        {/* Stepper Progress Header */}
        <div className="pt-2">
          <div className="relative flex items-center justify-between">
            {/* Background Stepper Connector Lines */}
            <div className="absolute top-4 left-6 right-6 h-[2px] bg-surface-container-high -z-0" />
            {/* Completed Line (Step 1 -> Step 2) */}
            <div className="absolute top-4 left-6 w-1/2 h-[2px] bg-primary-container -z-0" />

            {/* Step 1: Verified (Completed) */}
            <button
              type="button"
              onClick={onBack}
              className="flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
              title="Nhấn để quay lại bước 1"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm group-hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-label-md text-xs text-on-surface font-semibold group-hover:text-primary">
                  1. Yêu cầu mã
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Đã xác minh</span>
              </div>
            </button>

            {/* Step 2: Active Highlighted */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary-fixed shadow-md animate-pulse">
                <span className="font-label-md text-xs font-bold">2</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-label-md text-xs text-primary font-bold">
                  2. Xác thực OTP
                </span>
                <span className="font-body-sm text-[11px] text-primary">6 chữ số</span>
              </div>
            </div>

            {/* Step 3: Inactive / Muted */}
            <div className="flex flex-col items-center gap-1.5 z-10">
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                <span className="font-label-md text-xs font-semibold">3</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-label-md text-xs text-on-surface-variant">
                  3. Đặt mật khẩu
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  Mật khẩu mới
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Narrative & Identity Destination */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5 text-secondary">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
          <span className="font-label-sm text-xs font-semibold tracking-wide uppercase">
            Bước 2: Xác thực mã bảo mật OTP
          </span>
        </div>
        <h1 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Xác thực mã bảo mật OTP
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
          Hệ thống đã phát hành mã số xác minh một lần (OTP) bảo mật đến phương thức liên lạc chính đã liên kết với tài khoản của bạn:
        </p>

        {/* Verified Recipient Destination Pill Box */}
        <div className="mt-1 inline-flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-primary">
              {resetPasswordSession?.mode === "phone" ? "smartphone" : "mail"}
            </span>
            <span className="font-mono text-sm font-semibold text-slate-800 truncate">
              {resetPasswordSession?.identity || ""}
            </span>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-primary hover:text-brand-800 hover:underline shrink-0 pl-2 cursor-pointer"
          >
            Thay đổi
          </button>
        </div>
      </div>

      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
        Khi chạy local, mã OTP được ghi trong log backend. Mở `docker compose logs -f backend` để lấy mã mới nhất.
      </p>

      {formError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{formError}</p>}

      {/* Global Error Banner */}
      {resetPasswordError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
            error
          </span>
          <span>{resetPasswordError}</span>
        </div>
      )}

      {/* Global Success Banner */}
      {resetPasswordSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">
            check_circle
          </span>
          <span>{resetPasswordSuccess}</span>
        </div>
      )}

      {/* 6-Digit OTP Interactive Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* OTP Visual Grid */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3" id="otp-container">
            {/* Box 0, 1, 2 */}
            {[0, 1, 2].map((idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpDigits[idx]}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-11 sm:w-14 h-14 sm:h-16 rounded-xl text-center font-mono font-bold text-xl sm:text-2xl outline-none transition-all shadow-sm ${otpDigits[idx]
                  ? "bg-surface-container-lowest text-on-surface border-2 border-primary shadow-md"
                  : "bg-surface-container-low text-on-surface border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest"
                  }`}
              />
            ))}

            {/* Visual Separator Hyphen */}
            <div className="px-0.5 text-on-surface-variant font-bold text-lg select-none">−</div>

            {/* Box 3, 4, 5 */}
            {[3, 4, 5].map((idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpDigits[idx]}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-11 sm:w-14 h-14 sm:h-16 rounded-xl text-center font-mono font-bold text-xl sm:text-2xl outline-none transition-all shadow-sm ${otpDigits[idx]
                  ? "bg-surface-container-lowest text-on-surface border-2 border-primary shadow-md"
                  : "bg-surface-container-low text-on-surface border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary-container/20 focus:bg-surface-container-lowest"
                  }`}
              />
            ))}
          </div>

          <span className="text-[11px] text-slate-400">
            Mẹo: Bạn có thể dán (paste) trực tiếp toàn bộ 6 chữ số OTP vào ô đầu tiên.
          </span>
        </div>

        {/* Resend Countdown & Dynamic Actions */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-on-surface">
              {/* Radial Animated Micro Indicator */}
              <svg className="w-5 h-5 -rotate-90 shrink-0" viewBox="0 0 36 36">
                <circle
                  className="text-surface-container-high"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <circle
                  className="text-secondary transition-all duration-1000"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="14"
                  stroke="currentColor"
                  strokeDasharray="88"
                  strokeDashoffset={countdown > 0 ? (88 * (60 - countdown)) / 60 : 88}
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-label-md">Chưa nhận được mã? Gửi lại sau:</span>
                <span
                  className={`font-label-md font-mono font-bold ${countdown > 0 ? "text-secondary" : "text-slate-400"
                    }`}
                  id="countdown-timer"
                >
                  {countdown > 0 ? formatTimer(countdown) : "Hết hạn"}
                </span>
              </div>
            </div>

            <button
              id="resend-btn"
              type="button"
              disabled={countdown > 0 || resetPasswordLoading}
              onClick={handleResend}
              className={`font-label-md text-xs flex items-center gap-1 transition-all ${countdown > 0 || resetPasswordLoading
                ? "text-slate-400 opacity-60 cursor-not-allowed"
                : "text-primary font-bold hover:underline cursor-pointer"
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Gửi lại mã ngay</span>
            </button>
          </div>
        </div>

        {/* Primary Action CTA Button */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={!isComplete || resetPasswordLoading}
            className="w-full h-12 sm:h-[52px] bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
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
                <span>Đang xác thực mã OTP...</span>
              </>
            ) : (
              <>
                <span>Xác nhận mã OTP &amp; Tiếp tục</span>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-on-surface-variant pt-1 text-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
            <span className="font-body-sm">
              Mã OTP có hiệu lực trong vòng 5 phút kể từ thời điểm phát hành.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordStep2;
