import React, { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { openLogoutModal } from "@/domains/auth/state/authSlice";
import { fetchShopOrderCountsThunk } from "@/domains/shop/state/shopOrderSlice";
import { APP_CONFIG } from "@/shared/config/appConfig";
import { BrandIcon } from "@/shared/components/common/BrandLogo";

interface ShopLayoutProps {
  children: ReactNode;
}

export const ShopLayout: React.FC<ShopLayoutProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  const pendingOrders = useAppSelector((state) => state.shopOrder.counts.pending);
  const totalProducts = useAppSelector((state) => state.shopProduct.total);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchShopOrderCountsThunk());
    }
  }, [dispatch, isAuthenticated]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setQuickSearch("");
  }

  // Seller Center requires both an assigned SELLER role and an ACTIVE shop.
  if (isInitialized) {
    const userRoles = user?.roles?.length
      ? user.roles
      : user?.role
        ? [user.role]
        : [];
    if (!isAuthenticated || !userRoles.includes("seller") || user?.shop_status !== "ACTIVE") {
      return <Navigate to="/register-open-shop" replace />;
    }
  }

  const handleOpenLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openLogoutModal());
  };

  const navItems = [
    { label: "Tổng quan", path: "/shop/dashboard", icon: "space_dashboard" },
    {
      label: "Quản lý sản phẩm",
      path: "/shop/products",
      icon: "inventory_2",
      badge: totalProducts > 0 ? String(totalProducts) : undefined,
    },
    {
      label: "Đơn hàng & Vận chuyển",
      path: "/shop/orders",
      icon: "local_shipping",
      badge: pendingOrders > 0 ? (pendingOrders > 99 ? "99+ mới" : `${pendingOrders} mới`) : undefined,
      badgeVariant: "error" as const,
    },
    { label: "Quản lý voucher", path: "/shop/vouchers", icon: "confirmation_number" },
    { label: "Ví & Doanh thu", path: "/shop/finances", icon: "account_balance_wallet" },
    {
      label: "Chăm sóc khách",
      path: "/shop/customer-chat",
      icon: "chat",
      badge: "3",
      badgeVariant: "secondary" as const,
    },
    { label: "Cài đặt gian hàng", path: "/shop/settings", icon: "settings" },
  ];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased">
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation - Style matching AdminLayout */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Brand Logo & Shop Info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <BrandIcon className="w-6 h-6 text-on-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-headline-md text-headline-md leading-none text-white tracking-tight font-bold truncate">
                MarketPulse Studio
              </h1>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant/70 mt-1 font-semibold truncate">
                Kênh Người Bán • {APP_CONFIG.appName}
              </p>
            </div>
          </div>

          {/* Shop Status & Tier Ribbon */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-surface-container-highest/10 rounded-xl border border-outline-variant/10">
            <div className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-secondary-fixed">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
              Active Merchant
            </div>
            <span className="font-label-sm text-label-sm text-primary-fixed-dim bg-primary-container/40 px-2 py-0.5 rounded font-mono font-bold">
              Cấp 3
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5 mt-1">
            {navItems.map((item) => {
              const isDashboard =
                location.pathname === "/shop" || location.pathname === "/shop/dashboard";
              const isActive =
                (item.path === "/shop/dashboard" && isDashboard) ||
                (item.path !== "/shop/dashboard" && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl font-label-lg text-label-lg transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary font-bold shadow-sm"
                      : "text-inverse-on-surface/75 hover:bg-inverse-surface/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[22px] shrink-0 ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-bold font-mono leading-tight tracking-tight flex items-center justify-center ${
                        item.badgeVariant === "error"
                          ? "bg-error text-on-error shadow-xs"
                          : item.badgeVariant === "secondary"
                          ? "bg-secondary-container text-on-secondary-container"
                          : isActive
                          ? "bg-white/20 text-on-primary"
                          : "bg-surface-container-highest/20 text-inverse-on-surface/80"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
          <div className="bg-surface-container-highest/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-on-primary text-[20px]">
                  store
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md text-white truncate font-medium">
                  {user?.full_name || "Tiệm Gốm An Nhiên"}
                </p>
                <p className="font-label-sm text-label-sm text-surface-variant/60 truncate uppercase font-semibold">
                  {user?.role ? `${user.role} Partner` : "Seller Merchant"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenLogout}
              className="p-1.5 text-inverse-on-surface/60 hover:text-white hover:bg-inverse-surface/80 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Fixed Topbar Header matching AdminLayout */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
              aria-label="Mở menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <span className="font-medium text-on-surface-variant">Kênh Người Bán</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-semibold text-on-surface">
                {location.pathname.startsWith("/shop/product")
                  ? "Quản lý sản phẩm"
                  : location.pathname.startsWith("/shop/order")
                  ? "Đơn hàng & Vận chuyển"
                  : location.pathname.startsWith("/shop/voucher") || location.pathname.startsWith("/shop/promotion")
                  ? "Quản lý voucher"
                  : location.pathname.startsWith("/shop/finance")
                  ? "Ví & Doanh thu"
                  : location.pathname.startsWith("/shop/setting")
                  ? "Cài đặt gian hàng"
                  : "Dashboard"}
              </span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>Cửa hàng: Đang mở cửa</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Search matching Admin Header */}
            <div className="relative hidden md:block w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, SKU..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-14 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] border border-outline-variant/30 focus:border-primary"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-mono">
                Ctrl+K
              </kbd>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                title="Thông báo"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              </button>
              <button
                type="button"
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                title="Tin nhắn khách hàng"
              >
                <span className="material-symbols-outlined text-[22px]">chat</span>
              </button>
              <button
                type="button"
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                title="Trợ giúp"
              >
                <span className="material-symbols-outlined text-[22px]">help_outline</span>
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center pl-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="w-full pt-16 bg-background px-gutter min-h-screen">
          <div className="flex flex-col w-full pb-16">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;
