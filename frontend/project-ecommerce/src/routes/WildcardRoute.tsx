import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";

/**
 * Điều hướng dự phòng khi URL không khớp với bất kỳ route nào:
 * - Admin đăng nhập: Chuyển về /admin/dashboard
 * - Người dùng khác / khách: Chuyển về trang chủ /
 */
const WildcardRoute: React.FC = () => {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth);
  if (isAuthenticated && (role || "").toLowerCase().trim() === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/" replace />;
};

export default WildcardRoute;
