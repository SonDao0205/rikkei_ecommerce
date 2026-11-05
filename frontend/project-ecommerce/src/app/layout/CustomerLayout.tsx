import React, { type ReactNode } from "react";
import Header from "@/shared/components/common/Header";
import Footer from "@/shared/components/common/Footer";

interface CustomerLayoutProps {
  children: ReactNode;
  cartItemCount?: number;
  cartTotal?: string;
  wishlistCount?: number;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  children,
  cartItemCount = 0,
  cartTotal = "₫0",
  wishlistCount = 0,
}) => {
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
