import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CustomerLayout from "../../layout/CustomerLayout";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import AddressList from "../../components/profile/address/AddressList";
import AddressForm from "../../components/profile/address/AddressForm";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchUserProfile } from "../../redux/slices/user/profileSlice";
import {
  fetchAddresses,
  openCreateForm,
  clearAddressMessages,
} from "../../redux/slices/user/addressSlice";

export const Address: React.FC = () => {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLDivElement>(null);

  const { profile } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);
  const { isFormOpen, successMessage, error } = useAppSelector(
    (state) => state.address
  );

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
            <span>Home</span>
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <Link to="/profile" className="hover:text-primary transition-colors">
            My Account
          </Link>
          <span className="material-symbols-outlined text-outline text-[14px]">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold">Address Book</span>
        </nav>

        {/* Page Header matching address.html */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 sm:mb-8 border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                Account Management
              </span>
              <span className="text-outline text-body-sm">• Vietnam Marketplace Hub</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Sổ Địa Chỉ (Address Book)
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Quản lý các điểm giao nhận hàng hóa của bạn để trải nghiệm thanh toán 1-chạm nhanh chóng và an toàn.
            </p>
          </div>

          {/* Quick stats badge strip */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                local_shipping
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline leading-tight">
                  Default Courier
                </span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  GHTK Express (COD)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-primary text-[20px]">
                verified
              </span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline leading-tight">
                  Security Level
                </span>
                <span className="font-label-md text-label-md text-primary font-semibold">
                  Tier 3 (Protected)
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
              <span className="font-medium text-sm">{successMessage}</span>
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
                  Danh Sách Địa Chỉ Nhận Hàng
                </h2>
                <p className="text-on-surface-variant font-body-sm text-body-sm mt-0.5">
                  Chọn địa chỉ nhận hàng mặc định hoặc bổ sung địa chỉ giao tận nơi mới.
                </p>
              </div>

              {/* Requirement: Thêm 1 nút thêm địa chỉ, khi ấn vào nút này sẽ hiển thị thêm 1 khung form */}
              <button
                type="button"
                id="btn-add-address"
                onClick={handleOpenAddForm}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">add_location_alt</span>
                <span>+ Thêm địa chỉ mới</span>
              </button>
            </div>

            {/* Reactive Address Form (Visible when isFormOpen === true) */}
            {isFormOpen && (
              <div ref={formRef} className="animate-fadeIn">
                <AddressForm />
              </div>
            )}

            {/* Address List */}
            <AddressList onAddNewClick={handleOpenAddForm} />
          </main>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Address;
