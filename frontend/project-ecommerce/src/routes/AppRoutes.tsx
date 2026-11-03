import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HomePage from "../pages/home/HomePage";
import ProductDetail from "../pages/product/ProductDetail";
import InforShop from "../pages/shop/InforShop";
import RegisterOpenShopStep1 from "../pages/shop/RegisterOpenShopStep1";
import RegisterOpenShopStep2 from "../pages/shop/RegisterOpenShopStep2";
import RegisterOpenShopStep3 from "../pages/shop/RegisterOpenShopStep3";
import RegisterOpenShopStep4 from "../pages/shop/RegisterOpenShopStep4";
import ShopDashboard from "../pages/shop/ShopDashboard";
import ShopProductManagement from "../pages/shop/ShopProductManagement";
import AdminProduct from "../pages/admin/AdminProduct";
import AdminDashBoard from "../pages/admin/AdminDashBoard";
import AdminOrder from "../pages/admin/AdminOrder";
import AdminOrderDetail from "../pages/admin/AdminOrderDetail";
import AdminShop from "../pages/admin/AdminShop";
import MyProfile from "../pages/user/MyProfile";
import ChangePassword from "../pages/user/ChangePassword";
import Address from "../pages/user/Address";
import MyOrder from "../pages/user/MyOrder";
import MyOrderDetail from "../pages/user/MyOrderDetail";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import StorefrontRoute from "./StorefrontRoute";
import WildcardRoute from "./WildcardRoute";

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
    path: "/product/:id",
    element: (
      <StorefrontRoute>
        <ProductDetail />
      </StorefrontRoute>
    ),
  },
  {
    path: "/products/:id",
    element: (
      <StorefrontRoute>
        <ProductDetail />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop/:id",
    element: (
      <StorefrontRoute>
        <InforShop />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shops/:id",
    element: (
      <StorefrontRoute>
        <InforShop />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep1 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-shop",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep1 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop/register",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep1 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/seller/register",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep1 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step2",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep2 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step-2",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep2 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop-step2",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep2 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop/register/step-2",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep2 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step3",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep3 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step-3",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep3 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop-step3",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep3 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop/register/step-3",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep3 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step4",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep4 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop/step-4",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep4 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/register-open-shop-step4",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep4 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop/register/step-4",
    element: (
      <StorefrontRoute>
        <RegisterOpenShopStep4 />
      </StorefrontRoute>
    ),
  },
  {
    path: "/shop",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <Navigate to="/shop/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/seller/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <Navigate to="/shop/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/products",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopProductManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/product",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopProductManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/*",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <Navigate to="/shop/dashboard" replace />
      </ProtectedRoute>
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
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-profile",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-order",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-order/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "seller", "ADMIN", "SELLER"]}>
        <MyOrderDetail />
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

