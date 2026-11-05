import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import { SELLER_TERMS_VERSION } from "@/domains/shop/types/registerShop.types";
import {
  setStep,
  submitShopRegistration,
  saveDraftShopRegistration,
  setSuccessModalOpen,
} from "@/domains/shop/state/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingFooter,
  OnboardingSuccessModal,
  Step4Stepper,
  Step4HeroBanner,
  Step4AccountCard,
  Step4StoreCard,
  Step4TermsCard,
  Step4FooterBar,
  type Step4TermsState,
} from "@/domains/shop/components/register";

export const RegisterOpenShopStep4: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    formData,
    currentStep,
    isSubmitting,
    isSavingDraft,
    lastSavedAt,
    isSuccessModalOpen,
    registrationResult,
  } = useAppSelector((state) => state.shopRegister);

  const [terms, setTerms] = useState<Step4TermsState>({
    authVerified: false,
    platformRules: false,
    antiCounterfeit: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep < 4) {
      navigate("/register-open-shop", { replace: true });
      return;
    }
    dispatch(setStep(4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, dispatch, navigate]);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      dispatch(setStep(1));
      navigate("/register-open-shop");
    } else if (targetStep === 2) {
      dispatch(setStep(2));
      navigate("/register-open-shop/step2");
    } else if (targetStep === 3) {
      dispatch(setStep(3));
      navigate("/register-open-shop/step3");
    }
  };

  const handleTermChange = (key: keyof Step4TermsState, value: boolean) => {
    setTerms((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      await dispatch(saveDraftShopRegistration(formData)).unwrap();
      setToastMessage("Bản nháp đã được lưu trên máy chủ.");
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : typeof error === "string" ? error : "Không thể lưu bản nháp.");
    }
  };

  const canSubmit = terms.authVerified && terms.platformRules && terms.antiCounterfeit;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setToastMessage("Vui lòng đồng ý với toàn bộ điều khoản trước khi gửi hồ sơ!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      await dispatch(submitShopRegistration({
        formData,
        agreements: {
          version: SELLER_TERMS_VERSION,
          service_policy: terms.platformRules,
          authenticity: terms.authVerified,
          anti_counterfeit: terms.antiCounterfeit,
        },
      })).unwrap();
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : typeof error === "string" ? error : "Không thể gửi hồ sơ. Vui lòng thử lại.");
    }
  };

  const handleCloseModal = () => {
    dispatch(setSuccessModalOpen(false));
    navigate("/");
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Canvas */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {/* Top Navigation Context & Stepper Progress (4 steps) */}
            <Step4Stepper onStepClick={handleStepClick} />

            {/* Form Container with width matching Stepper */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              {/* Hero / Review Introduction Callout */}
              <Step4HeroBanner />

              {/* Khối 1: Thông tin mô hình & Tài khoản quản trị (Đã thay Loại hình bằng Thông tin ngân hàng) */}
              <Step4AccountCard account={formData.account} />

              {/* Khối 2: Thông tin Gian hàng & Vận hành kho lấy hàng */}
              <Step4StoreCard store={formData.store} />

              {/* Khối 4: Điều khoản & Cam kết tuân thủ sàn TMĐT */}
              <Step4TermsCard terms={terms} onChange={handleTermChange} />

              {/* Action Footer Bar (In-flow card layout, non-sticky like Step 1, 2, 3) */}
              <Step4FooterBar
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
                canSubmit={canSubmit}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">
            info
          </span>
          <span className="font-body-md text-body-md font-medium">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-inverse-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Post-submission Success Modal */}
      <OnboardingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        applicationId={registrationResult?.applicationId}
        shopName={registrationResult?.shopName || formData.store.shopName}
        ownerEmail={registrationResult?.ownerEmail || formData.account.email}
      />

      {/* Global Bottom Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep4;
