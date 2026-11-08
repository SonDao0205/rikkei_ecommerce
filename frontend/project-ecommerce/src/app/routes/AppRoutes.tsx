import { createBrowserRouter, Navigate } from "react-router-dom";
import RegisterPage from "@/domains/auth/pages/RegisterPage";
import LoginPage from "@/domains/auth/pages/LoginPage";
import RoleSelectionPage from "@/domains/auth/pages/RoleSelectionPage";
import ForgotPassword from "@/domains/auth/pages/ForgotPassword";
import HomePage from "@/domains/storefront/pages/home/HomePage";
import ProductDetail from "@/domains/storefront/pages/product/ProductDetail";
import InforShop from "@/domains/shop/pages/InforShop";
import RegisterOpenShopStep1 from "@/domains/shop/pages/RegisterOpenShopStep1";
import RegisterOpenShopStep2 from "@/domains/shop/pages/RegisterOpenShopStep2";
import RegisterOpenShopStep3 from "@/domains/shop/pages/RegisterOpenShopStep3";
import RegisterOpenShopStep4 from "@/domains/shop/pages/RegisterOpenShopStep4";
import ShopDashboard from "@/domains/shop/pages/ShopDashboard";
import ShopProductManagement from "@/domains/shop/pages/ShopProductManagement";
import ShopAddProduct from "@/domains/shop/pages/ShopAddProduct";
import ShopOrderManagement from "@/domains/shop/pages/ShopOrderManagement";
import ShopOrderDetail from "@/domains/shop/pages/ShopOrderDetail";
import ShopVoucherManagement from "@/domains/shop/pages/ShopVoucherManagement";
import AdminProduct from "@/domains/admin/pages/AdminProduct";
import AdminCategory from "@/domains/admin/pages/AdminCategory";
import AdminDashBoard from "@/domains/admin/pages/AdminDashBoard";
import AdminOrder from "@/domains/admin/pages/AdminOrder";
import AdminOrderDetail from "@/domains/admin/pages/AdminOrderDetail";
import AdminShop from "@/domains/admin/pages/AdminShop";
import AdminUser from "@/domains/admin/pages/AdminUser";
import MyProfile from "@/domains/customer/pages/MyProfile";
import ChangePassword from "@/domains/customer/pages/ChangePassword";
import Address from "@/domains/customer/pages/Address";
import MyOrder from "@/domains/customer/pages/MyOrder";
import MyOrderDetail from "@/domains/customer/pages/MyOrderDetail";
import ShoppingCart from "@/domains/customer/pages/ShoppingCart";
import Wishlist from "@/domains/customer/pages/Wishlist";
import Checkout from "@/domains/order/pages/Checkout";
import CompleteOrder from "@/domains/order/pages/CompleteOrder";
import ProtectedRoute from "@/app/routes/ProtectedRoute";
import GuestRoute from "@/app/routes/GuestRoute";
import StorefrontRoute from "@/app/routes/StorefrontRoute";
import WildcardRoute from "@/app/routes/WildcardRoute";

/**
 * router - Cau hinh toan bo routing cua ung dung bang createBrowserRouter.
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
    path: "/cart",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ShoppingCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shopping-cart",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <ShoppingCart />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order/checkout",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <Checkout />
      </ProtectedRoute>
    ),
  },
  {
    path: "/complete-order",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <CompleteOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order/complete",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <CompleteOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/order-complete",
    element: (
      <ProtectedRoute allowedRoles={["client", "CLIENT"]}>
        <CompleteOrder />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wishlist",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <Wishlist />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-wishlist",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <Wishlist />
      </ProtectedRoute>
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
    path: "/shop/products/add",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopAddProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/product/add",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopAddProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/add-product",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopAddProduct />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/orders",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopOrderManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/order",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopOrderManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/orders/:id",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/order/:id",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopOrderDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/vouchers",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopVoucherManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/voucher",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopVoucherManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/promotions",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopVoucherManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shop/promotion",
    element: (
      <ProtectedRoute allowedRoles={["seller", "SELLER"]}>
        <ShopVoucherManagement />
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
    path: "/select-role",
    element: (
      <ProtectedRoute>
        <RoleSelectionPage />
      </ProtectedRoute>
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
    path: "/admin/users",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/user",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/customers",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/customer",
    element: (
      <ProtectedRoute allowedRoles={["admin", "ADMIN"]}>
        <AdminUser />
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
