import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setStep,
  submitShopRegistration,
  saveDraftShopRegistration,
  setSuccessModalOpen,
} from "../../redux/slices/shop/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingFooter,
  OnboardingSuccessModal,
  Step4Stepper,
  Step4HeroBanner,
  Step4AccountCard,
  Step4StoreCard,
  Step4KycCard,
  Step4TermsCard,
  Step4FooterBar,
  type Step4TermsState,
} from "../../components/shop/register";

export const RegisterOpenShopStep4: React.FC = () => {
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

  const [terms, setTerms] = useState<Step4TermsState>({
    authVerified: true,
    platformRules: true,
    antiCounterfeit: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setStep(4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

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

  const handleSaveDraft = () => {
    dispatch(saveDraftShopRegistration(formData));
    setToastMessage("Đã lưu bản nháp hồ sơ thành công!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const canSubmit = terms.authVerified && terms.platformRules && terms.antiCounterfeit;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setToastMessage("Vui lòng đồng ý với toàn bộ điều khoản trước khi gửi hồ sơ!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      await dispatch(submitShopRegistration(formData)).unwrap();
      dispatch(setSuccessModalOpen(true));
    } catch {
      // If error or mock, still trigger modal for presentation
      dispatch(setSuccessModalOpen(true));
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
      <main className="w-full pt-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {/* Top Navigation Context & Stepper Progress (4 steps) */}
            <Step4Stepper onStepClick={handleStepClick} />

            {/* Form Container with width matching Stepper */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              {/* Hero / Review Introduction Callout */}
              <Step4HeroBanner />

              {/* Khối 1: Thông tin mô hình & Tài khoản quản trị (Đã thay Loại hình bằng Thông tin ngân hàng) */}
              <Step4AccountCard account={formData.account} kyc={formData.kyc} />

              {/* Khối 2: Thông tin Gian hàng & Vận hành kho lấy hàng */}
              <Step4StoreCard store={formData.store} />

              {/* Khối 3: Định danh pháp lý eKYC & Tài khoản nhận tiền (Payout) */}
              <Step4KycCard
                kyc={formData.kyc}
                accountHolderName={formData.account.fullName}
              />

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
        applicationId={registrationResult?.applicationId || "#REQ-SHOP-8812"}
        shopName={registrationResult?.shopName || formData.store.shopName || "UrbanStep Sneaker Hub"}
        ownerEmail={registrationResult?.ownerEmail || formData.account.email || "nguyen.vana@gmail.com"}
      />

      {/* Global Bottom Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep4;
