import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { refreshAccessToken, registerUser } from "@/domains/auth/state/authSlice";
import {
  setStep,
  updateAccount,
  resetStore,
  setSuccessModalOpen,
} from "@/domains/shop/state/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingSuccessModal,
  OnboardingFooter,
} from "@/domains/shop/components/register";
import {
  Step1Stepper,
  Step1FooterBar,
  Step1AccountPanel,
} from "@/domains/shop/components/register/step1";
import { shopRegisterApi, type BackendShop } from "@/domains/shop/api/shopRegisterApi";
import { isValidEmail, isValidVietnamesePhone } from "@/shared/utils/validation";

export const RegisterOpenShopStep1: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    formData,
    isSubmitting,
    isSavingDraft,
    lastSavedAt,
    isSuccessModalOpen,
    registrationResult,
  } = useAppSelector((state) => state.shopRegister);
  const { user, loading: registering, error: registrationError, isInitialized } = useAppSelector((state) => state.auth);
  const [notice, setNotice] = useState<string | null>(null);
  const [existingShop, setExistingShop] = useState<BackendShop | null>(null);
  const [shopLoading, setShopLoading] = useState(Boolean(user && isInitialized));
  const [shopLoadError, setShopLoadError] = useState<string | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const applyShopToForm = useCallback((shop: BackendShop | null) => {
    setExistingShop(shop);
  }, []);

  useEffect(() => {
    dispatch(setStep(1));
    dispatch(resetStore());
    if (user) {
      dispatch(updateAccount({
        fullName: user.full_name,
        phone: user.phone,
        email: user.email ?? "",
        password: "",
        confirmPassword: "",
      }));
    }
    if (!isInitialized) return;
    if (!user) {
      void Promise.resolve().then(() => {
        setExistingShop(null);
        setShopLoading(false);
        setShopLoadError(null);
      });
      return;
    }
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setShopLoading(true);
      setShopLoadError(null);
    });
    void shopRegisterApi.getMyShop().then((shop) => {
      if (!active) return;
      applyShopToForm(shop);
    }).catch((error: unknown) => {
      if (active) {
        setShopLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ shop hiện tại.");
      }
    }).finally(() => { if (active) setShopLoading(false); });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      active = false;
    };
  }, [applyShopToForm, dispatch, user, isInitialized]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      dispatch(setStep(1));
    }
  };

  const handleNext = async () => {
    if (!user) {
      const { fullName, email, phone, password, confirmPassword } = formData.account;
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
        setNotice("Vui lòng điền đầy đủ họ tên, email, số điện thoại và mật khẩu để tạo tài khoản.");
        return;
      }
      if (!isValidEmail(email.trim())) {
        setNotice("Email không đúng định dạng. Ví dụ: seller@example.com");
        return;
      }
      if (!isValidVietnamesePhone(phone.trim())) {
        setNotice("Số điện thoại không đúng định dạng số di động Việt Nam. Ví dụ: 0909 123 456");
        return;
      }
      if (password !== confirmPassword) {
        setNotice("Mật khẩu xác nhận chưa khớp.");
        return;
      }
      const result = await dispatch(registerUser({
        fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, role: "client",
      }));
      if (!registerUser.fulfilled.match(result)) {
        setNotice(typeof result.payload === "string" ? result.payload : "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.");
        return;
      }
      dispatch(updateAccount({ password: "", confirmPassword: "", agreeTerms: true }));
      navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}&next=${encodeURIComponent("/register-open-shop")}`);
      return;
    }
    // Navigate to Step 2 page
    dispatch(resetStore());
    dispatch(setStep(2));
    navigate("/register-open-shop/step2");
  };

  const handleSubmit = () => { void handleNext(); };

  const handleSaveDraft = () => {
    setNotice(user
      ? "Nhập tên shop và địa chỉ kho ở bước 2 để bắt đầu lưu bản nháp lên máy chủ."
      : "Tạo tài khoản miễn phí trước, sau đó bạn có thể lưu hồ sơ nháp và tiếp tục hoàn thiện sau.");
  };

  const handleCloseModal = () => {
    dispatch(setSuccessModalOpen(false));
    navigate("/register-open-shop");
  };

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    try {
      await dispatch(refreshAccessToken()).unwrap();
      const latestShop = await shopRegisterApi.getMyShop();
      applyShopToForm(latestShop);
      setNotice("Đã cập nhật trạng thái hồ sơ và quyền tài khoản.");
    } catch {
      setNotice("Không thể cập nhật trạng thái lúc này. Vui lòng thử lại sau.");
    } finally {
      setRefreshingStatus(false);
    }
  };

  const reloadShop = async () => {
    setShopLoading(true);
    setShopLoadError(null);
    try {
      applyShopToForm(await shopRegisterApi.getMyShop());
    } catch (error: unknown) {
      setShopLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ shop hiện tại.");
    } finally {
      setShopLoading(false);
    }
  };

  if (!isInitialized) {
    return <div className="min-h-screen grid place-items-center text-on-surface-variant">Đang khôi phục phiên đăng nhập...</div>;
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {shopLoading && user && <p role="status" className="rounded-xl bg-surface-container-low p-4">Đang tải trạng thái gian hàng...</p>}
            {shopLoadError && <div role="alert" className="rounded-xl border border-error/30 bg-error-container/30 p-4 text-sm"><p>Không thể tải hồ sơ shop. Để tránh tạo trùng shop, vui lòng tải lại trước khi tiếp tục.</p><button type="button" onClick={reloadShop} className="mt-2 rounded-lg border px-3 py-2 font-semibold">Thử tải lại</button></div>}
            {existingShop && existingShop.status !== "PENDING" && (
              <section className={`rounded-xl border p-5 ${existingShop.status === "ACTIVE" ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
                <h2 className="font-semibold text-on-surface">
                  {existingShop.status === "ACTIVE" ? "Shop đã được duyệt" :
                    existingShop.status === "SUSPENDED" ? "Shop đang bị tạm ngưng" :
                      "Đã tìm thấy bản nháp hồ sơ shop"}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {existingShop.status === "ACTIVE"
                    ? "Quyền SELLER đã được cấp. Bạn vẫn có thể mua sắm bằng tài khoản này."
                    : existingShop.status === "SUSPENDED"
                      ? "Liên hệ bộ phận hỗ trợ để biết thêm thông tin. Quyền mua hàng vẫn được giữ nguyên."
                      : "Thông tin shop được tải từ máy chủ để bạn tiếp tục hoàn thiện."}
                </p>
                {existingShop.reject_reason && (
                  <p className="mt-2 text-sm text-red-800">Ghi chú xét duyệt: {existingShop.reject_reason}</p>
                )}
                {existingShop.status === "ACTIVE" && (
                  <button type="button" onClick={() => navigate("/shop/dashboard")} className="mt-3 rounded-lg bg-primary px-4 py-2 text-on-primary">
                    Vào Seller Center
                  </button>
                )}
                {existingShop.status !== "ACTIVE" && (
                  <button type="button" disabled={refreshingStatus} onClick={handleRefreshStatus} className="mt-3 rounded-lg border border-amber-700 px-4 py-2 text-amber-950 disabled:opacity-60">
                    {refreshingStatus ? "Đang cập nhật..." : "Cập nhật trạng thái hồ sơ"}
                  </button>
                )}
              </section>
            )}

            {!shopLoading && !shopLoadError && (!existingShop || ["DRAFT", "NEEDS_INFO", "REJECTED", "PENDING"].includes(existingShop.status)) && (
              <>
                {/* Context subheader & 4-step stepper */}
                <Step1Stepper onStepClick={handleStepClick} />

                {/* Form Content Wrapper with width matching Stepper */}
                <div className="w-full flex flex-col gap-space-lg mb-20">
                <Step1AccountPanel
                  data={formData.account}
                  onChange={(fields) => dispatch(updateAccount(fields))}
                  user={user}
                />

                {(notice || registrationError) && (
                  <div
                    role="alert"
                    className="p-4 rounded-xl bg-error-container/30 border border-error/40 text-on-error-container text-sm font-medium flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-error text-[20px]">
                        error
                      </span>
                      <span>{notice || registrationError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotice(null)}
                      className="text-outline hover:text-on-surface p-1 rounded-lg cursor-pointer"
                      title="Đóng thông báo"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}

              {/* Action Footer Bar */}
              <Step1FooterBar
                currentStep={1}
                onPrevStep={() => {}}
                onNextStep={handleNext}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
                isSubmitting={registering || isSubmitting}
                lastSavedAt={lastSavedAt}
              />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Post-submission Success Modal */}
      <OnboardingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        applicationId={registrationResult?.applicationId}
        shopName={registrationResult?.shopName || formData.store.shopName}
        ownerEmail={registrationResult?.ownerEmail || formData.account.email}
        message={registrationResult?.message}
      />

      {/* Bottom Global Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep1;
