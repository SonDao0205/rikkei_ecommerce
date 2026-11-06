import React, { type ReactNode } from "react";
import { useAppSelector } from "@/app/state/store";

interface StorefrontRouteProps {
  children: ReactNode;
}

/**
 * Route Guard cho các trang storefront bán hàng (ví dụ: Trang chủ / và /home, chi tiết sản phẩm):
 * Signed-in users can continue shopping regardless of their additional roles.
 */
export const StorefrontRoute: React.FC<StorefrontRouteProps> = ({ children }) => {
  const { isInitialized } = useAppSelector(
    (state) => state.auth
  );

  // Chờ khôi phục phiên xác thực khi mới mở tab hoặc F5
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-on-surface-variant">
            Đang xác thực phiên làm việc...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StorefrontRoute;
