import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  updateUserProfile,
  removeUserAvatar,
  setLocalAvatarPreview,
  clearProfileStatus,
} from "@/domains/customer/state/profileSlice";
import { getDefaultAvatar } from "@/shared/utils/avatar";
import { isValidVietnamesePhone } from "@/shared/utils/validation";
import { uploadMedia } from "@/shared/api/mediaUpload";
import { profileApi } from "@/domains/customer/api/profileApi";
import type { UserProfileDetails } from "@/shared/types";

interface ProfileInfoFormProps {
  profile: UserProfileDetails | null;
}

const parseMonthNumber = (val?: string) => {
  if (!val) return "08";
  const digits = val.replace(/\D/g, "");
  return digits ? digits.padStart(2, "0") : "08";
};

export const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({ profile }) => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const { saving, successMessage, error } = useAppSelector(
    (state) => state.profile
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const defaultAvatar = useMemo(() => getDefaultAvatar(profile?.full_name), [profile?.full_name]);
  const [username, setUsername] = useState(profile?.username || "nguyenvana_vn");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [birthDay, setBirthDay] = useState(profile?.date_of_birth?.day || "15");
  const [birthMonth, setBirthMonth] = useState(parseMonthNumber(profile?.date_of_birth?.month));
  const [birthYear, setBirthYear] = useState(profile?.date_of_birth?.year || "1995");
  const [gender, setGender] = useState<"male" | "female" | "other">(profile?.gender || "male");

  // Đồng bộ props -> state theo chuẩn React (trước paint, không gây chớp nháy và không vi phạm rules-of-hooks)
  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile && profile !== prevProfile) {
    setPrevProfile(profile);
    setFullName(profile.full_name || "");
    setUsername(profile.username || "nguyenvana_vn");
    setEmail(profile.email || "");
    setPhone(profile.phone || "");
    if (profile.date_of_birth) {
      setBirthDay(profile.date_of_birth.day || "15");
      setBirthMonth(parseMonthNumber(profile.date_of_birth.month));
      setBirthYear(profile.date_of_birth.year || "1995");
    }
    if (profile.gender) {
      setGender(profile.gender);
    }
  }

  // Tự động ẩn thông báo sau 5 giây theo yêu cầu
  useEffect(() => {
    if (successMessage || error || localError) {
      const timer = setTimeout(() => {
        dispatch(clearProfileStatus());
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, localError, dispatch]);

  // Generate selectable options for DoB
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = Array.from({ length: 12 }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return {
      value: num,
      label: t("profile.form.month_prefix", { month: num }),
    };
  });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 70 }, (_, i) => String(currentYear - 14 - i));

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const previousAvatar = profile?.avatar_url || null;
    let previewURL: string | null = null;
    try {
      previewURL = URL.createObjectURL(file);
      dispatch(setLocalAvatarPreview(previewURL));
      setLocalError(null);
      setIsUploadingAvatar(true);
      const upload = await uploadMedia(file, "avatar");
      const updatedProfile = await profileApi.setAvatar(upload.url);
      dispatch(setLocalAvatarPreview(updatedProfile.avatar_url || upload.url));
    } catch (uploadError) {
      dispatch(setLocalAvatarPreview(previousAvatar));
      setLocalError(
        uploadError instanceof Error
          ? uploadError.message
          : t("profile.form.errors.avatar_upload_failed")
      );
    } finally {
      if (previewURL) URL.revokeObjectURL(previewURL);
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = () => {
    if (window.confirm(t("profile.form.confirm_remove_avatar"))) {
      dispatch(removeUserAvatar());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const originalUsername = (profile?.username || "").trim();
    const originalEmail = (profile?.email || "").trim().toLowerCase();
    const currentUsername = username.trim();
    const currentEmail = email.trim().toLowerCase();

    // Yêu cầu: Chức năng cập nhật chỉ áp dụng cho Full Name và Phone Number.
    // Nếu cập nhật Username hoặc Email Address thì hiển thị: "Bạn chỉ được cập nhật Full Name và Phone Number"
    const isUsernameChanged = currentUsername !== originalUsername;
    const isEmailChanged = currentEmail !== originalEmail;

    if (isUsernameChanged || isEmailChanged) {
      dispatch(clearProfileStatus());
      setLocalError(t("profile.form.errors.restricted_fields"));
      // Khôi phục lại giá trị Username và Email gốc
      setUsername(profile?.username || "nguyenvana_vn");
      setEmail(profile?.email || "");
      return;
    }

    if (!fullName.trim()) return;

    if (phone.trim() && !isValidVietnamesePhone(phone)) {
      dispatch(clearProfileStatus());
      setLocalError(t("profile.form.errors.invalid_phone"));
      return;
    }

    dispatch(
      updateUserProfile({
        full_name: fullName.trim(),
        username: originalUsername,
        email: profile?.email || "",
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
    { value: "male" as const, label: t("profile.form.genders.male") },
    { value: "female" as const, label: t("profile.form.genders.female") },
    { value: "other" as const, label: t("profile.form.genders.other") },
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
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
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
              {t("profile.form.header_title")}
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t("profile.form.header_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {successMessage && !localError && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">
              check_circle
            </span>
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(clearProfileStatus());
              setLocalError(null);
            }}
            className="text-emerald-600 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            aria-label={t("profile.form.close_alert")}
            title={t("profile.form.close_alert")}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      {(localError || error) && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600 text-[18px]">
              error
            </span>
            <span className="font-medium">{localError || error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(clearProfileStatus());
              setLocalError(null);
            }}
            className="text-red-500 hover:text-red-800 p-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            aria-label={t("profile.form.close_alert_error")}
            title={t("profile.form.close_alert_error")}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Avatar Management Card */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full ring-4 ring-primary-fixed overflow-hidden bg-surface-container flex items-center justify-center shadow-md">
            <img
              className="w-full h-full object-cover"
              alt={profile?.full_name || t("profile.form.avatar_title")}
              src={profile?.avatar_url || defaultAvatar}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm hover:bg-primary-container transition-transform active:scale-95 cursor-pointer"
            title={t("profile.form.change_avatar_title")}
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
          <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
            {t("profile.form.avatar_title")}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {t("profile.form.avatar_hint")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:bg-primary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">upload</span>
              <span>{isUploadingAvatar ? t("profile.form.uploading_btn") : t("profile.form.upload_btn")}</span>
            </button>
            <button
              onClick={handleRemovePhoto}
              className="h-9 px-4 rounded-xl border border-outline-variant hover:bg-error-container hover:text-on-error-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>{t("profile.form.remove_btn")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <form className="space-y-6 pt-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span>
                {t("profile.form.full_name")} <span className="text-error">*</span>
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                {t("profile.form.diacritics_hint")}
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
                placeholder={t("profile.form.full_name_placeholder")}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span>
                {t("profile.form.username")} <span className="text-error">*</span>
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                {t("profile.form.unique_handle_hint")}
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
                placeholder={t("profile.form.username_placeholder")}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{t("profile.form.email")} <span className="text-error">*</span></span>
              </span>
              {profile?.email_verified ? (
                <span className="h-5 inline-flex items-center gap-1 px-2 rounded-full text-[10px] leading-none font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="material-symbols-outlined !text-[11px] leading-none" style={{ fontSize: "11px" }}>verified</span>
                  {t("profile.form.verified")}
                </span>
              ) : (
                <span className="h-5 inline-flex items-center px-2 rounded-full text-[10px] leading-none font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {t("profile.form.unverified")}
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
                placeholder={t("profile.form.email_placeholder")}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>{t("profile.form.phone")} <span className="text-error">*</span></span>
              </span>
              <span className="h-5 inline-flex items-center gap-1 px-2 rounded-full text-[10px] leading-none font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined !text-[11px] leading-none" style={{ fontSize: "11px" }}>verified</span>
                {t("profile.form.verified")}
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
                placeholder={t("profile.form.phone_placeholder")}
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold h-5 flex items-center justify-between">
              <span>{t("profile.form.dob")}</span>
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
                    <option key={m.value} value={m.value}>
                      {m.label}
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
              <span>{t("profile.form.gender")}</span>
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
                <span>{t("profile.form.saving")}</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{t("profile.form.save_btn")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfileInfoForm;
