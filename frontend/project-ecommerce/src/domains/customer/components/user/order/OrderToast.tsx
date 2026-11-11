import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export interface OrderToastProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export const OrderToast: React.FC<OrderToastProps> = ({
  isOpen,
  title,
  message,
  type = "success",
  duration = 3500,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Kích hoạt animation lướt mượt mà từ phải sang trái
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 30);

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }

      return () => {
        clearTimeout(enterTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      setIsVisible(false);
      const exitTimer = setTimeout(() => {
        setShouldRender(false);
      }, 400);
      return () => clearTimeout(exitTimer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!shouldRender || typeof document === "undefined") return null;

  const isError = type === "error";

  const content = (
    <div
      className="fixed bottom-6 right-6 sm:right-8 z-[99999] pointer-events-auto"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md shadow-2xl border border-white/10 max-w-sm sm:max-w-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-[120%] opacity-0 scale-95"
        }`}
      >
        {/* Animated Badge Icon */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            isError
              ? "bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/10"
              : "bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10"
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isError ? "error" : "check_circle"}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 pr-1">
          <span className="text-sm font-bold text-white tracking-tight leading-snug">
            {title}
          </span>
          <span className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-normal">
            {message}
          </span>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer ml-1"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default OrderToast;

