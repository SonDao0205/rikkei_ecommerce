import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import type { UserRole } from "../types/ecommerce";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: (UserRole | string)[];
}

/**
 * Route Guard:
 * - Khi bất kì ai chưa đăng nhập: chuyển hướng về trang chủ ("/")
 * - Khi người dùng đã đăng nhập nhưng không có role hợp lệ: chuyển hướng về trang chủ ("/")
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Khi mới mở tab hoặc tải lại trang, chờ phục hồi phiên làm việc qua refresh token
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant">
            Đang xác thực phiên làm việc...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (role || "").toLowerCase().trim();
    const hasRole = allowedRoles.some((r) => r.toLowerCase().trim() === userRole);
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
