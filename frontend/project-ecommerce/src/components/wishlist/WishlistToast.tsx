import React from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export interface WishlistToastProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  actionText?: string;
  actionLink?: string;
  type?: "success" | "error" | "info";
}

export const WishlistToast: React.FC<WishlistToastProps> = ({
  isOpen,
  title,
  message,
  onClose,
  actionText = "Xem yêu thích",
  actionLink = "/wishlist",
  type = "success",
}) => {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const isError = type === "error";

  const content = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-6 right-6 sm:right-8 z-[9999] flex items-center gap-3 p-4 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl transition-all duration-300 w-[calc(100vw-3rem)] sm:w-auto max-w-md border border-outline-variant/30"
      role="alert"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isError
            ? "bg-red-500/20 text-red-400"
            : "bg-emerald-500/20 text-emerald-400"
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isError ? "error" : "check_circle"}
        </span>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-label-md text-xs sm:text-sm font-bold text-inverse-on-surface truncate">
          {title}
        </span>
        <span className="text-xs text-surface-dim truncate">{message}</span>
      </div>

      {actionLink && (
        <Link
          to={actionLink}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-xs font-bold text-secondary-fixed hover:underline shrink-0 ml-1 flex items-center gap-0.5 cursor-pointer"
        >
          <span>{actionText}</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="text-surface-dim hover:text-inverse-on-surface transition-colors p-1 cursor-pointer"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );

  return createPortal(content, document.body);
};

export default WishlistToast;
