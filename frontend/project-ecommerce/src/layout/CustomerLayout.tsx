import React, { type ReactNode } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

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
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistCount}
      />
      <main className="w-full pt-[116px] md:pt-[120px] bg-background flex-1">
        <div className="flex flex-col w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
