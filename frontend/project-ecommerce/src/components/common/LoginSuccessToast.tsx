import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { dismissLoginToast } from "../../redux/slices/auth/authSlice";

/**
 * LoginSuccessToast
 * Popup trượt từ phải qua trái thông báo Đăng nhập thành công,
 * hiển thị thông tin người dùng, phân quyền (role) và simulated Access Token lưu trong Redux memory.
 */
const TOAST_DURATION = 4000; // 4 seconds auto-dismiss

export const LoginSuccessToast: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showLoginSuccessToast, user } =
    useAppSelector((state) => state.auth);

  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Wait for slide-out animation to finish before clearing from Redux state
    setTimeout(() => {
      dispatch(dismissLoginToast());
    }, 400);
  }, [dispatch]);

  useEffect(() => {
    if (showLoginSuccessToast) {
      // Trigger slide-in from right to left
      const enterTimer = setTimeout(() => {
        setProgress(100);
        setIsVisible(true);
      }, 30);

      // Progress bar decrement
      const stepMs = 50;
      const decrement = 100 / (TOAST_DURATION / stepMs);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - decrement));
      }, stepMs);

      // Auto dismiss
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, TOAST_DURATION);

      return () => {
        clearTimeout(enterTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    } else {
      const exitTimer = setTimeout(() => setIsVisible(false), 0);
      return () => clearTimeout(exitTimer);
    }
  }, [showLoginSuccessToast, handleDismiss]);

  if (!showLoginSuccessToast) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[99999] pointer-events-auto"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 backdrop-blur-xl border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.18),0_10px_20px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-[120%] opacity-0 scale-95"
          }`}
      >
        <div className="p-4 sm:p-5 flex items-start gap-3.5">
          {/* Animated Glowing Icon Badge */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <span className="material-symbols-outlined text-[24px]">
                check_circle
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-white"></span>
            </span>
          </div>

          {/* Toast Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                Đăng nhập thành công!
              </h4>
            </div>

            <p className="mt-1 text-xs text-slate-600 font-medium truncate">
              Chào mừng, <span className="font-semibold text-slate-900">{user?.full_name || "Quý khách"}</span>
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Progress Countdown Bar */}
        <div className="w-full h-1 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessToast;
