import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/state/store";

interface GuestRouteProps {
  children: ReactNode;
}

/**
 * Route Guard dành cho các trang chỉ cho phép người dùng chưa đăng nhập truy cập (Login, Register, Forgot Password).
 * - Nếu người dùng đã đăng nhập: Chuyển hướng về trang chủ (/home), trang quản trị (/admin/dashboard) nếu là Admin, hoặc (/shop/dashboard) nếu là Seller.
 * - Nếu đang tải / kiểm tra phiên: Hiển thị trạng thái chờ xác thực để tránh giật giao diện.
 */
export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, role, user, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Khi mới mở ứng dụng hoặc refresh trang, đợi phục hồi phiên xác thực
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

  // Nếu đã đăng nhập thành công, không cho phép vào lại trang login/register
  if (isAuthenticated) {
    const userRoles = new Set(
      (user?.roles?.length ? user.roles : role || user?.role ? [role || user?.role] : []).map(
        (value) => String(value).toLowerCase().trim()
      )
    );
    const isAdmin = userRoles.has("admin");
    const isCustomer = userRoles.has("client") || userRoles.has("customer");
    const isSeller = userRoles.has("seller");

    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (isCustomer) {
      return <Navigate to="/home" replace />;
    }
    if (isSeller && user?.shop_status === "ACTIVE") {
      return <Navigate to="/shop/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
