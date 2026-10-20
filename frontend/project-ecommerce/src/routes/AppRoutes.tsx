import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";

/**
 * router – Cấu hình toàn bộ routing của ứng dụng bằng createBrowserRouter.
 *
 * Cấu trúc:
 *  /          → redirect → /register (tạm thời)
 *  /register  → RegisterPage (Public)
 *
 * Sau này sẽ bổ sung:
 *  PublicRoute  – chỉ cho phép user chưa đăng nhập (register, login)
 *  ProtectedRoute – chỉ cho phép user đã đăng nhập (home, cart, orders)
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/register" replace />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  { path: "/login", element: <LoginPage /> },
  // TODO: { path: "/home", element: <ProtectedRoute><HomePage /></ProtectedRoute> },
]);

export default router;
