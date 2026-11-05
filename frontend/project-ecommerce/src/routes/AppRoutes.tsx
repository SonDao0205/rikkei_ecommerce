import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import RoleSelectionPage from "../pages/auth/RoleSelectionPage";
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
import AdminCategory from "../pages/admin/AdminCategory";
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
    path: "/select-role",
    element: (
      <ProtectedRoute>
        <RoleSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop",
    element: <RegisterOpenShopStep1 />,
  },
  {
    path: "/register-shop",
    element: <RegisterOpenShopStep1 />,
  },
  {
    path: "/shop/register",
    element: <RegisterOpenShopStep1 />,
  },
  {
    path: "/seller/register",
    element: <RegisterOpenShopStep1 />,
  },
  {
    path: "/register-open-shop/step2",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep2 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop/step-2",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep2 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop-step2",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep2 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/register/step-2",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep2 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop/step3",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep3 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop/step-3",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep3 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop-step3",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep3 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/register/step-3",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep3 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop/step4",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep4 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop/step-4",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep4 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-open-shop-step4",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep4 />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/register/step-4",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <RegisterOpenShopStep4 />
      </ProtectedRoute>
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
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-profile",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <ChangePassword />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/address",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <Address />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-orders",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-order",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-order/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
        <MyOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-orders/:id",
    element: (
      <ProtectedRoute disallowedRoles={["admin", "ADMIN"]}>
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
    path: "/admin/categories",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminCategory />
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
