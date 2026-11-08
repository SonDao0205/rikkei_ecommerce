import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/state/store";
import type { UserRole } from "@/shared/types";

interface StorefrontRouteProps {
  children: ReactNode;
  disallowedRoles?: (UserRole | string)[];
}

/**
 * Route Guard cho các trang storefront bán hàng (ví dụ: Trang chủ / và /home, chi tiết sản phẩm):
 * - Nếu người dùng là admin đã đăng nhập: Chuyển hướng về trang quản trị (/admin/dashboard).
 * - Các vai trò khác (khách chưa đăng nhập, người mua, người bán): Cho phép truy cập bình thường.
 */
export const StorefrontRoute: React.FC<StorefrontRouteProps> = ({
  children,
  disallowedRoles = ["admin", "ADMIN"],
}) => {
  const { isAuthenticated, user, role, isInitialized } = useAppSelector(
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

  // Khi đã đăng nhập, chặn truy cập storefront nếu vai trò nằm trong disallowedRoles (mặc định chặn Admin)
  if (isAuthenticated) {
    const userRoles = new Set(
      (user?.roles?.length ? user.roles : role || user?.role ? [role || user?.role] : []).map(
        (value) => String(value).toLowerCase().trim()
      )
    );

    const isDisallowed = disallowedRoles.some((r) =>
      userRoles.has(String(r).toLowerCase().trim())
    );

    if (isDisallowed) {
      if (userRoles.has("admin")) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (userRoles.has("seller")) {
        return <Navigate to="/shop/dashboard" replace />;
      }
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default StorefrontRoute;
