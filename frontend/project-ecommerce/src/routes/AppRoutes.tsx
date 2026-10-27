import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AccountPage from "../pages/AccountPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/account", element: <AccountPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
