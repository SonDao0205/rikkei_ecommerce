import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HomePage from "../pages/home/HomePage";
import AdminProduct from "../pages/admin/AdminProduct";
import AdminDashBoard from "../pages/admin/AdminDashBoard";
import AdminOrder from "../pages/admin/AdminOrder";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import AdminShop from "../pages/admin/AdminShop";
import MyProfile from "../pages/user/MyProfile";
import ChangePassword from "../pages/user/ChangePassword";
import Address from "../pages/user/Address";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import StorefrontRoute from "./StorefrontRoute";
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

/**
 * router – Cấu hình toàn bộ routing của ứng dụng bằng createBrowserRouter.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <StorefrontRoute>
        <HomePage />
      </StorefrontRoute>
    ),
  },
  {
    path: "/home",
    element: (
      <StorefrontRoute>
        <HomePage />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPassword />
      </GuestRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-profile",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <Navigate to="/admin/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminDashBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/orders/:id",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/order-detail",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/shops",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminShop />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/shop",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminShop />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/merchants",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminShop />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <Navigate to="/admin/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <WildcardRoute />,
  },
]);

export default router;

