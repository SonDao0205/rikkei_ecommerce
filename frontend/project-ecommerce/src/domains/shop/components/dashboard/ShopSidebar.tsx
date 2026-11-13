import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/state/store";
import { BrandIcon } from "@/shared/components/common/BrandLogo";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  badgeVariant?: "default" | "error" | "secondary";
  to?: string;
}


interface ShopSidebarProps {
  currentPath?: string;
  onSelectNav?: (path: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ShopSidebar: React.FC<ShopSidebarProps> = ({
  currentPath = "dashboard",
  onSelectNav,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, role } = useAppSelector((state) => state.auth);
  const pendingOrders = useAppSelector((state) => state.shopOrder.counts.pending);

  const navItems: NavItem[] = [
    { path: "dashboard", label: "Tổng quan", icon: "grid_view", to: "/shop/dashboard" },
    { path: "products", label: "Quản lý sản phẩm", icon: "inventory_2" },
    {
      path: "orders",
      label: "Đơn hàng & Vận chuyển",
      icon: "local_shipping",
      badge: pendingOrders > 0 ? (pendingOrders > 99 ? "99+ mới" : `${pendingOrders} mới`) : undefined,
      badgeVariant: "error",
      to: "/shop/orders",
    },
    { path: "vouchers", label: "Quản lý voucher", icon: "confirmation_number", to: "/shop/vouchers" },
    { path: "finances", label: "Ví & Doanh thu", icon: "account_balance_wallet" },
    { path: "customer-chat", label: "Chăm sóc khách", icon: "chat", badge: "3", badgeVariant: "secondary" },
    { path: "shop-settings", label: "Cài đặt gian hàng", icon: "settings" },
  ];

  const userRoles = new Set(
    (user?.roles?.length ? user.roles : user?.role ? [user.role] : []).map((v) =>
      String(v).toLowerCase().trim()
    )
  );
  if (role) {
    userRoles.add(String(role).toLowerCase().trim());
  }

  const hasCustomerRole =
    userRoles.has("client") ||
    userRoles.has("customer") ||
    userRoles.has("buyer");
  const hasSellerRole = userRoles.has("seller");
  const canSwitchToBuyer = hasCustomerRole && hasSellerRole;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Shop Profile Header */}
          <div className="p-space-md border-b border-outline/20">
            <div className="flex items-center gap-space-sm mb-space-xs">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                <BrandIcon className="w-6 h-6 text-on-primary" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-label-lg text-label-lg text-inverse-on-surface truncate">
                  MarketPulse Studio
                </h1>
                <p className="font-body-sm text-body-sm text-outline-variant truncate">
                  Gốm Sứ &amp; Decor Việt
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-space-sm pt-space-xs">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary-fixed/20 text-secondary-fixed font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                Active Merchant
              </div>
              <span className="font-label-sm text-label-sm text-primary-fixed-dim bg-primary-container/40 px-2 py-0.5 rounded">
                Cấp 3
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-space-sm py-space-md flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              const handleClick = (e: React.MouseEvent) => {
                if (onSelectNav) {
                  onSelectNav(item.path);
                }
                if (onCloseMobile) {
                  onCloseMobile();
                }
                if (!item.to) {
                  e.preventDefault();
                }
              };

              const badgeClasses =
                item.badgeVariant === "error"
                  ? "bg-error text-on-error"
                  : item.badgeVariant === "secondary"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-surface-container-highest/30 text-inverse-on-surface";

              return (
                <Link
                  key={item.path}
                  to={item.to || "#"}
                  onClick={handleClick}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between gap-2 px-space-sm py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-on-primary font-label-lg shadow-sm"
                      : "text-inverse-on-surface/80 hover:bg-surface-container-highest/20 hover:text-inverse-on-surface font-label-lg"
                  }`}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                    <span className="font-label-lg text-label-lg truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap ${badgeClasses}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Customer Portal Return */}
        <div className="p-space-md border-t border-outline/20 flex flex-col gap-space-sm">
          {canSwitchToBuyer && (
            <Link
              to="/home"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-container-highest/10 hover:bg-surface-container-highest/20 text-inverse-on-surface/85 hover:text-white transition-all text-xs font-semibold border border-outline-variant/15 group cursor-pointer shadow-xs"
              title="Quay lại giao diện mua sắm"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-fixed group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Quay lại trang mua hàng</span>
            </Link>
          )}

          <div className="flex items-center justify-between px-space-xs font-body-sm text-body-sm text-outline-variant">
            <span>Hotline hỗ trợ:</span>
            <span className="font-label-md text-label-md text-inverse-on-surface">1900 6868</span>
          </div>
        </div>
      </aside>
    </>
  );
};
export default ShopSidebar;
