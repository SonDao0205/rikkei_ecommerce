import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/state/store";

/**
 * Điều hướng dự phòng khi URL không khớp với bất kỳ route nào:
 * - Admin đăng nhập: Chuyển về /admin/dashboard
 * - Seller đăng nhập: Chuyển về /shop/dashboard
 * - Người dùng khác / khách: Chuyển về trang chủ /
 */
const WildcardRoute: React.FC = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    const userRole = (role || "").toLowerCase().trim();
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "seller") {
      return <Navigate to="/shop/dashboard" replace />;
    }
  }

  return <Navigate to="/" replace />;
};

export default WildcardRoute;
