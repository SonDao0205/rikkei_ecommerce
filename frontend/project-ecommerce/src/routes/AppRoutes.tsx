import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPassword from "../pages/ForgotPassword";
import HomePage from "../pages/HomePage";
import AdminProduct from "../pages/AdminProduct";
import MyProfile from "../pages/MyProfile";
import ChangePassword from "../pages/ChangePassword";
import ProtectedRoute from "./ProtectedRoute";

/**
 * router – Cấu hình toàn bộ routing của ứng dụng bằng createBrowserRouter.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-profile",
    element: (
      <ProtectedRoute>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/change-password",
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
