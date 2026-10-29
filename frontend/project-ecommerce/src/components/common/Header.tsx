import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { openLogoutModal } from "../../redux/slices/auth/authSlice";
import { getDefaultAvatar } from "../../utils/avatar";

interface HeaderProps {
  cartItemCount?: number;
  cartTotal?: string;
  wishlistCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  cartItemCount = 2,
  cartTotal = "₫1.450.000",
  wishlistCount = 3,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userAvatar =
    profile?.avatar_url || user?.avatar_url || getDefaultAvatar(user?.full_name || profile?.full_name);

  const handleOpenLogout = () => {
    setShowUserMenu(false);
    dispatch(openLogoutModal());
  };
  return (
    <header className="fixed top-0 w-full z-50 shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
      {/* Top Utility Bar */}
      <div className="w-full bg-inverse-surface text-inverse-on-surface text-body-sm font-body-sm">
        <div className="max-w-[1440px] mx-auto px-margin-lg h-9 flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-secondary-fixed text-[16px]">
              local_shipping
            </span>
            <span>Free shipping on orders over 500k ₫ | Cash on Delivery available across Vietnam</span>
          </div>
          <div className="flex items-center gap-space-lg text-body-sm">
            <a className="flex items-center gap-1 hover:text-white transition-colors" href="tel:19006868">
              <span className="material-symbols-outlined text-[15px]">support_agent</span>
              <span>+84 1900 6868</span>
            </a>
            <span className="text-outline">|</span>
            <Link className="flex items-center gap-1 hover:text-white transition-colors" to="#">
              <span className="material-symbols-outlined text-[15px]">inventory_2</span>
              <span>Order Tracking</span>
            </Link>
            <span className="text-outline">|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-white">
              <span className="material-symbols-outlined text-[15px]">language</span>
              <span>VN / EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant">
        <div className="h-20 max-w-[1440px] mx-auto px-margin-lg flex items-center justify-between gap-gutter">
          {/* Logo */}
          <div className="flex items-center gap-space-md shrink-0">
            <Link className="flex items-center gap-space-sm" to="/home">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[24px]">
                  deployed_code
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-bold leading-none">
                  MarketPulse
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-secondary">
                  Vietnam Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary-container focus-within:border-primary-container transition-all">
              <div className="flex items-center gap-1 pl-space-md pr-space-sm text-on-surface-variant font-label-md text-label-md shrink-0 border-r border-outline-variant cursor-pointer">
                <span>All Categories</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
              <div className="flex items-center flex-1 px-space-md gap-space-sm">
                <span className="material-symbols-outlined text-outline text-[20px]">search</span>
                <input
                  className="w-full bg-transparent text-on-surface placeholder:text-outline text-body-md font-body-md focus:outline-none"
                  placeholder="Search 12,000+ verified artisan stores & products..."
                  type="text"
                />
              </div>
              <div className="pr-2 shrink-0 flex items-center gap-space-sm">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-label-sm text-on-surface-variant bg-surface-container rounded">
                  ⌘K
                </kbd>
                <button className="h-8 px-space-md bg-primary-container text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-space-md shrink-0">
            <Link
              className="hidden lg:inline-flex items-center gap-1 px-space-md py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
              to="#"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </Link>
            <Link
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
              to="#"
            >
              <span className="material-symbols-outlined text-[24px]">favorite</span>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-tertiary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            </Link>
            <Link
              className="flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all"
              to="#"
            >
              <div className="relative">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  shopping_bag
                </span>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                  {cartItemCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-sm text-label-sm text-outline leading-none">Cart</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">{cartTotal}</span>
              </div>
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated && user ? (
              <div className="relative pl-2">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-space-sm cursor-pointer p-1 rounded-xl hover:bg-surface-container transition-all"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-outline-variant bg-surface-container flex items-center justify-center">
                      <img
                        src={userAvatar}
                        alt={user.full_name || "User Avatar"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-surface-container-lowest"></span>
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="font-label-md text-label-md text-on-surface font-bold leading-tight">
                      {user.full_name}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    {showUserMenu ? "expand_less" : "expand_more"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-lg py-2 z-50">
                    <div className="px-3.5 py-2.5 border-b border-surface-container text-xs flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-outline-variant bg-surface-container flex items-center justify-center">
                        <img
                          src={userAvatar}
                          alt={user.full_name || "User Avatar"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-on-surface truncate">{user.full_name}</p>
                        <p className="text-outline truncate">{user.email || user.phone}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      <span>Hồ sơ của tôi</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleOpenLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-error hover:bg-error-container/40 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors font-bold shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
