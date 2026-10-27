import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  updateUserProfile,
  removeUserAvatar,
  setLocalAvatarPreview,
} from "../../redux/slices/profileSlice";
import { getDefaultAvatar } from "../../utils/avatar";
import type { UserProfileDetails } from "../../types/ecommerce";

interface ProfileInfoFormProps {
  profile: UserProfileDetails | null;
}

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const { saving, successMessage, error } = useAppSelector(
    (state) => state.profile
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const defaultAvatar = getDefaultAvatar(profile?.full_name || fullName);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDay, setBirthDay] = useState("15");
  const [birthMonth, setBirthMonth] = useState("Tháng 08");
  const [birthYear, setBirthYear] = useState("1995");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(() => {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "nguyenvana_vn");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      if (profile.date_of_birth) {
        setBirthDay(profile.date_of_birth.day || "15");
        setBirthMonth(profile.date_of_birth.month || "Tháng 08");
        setBirthYear(profile.date_of_birth.year || "1995");
      }
      if (profile.gender) {
        setGender(profile.gender);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [profile]);

  // Generate selectable options for DoB
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => `Tháng ${String(i + 1).padStart(2, "0")}`);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => String(currentYear - 14 - i));

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

  const handleRemovePhoto = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện hiện tại?")) {
      dispatch(removeUserAvatar());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    dispatch(
      updateUserProfile({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date_of_birth: {
          day: birthDay,
          month: birthMonth,
          year: birthYear,
        },
        gender,
      })
    );
  };

  const genderOptions = [
    { value: "male" as const, label: "Nam (Male)" },
    { value: "female" as const, label: "Nữ (Female)" },
    { value: "other" as const, label: "Khác" },
  ];

  return (
    <section
      id="personal-profile"
      className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 border border-outline-variant/30"
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
        onChange={handleAvatarFileSelect}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Profile Photo &amp; Basic Identity
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Update your public avatar and official profile identification.
            </p>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">
            check_circle
          </span>
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-600 text-[18px]">
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* Avatar Management Card */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full ring-4 ring-primary-fixed overflow-hidden bg-surface-container flex items-center justify-center shadow-md">
            <img
              className="w-full h-full object-cover"
              alt={profile?.full_name || "Profile Avatar"}
              src={profile?.avatar_url || defaultAvatar}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm hover:bg-primary-container transition-transform active:scale-95 cursor-pointer"
            title="Đổi ảnh đại diện"
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
          <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
            Profile Avatar
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            PNG, JPG or GIF allowed. Maximum size 2MB (High resolution recommended).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:bg-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <span>Upload New Photo</span>
            </button>
            <button
              onClick={handleRemovePhoto}
              className="h-9 px-4 rounded-xl border border-outline-variant hover:bg-error-container hover:text-on-error-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <form className="space-y-6 pt-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>
                Full Name (Họ và Tên) <span className="text-error">*</span>
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Vietnamese Diacritics OK
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                badge
              </span>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>
                Display Name / Username <span className="text-error">*</span>
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                Unique public handle
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                alternate_email
              </span>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nguyenvana_vn"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Email Address <span className="text-error">*</span></span>
              </span>
              {profile?.email_verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Unverified
                </span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                mail
              </span>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Phone Number <span className="text-error">*</span></span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Verified
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                call
              </span>
              <input
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0909 123 456"
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span>Date of Birth (Ngày sinh)</span>
              <span className="material-symbols-outlined text-outline text-[18px]">
                cake
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Day */}
              <div className="relative">
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-sm cursor-pointer"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Month */}
              <div className="relative">
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-sm cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Year */}
              <div className="relative">
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-sm cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center">
              <span>Gender (Giới tính)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {genderOptions.map((opt) => {
                const isSelected = gender === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`w-full flex items-center justify-center gap-2 h-11 px-2 sm:px-3 rounded-xl cursor-pointer font-label-md text-label-md transition-all shadow-sm ${
                      isSelected
                        ? "border-2 border-primary bg-primary-fixed/20 text-primary font-bold"
                        : "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant font-medium"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => setGender(opt.value)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Lưu thông tin hồ sơ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfileInfoForm;
