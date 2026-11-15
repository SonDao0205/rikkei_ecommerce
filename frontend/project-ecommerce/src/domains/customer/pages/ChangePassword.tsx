import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomerLayout from "@/app/layout/CustomerLayout";
import ProfileSidebar from "@/domains/customer/components/profile/ProfileSidebar";
import ProfileSecurityForm from "@/domains/customer/components/profile/ProfileSecurityForm";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { fetchUserProfile } from "@/domains/customer/state/profileSlice";

export const ChangePassword: React.FC = () => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Merge with Redux auth user if available
  const mergedProfile = profile
    ? {
        ...profile,
        full_name: user?.full_name || profile.full_name,
        email: user?.email || profile.email,
        phone: user?.phone || profile.phone,
        role: user?.role || profile.role,
      }
    : null;

  return (
    <CustomerLayout>
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8 sm:pt-4 sm:pb-10">
        {/* Breadcrumb Row */}
        <nav className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-4 sm:mb-5">
          <Link
            to="/home"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>{t("profile.change_password.breadcrumb.home")}</span>
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <Link to="/profile" className="hover:text-primary transition-colors">
            {t("profile.change_password.breadcrumb.account")}
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">
            {t("profile.change_password.breadcrumb.change_password")}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 sm:mb-8 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wider font-bold">
                {t("profile.change_password.header.badge")}
              </span>
              <span className="text-outline text-body-sm">
                • {t("profile.change_password.header.hub")}
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              {t("profile.change_password.header.title")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {t("profile.change_password.header.desc")}
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !mergedProfile ? (
          <div className="flex flex-col lg:flex-row items-start gap-8 animate-pulse">
            <div className="w-full lg:w-72 h-96 bg-surface-container-low rounded-2xl" />
            <div className="flex-1 w-full space-y-6">
              <div className="h-64 bg-surface-container-low rounded-2xl" />
            </div>
          </div>
        ) : (
          /* Main Two-Column Structure */
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* LEFT SIDEBAR (Sticky Navigation) */}
            <ProfileSidebar
              profile={mergedProfile}
              activeTab="change-password"
            />

            {/* RIGHT MAIN CONTENT: Security & Password Form */}
            <div className="flex-1 w-full min-w-0">
              <ProfileSecurityForm />
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ChangePassword;
