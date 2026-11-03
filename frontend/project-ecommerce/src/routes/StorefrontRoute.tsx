import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";

interface StorefrontRouteProps {
  children: ReactNode;
}

/**
 * Route Guard cho các trang storefront bán hàng (ví dụ: Trang chủ / và /home, chi tiết sản phẩm):
 * - Khách (chưa đăng nhập) hoặc khách hàng (client, customer...): Truy cập bình thường.
 * - Quản trị viên (admin): Tự động chuyển hướng về trang quản trị ("/admin/dashboard").
 * - Người bán (seller): Tự động chuyển hướng về trang của shop ("/shop/dashboard"), không cho phép thao tác ở trang người dùng.
 * - Trạng thái đăng nhập của admin và seller được giữ nguyên hoàn toàn.
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

  // Phân quyền chặt chẽ: Admin và Seller không được vào trang người dùng
  if (isAuthenticated) {
    const userRole = (role || "").toLowerCase().trim();
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "seller") {
      return <Navigate to="/shop/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default StorefrontRoute;
