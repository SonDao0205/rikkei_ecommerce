import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useAppSelector } from "../redux/store";

interface CustomerLayoutProps {
  children: ReactNode;
  cartItemCount?: number;
  cartTotal?: string;
  wishlistCount?: number;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  cartItemCount = 2,
  cartTotal = "₫1.450.000",
  wishlistCount = 3,
}) => {
  const { isAuthenticated, role, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Safeguard: Seller và Admin tuyệt đối không truy cập giao diện khách hàng
  if (isInitialized && isAuthenticated) {
    const userRole = (role || "").toLowerCase().trim();
    if (userRole === "seller") {
      return <Navigate to="/shop/dashboard" replace />;
    }
    if (userRole === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistCount}
      />
      <main className="w-full pt-16 md:pt-[116px] lg:pt-[120px] bg-background flex-1">
        <div className="flex flex-col w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
