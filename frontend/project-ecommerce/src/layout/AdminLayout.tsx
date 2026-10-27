import React, { type ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { openLogoutModal } from "../redux/slices/authSlice";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  if (isInitialized && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleOpenLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openLogoutModal());
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "space_dashboard" },
    { label: "Products", path: "/admin/products", icon: "inventory_2" },
    { label: "Orders", path: "/admin/orders", icon: "local_shipping" },
    { label: "Customers / Users", path: "/admin/customers", icon: "group" },
    { label: "Settings", path: "/admin/settings", icon: "settings" },
  ];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md leading-none text-white tracking-tight font-bold">
                MarketPulse
              </h1>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant/70 mt-1 font-semibold">
                MarketPulse Admin
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive =
                item.path === location.pathname ||
                (item.path === "/admin/products" &&
                  (location.pathname === "/admin" || location.pathname.startsWith("/admin/product")));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-label-lg text-label-lg transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary font-bold shadow-sm"
                      : "text-inverse-on-surface/75 hover:bg-inverse-surface/80 hover:text-white"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive ? "text-white" : ""
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4">
          <div className="bg-surface-container-highest/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">
                  admin_panel_settings
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-label-md text-label-md text-white truncate font-medium">
                  {user?.full_name || "Nguyen Admin"}
                </p>
                <p className="font-label-sm text-label-sm text-surface-variant/60 truncate uppercase">
                  {user?.role ? `${user.role} Account` : "Super Admin"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenLogout}
              className="p-1.5 text-inverse-on-surface/60 hover:text-white hover:bg-inverse-surface/80 rounded-lg transition-colors cursor-pointer"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-72">
        {/* Fixed Topbar */}
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter border-b border-outline-variant/20">
          <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <span className="font-medium text-on-surface-variant">Admin</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="font-semibold text-on-surface">Products</span>
          </div>

          <div className="flex items-center gap-5">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search catalog, orders..."
                className="w-full h-10 pl-9 pr-14 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                Ctrl+K
              </kbd>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
              </button>
              <button
                type="button"
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">help_outline</span>
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center pl-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
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

export default AdminLayout;
