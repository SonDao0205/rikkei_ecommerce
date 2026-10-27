import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { changeUserPassword, clearProfileStatus } from "../../redux/slices/profileSlice";
import { logoutUser } from "../../redux/slices/authSlice";

export const ProfileSecurityForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { passwordLoading, passwordSuccessMessage, passwordError } =
    useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(clearProfileStatus());
    return () => {
      dispatch(clearProfileStatus());
    };
  }, [dispatch]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass || pass.length === 0) return { score: 0, label: "", color: "", text: "" };
    if (pass.length < 6) {
      return { score: 1, label: "Yếu", color: "bg-red-500", text: "text-red-600" };
    }
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Za-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Yếu", color: "bg-red-500", text: "text-red-600" };
    if (score === 2) return { score: 2, label: "Trung bình", color: "bg-amber-500", text: "text-amber-600" };
    if (score === 3) return { score: 3, label: "Mạnh", color: "bg-blue-500", text: "text-blue-600" };
    return { score: 4, label: "Rất mạnh", color: "bg-green-500", text: "text-green-700" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setFieldErrors({});

    if (!currentPassword) {
      setFieldErrors({ currentPassword: "Vui lòng nhập mật khẩu hiện tại." });
      return;
    }
    if (!newPassword || newPassword.length < 10) {
      setFieldErrors({ newPassword: "Mật khẩu mới phải có tối thiểu 10 ký tự." });
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setFieldErrors({ newPassword: "Mật khẩu mới phải chứa ít nhất một chữ cái và một chữ số." });
      return;
    }
    if (newPassword === currentPassword) {
      setFieldErrors({ newPassword: "Mật khẩu mới không được trùng với mật khẩu hiện tại." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Mật khẩu xác nhận không khớp với mật khẩu mới." });
      return;
    }

    const res = await dispatch(
      changeUserPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })
    );

    if (changeUserPassword.fulfilled.match(res)) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else if (changeUserPassword.rejected.match(res)) {
      const errMsg = (res.payload as string) || "Đổi mật khẩu thất bại.";
      if (
        errMsg.toLowerCase().includes("mật khẩu hiện tại") ||
        errMsg.toLowerCase().includes("current password")
      ) {
        setFieldErrors({ currentPassword: "Mật khẩu hiện tại không chính xác." });
      } else if (errMsg.toLowerCase().includes("trùng") || errMsg.toLowerCase().includes("reused")) {
        setFieldErrors({ newPassword: "Mật khẩu mới không được trùng với mật khẩu hiện tại." });
      }
    }
  };

  return (
    <section
      id="change-password"
      className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 border border-outline-variant/30"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">lock_reset</span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Security &amp; Password (Đổi mật khẩu)
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Ensure your account remains safe with strong, periodically renewed credentials.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body-sm text-body-sm text-outline">
            Last changed 3 months ago
          </span>
        </div>
      </div>

      {/* Messages */}
      {passwordSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-[22px] shrink-0">
              check_circle
            </span>
            <div>
              <p className="font-bold text-emerald-900 text-sm">{passwordSuccessMessage}</p>
              <p className="text-emerald-700 mt-0.5">
                Các phiên đăng nhập trên thiết bị khác đã được thu hồi an toàn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await dispatch(logoutUser());
              navigate("/login", { replace: true });
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer text-xs"
          >
            Đăng nhập lại
          </button>
        </div>
      )}
      {(passwordError || validationError) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[18px]">
            error
          </span>
          <span>{passwordError || validationError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>
                Current Password <span className="text-error">*</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                key
              </span>
              <input
                className={`w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:outline-none transition-all shadow-sm ${
                  fieldErrors.currentPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                }`}
                placeholder="••••••••••••"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (fieldErrors.currentPassword) {
                    setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }));
                  }
                  if (validationError) setValidationError(null);
                }}
                required
              />
              <button
                className="absolute right-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                title="Toggle visibility"
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showCurrent ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{fieldErrors.currentPassword}</span>
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>
                New Password <span className="text-error">*</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                lock
              </span>
              <input
                className={`w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:outline-none transition-all shadow-sm ${
                  fieldErrors.newPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                }`}
                placeholder="Tối thiểu 10 ký tự"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) {
                    setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }
                  if (validationError) setValidationError(null);
                }}
                required
              />
              <button
                className="absolute right-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                title="Toggle visibility"
                type="button"
                onClick={() => setShowNew((v) => !v)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showNew ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{fieldErrors.newPassword}</span>
              </p>
            )}

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`flex-1 h-1 rounded-full transition-all duration-200 ${
                      seg <= strength.score ? strength.color : "bg-surface-container"
                    }`}
                  />
                ))}
                <span className={`text-[11px] font-semibold ${strength.text}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>
                Confirm New Password <span className="text-error">*</span>
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                check_circle
              </span>
              <input
                className={`w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:outline-none transition-all shadow-sm ${
                  fieldErrors.confirmPassword
                    ? "border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : "border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                }`}
                placeholder="Nhập lại mật khẩu mới"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                  if (validationError) setValidationError(null);
                }}
                required
              />
              <button
                className="absolute right-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                title="Toggle visibility"
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirm ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container">
          <button
            type="submit"
            disabled={passwordLoading}
            className="h-11 px-6 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {passwordLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>Xác nhận đổi mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfileSecurityForm;
