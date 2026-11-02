import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import { openLogoutModal } from "../../redux/slices/auth/authSlice";
import { setLocalAvatarPreview } from "../../redux/slices/user/profileSlice";
import { getDefaultAvatar } from "../../utils/avatar";
import type { UserProfileDetails } from "../../types/ecommerce";

interface ProfileSidebarProps {
  profile: UserProfileDetails | null;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: string;
  badgeType?: "primary" | "tertiary" | "dot" | "text";
  subtext?: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profile,
  activeTab = "personal-profile",
  onTabChange,
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAvatar = getDefaultAvatar(profile?.full_name);

  const navItems: NavItem[] = [
    {
      id: "personal-profile",
      label: "My Profile",
      icon: "person",
      href: "/profile",
      badgeType: "dot",
    },
    {
      id: "change-password",
      label: "Change Password",
      icon: "lock_reset",
      href: "/profile/change-password",
      subtext: "Đổi MK",
    },
    {
      id: "address-book",
      label: "Address Book",
      icon: "location_on",
      href: "/profile/address",
      subtext: "Địa chỉ",
    },
    {
      id: "my-orders",
      label: "My Orders",
      icon: "shopping_bag",
      href: "#my-orders",
      badge: "2 Active",
      badgeType: "primary",
    },
    {
      id: "voucher-wallet",
      label: "Voucher Wallet",
      icon: "confirmation_number",
      href: "#voucher-wallet",
      badge: "4 Có sẵn",
      badgeType: "tertiary",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
      href: "#notifications",
      badgeType: "dot",
    },
  ];

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          dispatch(setLocalAvatarPreview(reader.result));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openLogoutModal());
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-[136px] space-y-4">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Profile Identity Card */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden border border-outline-variant/30">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none" />

        {/* Avatar with Camera Change Trigger */}
        <div
          className="relative mb-5 group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title="Bấm để thay đổi ảnh đại diện"
        >
          <div className="w-20 h-20 rounded-full ring-4 ring-primary-fixed overflow-hidden bg-surface-container flex items-center justify-center shadow-md">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              alt={profile?.full_name || "Profile Avatar"}
              src={profile?.avatar_url || defaultAvatar}
            />
          </div>
          <button
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow hover:bg-primary-container transition-transform active:scale-95 cursor-pointer z-10"
            title="Update profile picture"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">photo_camera</span>
          </button>
        </div>

        {/* User Identity Info */}
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight mt-1.5">
          {profile?.full_name || "Nguyễn Văn A"}
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate max-w-[200px]">
          {profile?.email || profile?.phone || "nguyen.vana@marketpulse.vn"}
        </p>

        {/* Membership Tier Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
          <span className="material-symbols-outlined text-[14px]">stars</span>
          <span>{profile?.membership_tier || "Thành Viên Thân Thiết"}</span>
        </div>

        {/* Navigation Links using .map() */}
        <nav className="w-full mt-6 pt-5 border-t border-surface-container space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const linkClasses = `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-md text-label-md transition-all ${
              isActive
                ? "bg-primary-fixed text-primary font-bold shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`;

            const content = (
              <>
                <span className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>

                {/* Badges / Subtext indicator */}
                {isActive && item.badgeType === "dot" && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
                {!isActive && item.subtext && (
                  <span className="font-body-sm text-body-sm text-outline">
                    {item.subtext}
                  </span>
                )}
                {!isActive && item.badgeType === "primary" && item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm">
                    {item.badge}
                  </span>
                )}
                {!isActive && item.badgeType === "tertiary" && item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                    {item.badge}
                  </span>
                )}
                {!isActive && item.id === "notifications" && item.badgeType === "dot" && (
                  <span className="w-2 h-2 rounded-full bg-error" />
                )}
              </>
            );

            if (item.href.startsWith("/")) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => onTabChange && onTabChange(item.id)}
                  className={linkClasses}
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={linkClasses}
              >
                {content}
              </a>
            );
          })}

          {/* Logout Action Button */}
          <div className="pt-4 mt-4 border-t border-surface-container">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors font-label-md text-label-md text-left cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
