import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";
import type { UserRole } from "../types/ecommerce";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: (UserRole | string)[];
  disallowedRoles?: (UserRole | string)[];
}

/**
 * Route Guard:
 * - Khi chưa đăng nhập: chuyển hướng về trang chủ ("/")
 * - Khi người dùng truy cập route không đúng phân quyền:
 *   + Nếu là admin: chuyển hướng về trang quản trị ("/admin/dashboard")
 *   + Nếu là người dùng thường: chuyển hướng về trang chủ ("/")
 *   + Trạng thái đăng nhập được giữ nguyên hoàn toàn.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  disallowedRoles,
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

  const userRole = (role || "").toLowerCase().trim();

  // Kiểm tra danh sách vai trò bị cấm (disallowedRoles)
  if (disallowedRoles && disallowedRoles.length > 0) {
    const isDisallowed = disallowedRoles.some(
      (r) => r.toLowerCase().trim() === userRole
    );
    if (isDisallowed) {
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // Kiểm tra danh sách vai trò được phép (allowedRoles)
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((r) => r.toLowerCase().trim() === userRole);
    if (!hasRole) {
      if (userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
