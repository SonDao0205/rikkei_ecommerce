import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";

interface StorefrontRouteProps {
  children: ReactNode;
}

/**
 * Route Guard cho các trang storefront bán hàng (ví dụ: Trang chủ / và /home):
 * - Khách (chưa đăng nhập) hoặc khách hàng (client, customer...): Truy cập bình thường.
 * - Quản trị viên (admin): Tự động chuyển hướng về trang quản trị ("/admin/dashboard").
 * - Trạng thái đăng nhập của admin được giữ nguyên.
 */
export const StorefrontRoute: React.FC<StorefrontRouteProps> = ({ children }) => {
  const { isAuthenticated, role, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Chờ khôi phục phiên xác thực khi mới mở tab hoặc F5
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

  // Nếu là tài khoản Admin, chuyển hướng thẳng về Admin Dashboard
  if (isAuthenticated && (role || "").toLowerCase().trim() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default StorefrontRoute;
