import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { logoutUser, closeLogoutModal } from "../../redux/slices/auth/authSlice";
import router from "../../routes/AppRoutes";

export interface LogoutConfirmModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  userName?: string;
  userRole?: string;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onConfirm: propsOnConfirm,
  userName: propsUserName,
  userRole: propsUserRole,
}) => {
  const dispatch = useAppDispatch();
  const { isLogoutModalOpen, user, role, loading } = useAppSelector(
    (state) => state.auth
  );

  // Allow controlled via props OR connected via Redux state
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isLogoutModalOpen;
  const displayName = propsUserName || user?.full_name || "Quý khách";
  const displayRole = propsUserRole || role || "user";
  const displayEmail = user?.email || user?.phone || "";

  const [isRendered, setIsRendered] = useState(false);

  const handleClose = useCallback(() => {
    if (loading) return;
    setIsRendered(false);
    setTimeout(() => {
      if (propsOnClose) {
        propsOnClose();
      } else {
        dispatch(closeLogoutModal());
      }
    }, 150);
  }, [loading, propsOnClose, dispatch]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsRendered(true), 20);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loading, handleClose]);

  const handleConfirm = async () => {
    if (loading) return;
    if (propsOnConfirm) {
      propsOnConfirm();
    } else {
      await dispatch(logoutUser());
      router.navigate("/");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      {/* Backdrop with blur */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-6 sm:p-8 z-10 transform transition-all duration-200 ease-out ${
          isRendered
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Đóng"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Glowing Red Logout Icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
              <span className="material-symbols-outlined text-[32px]">logout</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 ring-2 ring-white"></span>
            </span>
          </div>

          {/* Heading */}
          <h3
            id="logout-modal-title"
            className="text-xl font-extrabold text-slate-900 tracking-tight"
          >
            Xác nhận đăng xuất
          </h3>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-sm">
            Bạn có chắc chắn muốn đăng xuất không? Phiên đăng nhập hiện tại sẽ kết
            thúc và bạn sẽ được chuyển về trang chủ.
          </p>

          {/* User Preview Box */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">
                {displayRole === "admin" ? "admin_panel_settings" : "person"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-slate-900 truncate">
                  {displayName}
                </p>
              </div>
              {displayEmail && (
                <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35 transition-all focus:outline-none focus:ring-4 focus:ring-red-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>Đang đăng xuất...</span>
                </>
              ) : (
                <>
                  <span>Đăng xuất</span>
                  <span className="material-symbols-outlined text-[18px]">
                    logout
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
