import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { fetchMyShop, updateMyShop, resubmitMyShop, clearMyShopMessages } from "@/domains/shop/state/myShopSlice";
import { setStep, updateStore } from "@/domains/shop/state/shopRegisterSlice";
import type { ShopProfilePayload } from "@/shared/types";
import { SELLER_TERMS_VERSION, type ShopTermsAcceptance } from "@/domains/shop/types/registerShop.types";
import { refreshAccessToken } from "@/domains/auth/state/authSlice";
import { isValidVietnamesePhone } from "@/shared/utils/validation";

export const MyShopStatusCard: React.FC = () => {
  const { t } = useTranslation("customer");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { shop, loading, updating, error, successMessage } = useAppSelector(
    (state) => state.myShop
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWarehouse, setFormWarehouse] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formBannerUrl, setFormBannerUrl] = useState("");
  const [termsAcceptance, setTermsAcceptance] = useState({
    servicePolicy: false,
    authenticity: false,
    antiCounterfeit: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    setRefreshError(null);
    try {
      await dispatch(refreshAccessToken()).unwrap();
      await dispatch(fetchMyShop()).unwrap();
    } catch {
      setRefreshError(t("profile.shop_status.refresh_failed"));
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleOpenEdit = () => {
    if (!shop) return;
    setFormName(shop.name || "");
    setFormPhone(shop.phone || "");
    setFormWarehouse(shop.warehouse_address || "");
    setFormDescription(shop.description || "");
    setFormLogoUrl(shop.logo_url || "");
    setFormBannerUrl(shop.banner_url || "");
    const previouslyAccepted = Boolean(shop.terms_accepted);
    setTermsAcceptance({
      servicePolicy: previouslyAccepted,
      authenticity: previouslyAccepted,
      antiCounterfeit: previouslyAccepted,
    });
    setFormError(null);
    dispatch(clearMyShopMessages());
    setIsModalOpen(true);
  };

  const handleEditPendingShop = () => {
    if (shop && shop.status === "PENDING") {
      const addressParts = (shop.warehouse_address || "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      const addressDetail =
        addressParts.length > 3
          ? addressParts.slice(0, -3).join(", ")
          : addressParts[0] || "";
      const ward =
        addressParts.length > 3
          ? addressParts[addressParts.length - 3]
          : "";
      const district =
        addressParts.length > 2
          ? addressParts[addressParts.length - 2]
          : "";
      const province =
        addressParts.length > 1
          ? addressParts[addressParts.length - 1]
          : "";

      dispatch(
        updateStore({
          shopName: shop.name || "",
          bio: shop.description || "",
          logoUrl: shop.logo_url || "",
          bannerUrl: shop.banner_url || "",
          warehousePhone: shop.phone || "",
          addressDetail,
          ward: ward || "Phường Bến Nghé",
          district: district || "Quận 1",
          province: province || "TP. Hồ Chí Minh",
        })
      );
      dispatch(setStep(2));
      navigate("/register-open-shop/step2", {
        state: { editPendingShop: true },
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(clearMyShopMessages());
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = formName.trim();
    const phone = formPhone.trim().replace(/\s+/g, "");
    const warehouse = formWarehouse.trim();
    const description = formDescription.trim();

    if (name.length < 2 || name.length > 150) {
      setFormError(t("profile.shop_status.modal.errors.name_length"));
      return;
    }
    if (!phone || !isValidVietnamesePhone(phone)) {
      setFormError(t("profile.shop_status.modal.errors.invalid_phone"));
      return;
    }
    if (warehouse.length < 5 || warehouse.length > 500) {
      setFormError(t("profile.shop_status.modal.errors.warehouse_length"));
      return;
    }
    const isResubmission = shop?.status === "REJECTED" || shop?.status === "NEEDS_INFO";
    if (isResubmission && !Object.values(termsAcceptance).every(Boolean)) {
      setFormError(t("profile.shop_status.modal.errors.terms_required"));
      return;
    }

    const sanitizeUrl = (url: string) => {
      const trimmed = url.trim();
      return trimmed.startsWith("https://") ? trimmed : null;
    };

    const payload: ShopProfilePayload = {
      name,
      phone: phone.startsWith("0") || phone.startsWith("+") ? phone : phone ? `0${phone}` : "",
      warehouse_address: warehouse,
      description: description || "Gian hàng chính hãng phân phối tại MarketPulse.",
      logo_url: sanitizeUrl(formLogoUrl),
      banner_url: sanitizeUrl(formBannerUrl),
    };

    try {
      await dispatch(updateMyShop(payload)).unwrap();
      if (isResubmission) {
        const agreements: ShopTermsAcceptance = {
          version: SELLER_TERMS_VERSION,
          service_policy: termsAcceptance.servicePolicy,
          authenticity: termsAcceptance.authenticity,
          anti_counterfeit: termsAcceptance.antiCounterfeit,
        };
        await dispatch(resubmitMyShop(agreements)).unwrap();
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(typeof err === "string" ? err : t("profile.shop_status.modal.errors.update_failed"));
    }
  };

  if (loading) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-pulse h-20" />
    );
  }

  if (!shop && error) {
    return (
      <div role="alert" className="mb-6 rounded-xl border border-error/30 bg-error-container/30 p-4 text-sm">
        <p>{t("profile.shop_status.load_error")}</p>
        <button type="button" onClick={() => dispatch(fetchMyShop())} className="mt-3 rounded-lg border px-3 py-2 font-semibold">
          {t("profile.shop_status.retry_btn")}
        </button>
      </div>
    );
  }

  return (
    <>
      {successMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearMyShopMessages())}
            className="text-emerald-700 hover:opacity-75 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
      <div className="mb-3 flex justify-end">
        <button type="button" disabled={refreshingStatus} onClick={() => void handleRefreshStatus()} className="text-sm font-semibold text-primary underline disabled:opacity-50">
          {refreshingStatus ? t("profile.shop_status.refreshing") : t("profile.shop_status.refresh")}
        </button>
      </div>
      {refreshError && <p role="alert" className="mb-3 text-right text-sm text-error">{refreshError}</p>}
      {/* 1. User Chưa có shop */}
      {!shop && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-primary-fixed/20 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">{t("profile.shop_status.no_shop.title")}</h4>
              <p className="text-sm text-on-surface-variant">
                {t("profile.shop_status.no_shop.desc")}
              </p>
            </div>
          </div>
          <Link
            to="/register-open-shop"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shrink-0 text-center shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>{t("profile.shop_status.no_shop.btn")}</span>
          </Link>
        </div>
      )}

      {/* 2. Shop đang chờ duyệt (PENDING) */}
      {shop && shop.status === "PENDING" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px] animate-pulse">hourglass_top</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h4 className="font-bold text-on-surface text-base">{shop.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800">
                  {t("profile.shop_status.pending.badge")}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {t("profile.shop_status.pending.code")}{" "}
                <strong className="font-mono">#SHOP-{String(shop.id).padStart(4, "0")}</strong> • {t("profile.shop_status.pending.desc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEditPendingShop}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 text-amber-800 hover:bg-amber-500/20 text-sm font-semibold transition-all shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>{t("profile.shop_status.pending.edit_btn")}</span>
          </button>
        </div>
      )}

      {/* 3. Shop bị từ chối (REJECTED) */}
      {shop && shop.status === "REJECTED" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h4 className="font-bold text-on-surface text-base">{shop.name}</h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-700">
                  {t("profile.shop_status.rejected.badge")}
                </span>
              </div>
              <p className="text-sm text-red-700 font-medium">
                {t("profile.shop_status.rejected.code")}{" "}
                <strong className="font-mono text-on-surface">#SHOP-{String(shop.id).padStart(4, "0")}</strong> • {t("profile.shop_status.rejected.reason_prefix")} {shop.reject_reason || t("profile.shop_status.rejected.default_reason")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3b. Shop cần bổ sung thông tin (NEEDS_INFO) */}
      {shop && shop.status === "NEEDS_INFO" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h4 className="font-bold text-on-surface text-base">{shop.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800">
                  {t("profile.shop_status.needs_info.badge")}
                </span>
              </div>
              <p className="text-sm text-amber-800 font-medium">
                {t("profile.shop_status.needs_info.request_prefix")} {shop.reject_reason || t("profile.shop_status.needs_info.default_request")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shrink-0 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>{t("profile.shop_status.needs_info.btn")}</span>
          </button>
        </div>
      )}

      {/* 4. Shop đã duyệt / Đang hoạt động (ACTIVE) */}
      {shop && shop.status === "ACTIVE" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h4 className="font-bold text-on-surface text-base">{shop.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800">
                  {t("profile.shop_status.active.badge")}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {t("profile.shop_status.active.code")}{" "}
                <strong className="font-mono">#SHOP-{String(shop.id).padStart(4, "0")}</strong> • {t("profile.shop_status.active.followers")} {shop.follower_count}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/shop/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-all shadow-xs"
            >
              <span>{t("profile.shop_status.active.portal_btn")}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>
      )}

      {/* 5. Shop bị tạm ngưng (SUSPENDED) */}
      {shop && shop.status === "SUSPENDED" && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-outline/20 text-outline flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h4 className="font-bold text-on-surface text-base">{shop.name}</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container-highest text-on-surface-variant">
                  {t("profile.shop_status.suspended.badge")}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {t("profile.shop_status.suspended.reason_prefix")} {shop.reject_reason || t("profile.shop_status.suspended.default_reason")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenEdit}
            className="px-3.5 py-2 rounded-xl border border-outline-variant hover:bg-surface-container text-sm font-semibold transition-all cursor-pointer"
          >
            {t("profile.shop_status.suspended.view_btn")}
          </button>
        </div>
      )}

      {/* MODAL CHỈNH SỬA / NỘP LẠI HỒ SƠ GIAN HÀNG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">store</span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {shop?.status === "REJECTED" || shop?.status === "NEEDS_INFO"
                    ? t("profile.shop_status.modal.title_resubmit")
                    : t("profile.shop_status.modal.title_edit")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/30 text-error text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  {t("profile.shop_status.modal.shop_name")} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-hidden bg-surface text-on-surface text-sm"
                  placeholder={t("profile.shop_status.modal.shop_name_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  {t("profile.shop_status.modal.phone")} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-hidden bg-surface text-on-surface text-sm"
                  placeholder={t("profile.shop_status.modal.phone_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  {t("profile.shop_status.modal.warehouse")} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formWarehouse}
                  onChange={(e) => setFormWarehouse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-hidden bg-surface text-on-surface text-sm"
                  placeholder={t("profile.shop_status.modal.warehouse_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">
                  {t("profile.shop_status.modal.description")}
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-hidden bg-surface text-on-surface text-sm resize-none"
                  placeholder={t("profile.shop_status.modal.description_placeholder")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {t("profile.shop_status.modal.logo_url")}
                  </label>
                  <input
                    type="url"
                    value={formLogoUrl}
                    onChange={(e) => setFormLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant focus:border-primary outline-hidden bg-surface text-on-surface text-xs"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    {t("profile.shop_status.modal.banner_url")}
                  </label>
                  <input
                    type="url"
                    value={formBannerUrl}
                    onChange={(e) => setFormBannerUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant focus:border-primary outline-hidden bg-surface text-on-surface text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {(shop?.status === "REJECTED" || shop?.status === "NEEDS_INFO") && (
                <fieldset className="space-y-3 rounded-xl border border-outline-variant/40 p-4">
                  <legend className="px-1 text-sm font-semibold">{t("profile.shop_status.modal.terms_legend")}</legend>
                  {([
                    ["servicePolicy", t("profile.shop_status.modal.terms_service")],
                    ["authenticity", t("profile.shop_status.modal.terms_authenticity")],
                    ["antiCounterfeit", t("profile.shop_status.modal.terms_anti_counterfeit")],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-start gap-2 text-sm">
                      <input type="checkbox" checked={termsAcceptance[key]} onChange={(event) => setTermsAcceptance((current) => ({ ...current, [key]: event.target.checked }))} />
                      <span>{label}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  {t("profile.shop_status.modal.cancel_btn")}
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {updating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>
                    {shop?.status === "REJECTED" || shop?.status === "NEEDS_INFO"
                      ? t("profile.shop_status.modal.resubmit_btn")
                      : t("profile.shop_status.modal.save_btn")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyShopStatusCard;
