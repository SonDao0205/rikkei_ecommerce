import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomerLayout from "@/app/layout/CustomerLayout";
import ProfileSidebar from "@/domains/customer/components/profile/ProfileSidebar";
import AddressList from "@/domains/customer/components/profile/address/AddressList";
import AddressForm from "@/domains/customer/components/profile/address/AddressForm";
import DeleteAddressModal from "@/domains/customer/components/profile/address/DeleteAddressModal";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { fetchUserProfile } from "@/domains/customer/state/profileSlice";
import {
  fetchAddresses,
  openCreateForm,
  clearAddressMessages,
  deleteAddressThunk,
} from "@/domains/customer/state/addressSlice";
import type { Address as AddressItem } from "@/domains/customer/types/address.types";

export const Address: React.FC = () => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLDivElement>(null);

  const { profile } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);
  const { addresses, isFormOpen, successMessage, error } = useAppSelector(
    (state) => state.address
  );

  // State cho popup xác nhận xóa địa chỉ
  const [addressToDelete, setAddressToDelete] = useState<AddressItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Scroll to form when opened
  useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isFormOpen]);

  // Auto clear notifications after 5s
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearAddressMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const mergedProfile = profile
    ? {
        ...profile,
        full_name: user?.full_name || profile.full_name,
        email: user?.email || profile.email,
        phone: user?.phone || profile.phone,
        role: user?.role || profile.role,
      }
    : null;

  const handleOpenAddForm = () => {
    dispatch(openCreateForm());
  };

  const handleConfirmDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteAddressThunk(addressToDelete.id)).unwrap();
      setAddressToDelete(null);
    } catch {
      // Error message is stored in addressSlice.error
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSuccessMessage = (msg: string | null) => {
    if (!msg) return null;
    if (msg.includes("Thêm địa chỉ")) return t("profile.address.messages.add_success");
    if (msg.includes("Cập nhật địa chỉ")) return t("profile.address.messages.update_success");
    if (msg.includes("xóa địa chỉ")) return t("profile.address.messages.delete_success");
    if (msg.includes("mặc định")) return t("profile.address.messages.set_default_success");
    return msg;
  };

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
            <span>{t("profile.address.breadcrumb.home")}</span>
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <Link to="/profile" className="hover:text-primary transition-colors">
            {t("profile.address.breadcrumb.account")}
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">
            {t("profile.address.breadcrumb.address_book")}
          </span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 sm:mb-8 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                {t("profile.address.header.badge")}
              </span>
              <span className="text-outline text-body-sm">
                • {t("profile.address.header.hub")}
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              {t("profile.address.header.title")}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {t("profile.address.header.desc")}
            </p>
          </div>

          {/* Account address summary */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                location_on
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline leading-tight">
                  {t("profile.address.header.saved_addresses")}
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {addresses.length} / 20
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-primary text-[20px]">
                lock
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline leading-tight">
                  {t("profile.address.header.access_role")}
                </span>
                <span className="font-label-md text-label-md text-primary font-semibold">
                  {t("profile.address.header.account_owner")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                check_circle
              </span>
              <span className="font-medium text-sm">{formatSuccessMessage(successMessage)}</span>
            </div>
            <button
              onClick={() => dispatch(clearAddressMessages())}
              className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
        {error && addresses.length > 0 && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-error-container text-on-error-container flex items-center justify-between"
          >
            <span className="font-medium text-sm">{error}</span>
            <button
              onClick={() => dispatch(clearAddressMessages())}
              className="hover:opacity-70 cursor-pointer"
              type="button"
              aria-label={t("profile.address.alerts.close_error")}
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-[20px]">
                error
              </span>
              <span className="font-medium text-sm">{error}</span>
            </div>
            <button
              onClick={() => dispatch(clearAddressMessages())}
              className="text-red-600 hover:text-red-900 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Main Two-Column Structure */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* LEFT SIDEBAR (Sticky Navigation) */}
          <ProfileSidebar
            profile={mergedProfile}
            activeTab="address-book"
          />

          {/* RIGHT MAIN CONTENT */}
          <main className="flex-1 w-full space-y-6 min-w-0">
            {/* Top Action Bar */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-on-surface font-headline-md text-headline-md font-bold leading-tight">
                  {t("profile.address.list.title")}
                </h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  {t("profile.address.list.desc")}
                </p>
              </div>

              <button
                type="button"
                id="btn-add-address"
                onClick={handleOpenAddForm}
                disabled={addresses.length >= 20}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
                <span>
                  {addresses.length >= 20
                    ? t("profile.address.list.limit_reached")
                    : t("profile.address.list.add_new_btn")}
                </span>
              </button>
            </div>

            {/* Reactive Address Form (Visible when isFormOpen === true) */}
            {isFormOpen && (
              <div ref={formRef} className="animate-fadeIn">
                <AddressForm />
              </div>
            )}

            {/* Address List */}
            <AddressList
              onAddNewClick={handleOpenAddForm}
              onRetry={() => dispatch(fetchAddresses())}
              onDeleteClick={(addr) => setAddressToDelete(addr)}
            />
          </main>
        </div>
      </div>

      {/* Popup xác nhận xóa địa chỉ */}
      <DeleteAddressModal
        isOpen={Boolean(addressToDelete)}
        address={addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </CustomerLayout>
  );
};

export default Address;
