import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { openLogoutModal } from "@/domains/auth/state/authSlice";
import { getDefaultAvatar } from "@/shared/utils/avatar";
import { fetchCart, resetCart } from "@/domains/customer/state/cartSlice";
import { fetchWishlist, resetWishlist } from "@/domains/customer/state/wishlistSlice";
import { formatCurrencyVND } from "@/shared/utils/currency";
import { BrandIcon } from "@/shared/components/common/BrandLogo";
import SwitchToShopModal from "@/shared/components/common/SwitchToShopModal";

export interface HeaderProps {
  cartItemCount?: number;
  cartTotal?: string;
  wishlistCount?: number;
}

const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  cartTotal = "₫0",
  wishlistCount = 0,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);
  const cartState = useAppSelector((state) => state.cart);
  const wishlistState = useAppSelector((state) => state.wishlist);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSwitchShopModalOpen, setIsSwitchShopModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userAvatar =
    profile?.avatar_url || user?.avatar_url || getDefaultAvatar(user?.full_name || profile?.full_name);
  const userRoles = (
    user?.roles?.length ? user.roles : user?.role ? [user.role] : []
  ).map((v) => String(v).toLowerCase().trim());
  const hasSellerRole = userRoles.includes("seller");

  const handleOpenSwitchShop = () => {
    setShowUserMenu(false);
    setIsMobileDrawerOpen(false);
    setIsSwitchShopModalOpen(true);
  };

  const handleConfirmSwitchShop = () => {
    setIsSwitchShopModalOpen(false);
    navigate("/shop/dashboard");
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (!cartState?.isInitialized && !cartState?.isLoading && !cartState?.loading) {
        dispatch(fetchCart());
      }
      if (!wishlistState?.isInitialized && !wishlistState?.isLoading && !wishlistState?.loading) {
        dispatch(fetchWishlist());
      }
    } else {
      if ((cartState?.items && cartState.items.length > 0) || cartState?.isInitialized) {
        dispatch(resetCart());
      }
      if ((wishlistState?.items && wishlistState.items.length > 0) || wishlistState?.isInitialized) {
        dispatch(resetWishlist());
      }
    }
  }, [
    dispatch,
    isAuthenticated,
    user?.id,
    cartState?.isInitialized,
    cartState?.isLoading,
    cartState?.loading,
    cartState?.items,
    wishlistState?.isInitialized,
    wishlistState?.isLoading,
    wishlistState?.loading,
    wishlistState?.items,
  ]);

  // Đóng user dropdown menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const displayCartCount =
    cartItemCount > 0
      ? cartItemCount
      : cartState?.summary?.total_items || cartState?.item_count || 0;
  const displayCartTotal =
    cartTotal !== "₫0"
      ? cartTotal
      : cartState?.summary?.grand_total
      ? formatCurrencyVND(cartState.summary.grand_total)
      : cartState?.subtotal
      ? formatCurrencyVND(cartState.subtotal)
      : "₫0";
  const displayWishlistCount =
    wishlistCount > 0
      ? wishlistCount
      : wishlistState?.items?.length || wishlistState?.total || 0;

  // Khóa cuộn trang khi mở sidebar trên màn hình điện thoại
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Đóng sidebar và user menu khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileDrawerOpen(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenLogout = () => {
    setShowUserMenu(false);
    setIsMobileDrawerOpen(false);
    dispatch(openLogoutModal());
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
        {/* Top Utility Bar (Ẩn hoàn toàn trên màn hình điện thoại theo yêu cầu) */}
        <div className="hidden md:block w-full bg-inverse-surface text-inverse-on-surface text-body-sm font-body-sm">
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
          {/* Mobile Header (md:hidden) – Hiển thị 1 icon 3 dấu gạch ngang và thanh tìm kiếm */}
          <div className="flex md:hidden h-16 px-4 items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 -ml-1.5 rounded-xl text-on-surface hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <span className="material-symbols-outlined text-[28px]">menu</span>
            </button>

            <div className="flex-1 relative flex items-center h-10 rounded-xl bg-surface-container-low border border-outline-variant focus-within:border-primary-container px-3 gap-2 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
                search
              </span>
              <input
                className="w-full bg-transparent text-on-surface placeholder:text-outline text-body-sm font-body-sm focus:outline-none"
                placeholder="Search 12,000+ artisan stores & products..."
                type="text"
              />
            </div>
          </div>

          {/* Desktop Header (hidden md:flex) */}
          <div className="hidden md:flex h-20 max-w-[1440px] mx-auto px-margin-lg items-center justify-between gap-gutter">
            {/* Logo */}
            <div className="flex items-center gap-space-md shrink-0">
              <Link className="flex items-center gap-space-sm" to="/home">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                  <BrandIcon className="w-6 h-6 text-on-primary" />
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

            {/* Right Action Icons - Chỉ hiển thị Wishlist và Giỏ hàng khi đã đăng nhập */}
            <div className="flex items-center gap-space-md shrink-0">
              {isAuthenticated && (
                <>
                  <Link
                    className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
                    to="/wishlist"
                    title="Danh sách yêu thích"
                  >
                    <span className="material-symbols-outlined text-[24px]">favorite</span>
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-tertiary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                      {displayWishlistCount}
                    </span>
                  </Link>
                  <Link
                    className="flex items-center gap-space-sm px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all"
                    to="/cart"
                    title="Giỏ hàng"
                  >
                    <div className="relative">
                      <span className="material-symbols-outlined text-primary text-[22px]">
                        shopping_bag
                      </span>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-on-primary text-[10px] font-bold flex items-center justify-center">
                        {displayCartCount}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="font-label-sm text-label-sm text-outline leading-none">Cart</span>
                      <span className="font-label-md text-label-md text-on-surface font-bold">{displayCartTotal}</span>
                    </div>
                  </Link>
                </>
              )}

              {/* User Profile / Auth State */}
              {isAuthenticated && user ? (
                <div ref={userMenuRef} className="relative pl-2">
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
                    <span
                      className={`material-symbols-outlined text-outline text-[16px] transition-transform duration-300 ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xl py-2 z-50 origin-top-right transition-all duration-300 ease-out ${
                      showUserMenu
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
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

                    {hasSellerRole && (
                      <button
                        type="button"
                        onClick={handleOpenSwitchShop}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container hover:text-primary transition-colors cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-[16px]">storefront</span>
                        <span>Gian hàng của tôi</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-error hover:bg-error-container/40 transition-colors text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
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

      {/* Mobile Drawer (Lướt từ trái sang phải gồm 4 phần ở ảnh 2) */}
      {/* Backdrop overlay */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[320px] max-w-[85vw] bg-surface-container-lowest shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile Sidebar"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-outline-variant/60 flex items-center justify-between">
          <Link
            to="/home"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs">
              <BrandIcon className="w-5 h-5 text-on-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-base tracking-tight text-on-surface font-bold leading-none">
                MarketPulse
              </span>
              <span className="text-[9px] tracking-widest uppercase font-bold text-secondary">
                Vietnam Hub
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Drawer Content: 4 phần từ ảnh thứ 2 */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline px-1">
              Tính năng người dùng
            </span>

            {/* Phần 4: Thông tin tài khoản người dùng */}
            {isAuthenticated && user ? (
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 bg-surface-container flex items-center justify-center">
                      <img
                        src={userAvatar}
                        alt={user.full_name || "User Avatar"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-surface-container-lowest"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-on-surface text-sm truncate">
                      {user.full_name || "Hoàng Minh Quang"}
                    </p>
                    <p className="text-xs text-outline truncate">
                      {user.email || user.phone || "Khách hàng thân thiết"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/50 flex flex-col gap-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex items-center justify-between px-2 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        person
                      </span>
                      <span>Hồ sơ của tôi</span>
                    </span>
                    <span className="material-symbols-outlined text-outline text-[16px]">
                      chevron_right
                    </span>
                  </Link>

                  {hasSellerRole && (
                    <button
                      type="button"
                      onClick={handleOpenSwitchShop}
                      className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          storefront
                        </span>
                        <span>Gian hàng của tôi</span>
                      </span>
                      <span className="material-symbols-outlined text-outline text-[16px]">
                        chevron_right
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenLogout}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/40 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Đăng xuất</span>
                    </span>
                    <span className="material-symbols-outlined text-outline text-[16px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-on-surface text-sm">Chào mừng bạn</p>
                  <p className="text-xs text-outline">Đăng nhập để trải nghiệm đầy đủ</p>
                </div>
                <Link
                  to="/login"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            {/* Phần 3 & 2: Giỏ hàng (Cart) & Yêu thích (Wishlist) chỉ hiển thị khi đã đăng nhập */}
            {isAuthenticated && (
              <>
                <Link
                  to="/cart"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F0F2FD] hover:bg-[#E5E9FA] border border-[#2E3192]/15 transition-all text-on-surface cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-white text-[#2E3192] flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[22px] text-[#2E3192]">
                        shopping_bag
                      </span>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2E3192] text-white text-[10px] font-bold flex items-center justify-center">
                        {displayCartCount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-outline font-medium">Giỏ hàng ({displayCartCount})</span>
                      <span className="text-sm font-bold text-on-surface">{displayCartTotal}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    chevron_right
                  </span>
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/60 transition-all text-on-surface cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-red-50 text-[#9E0038] flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[22px] text-red-500">
                        favorite
                      </span>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9E0038] text-white text-[10px] font-bold flex items-center justify-center">
                        {displayWishlistCount}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-on-surface">Yêu thích</span>
                      <span className="text-xs text-outline">{displayWishlistCount} sản phẩm đã lưu</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    chevron_right
                  </span>
                </Link>
              </>
            )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-outline-variant/50 text-[11px] text-outline text-center">
          MarketPulse © 2026 – Nền tảng thương mại điện tử
        </div>
      </aside>

      <SwitchToShopModal
        isOpen={isSwitchShopModalOpen}
        onClose={() => setIsSwitchShopModalOpen(false)}
        onConfirm={handleConfirmSwitchShop}
        userName={user?.full_name}
      />
    </>
  );
};

export default Header;
