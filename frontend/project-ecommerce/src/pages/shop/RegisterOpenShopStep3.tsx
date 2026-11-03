import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setStep,
  updateKyc,
  saveDraftShopRegistration,
} from "../../redux/slices/shop/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingFooter,
  Step3Stepper,
  Step3HeroBanner,
  Step3LegalKycCard,
  Step3BankAccountCard,
  Step3FooterBar,
} from "../../components/shop/register";

export const RegisterOpenShopStep3: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { formData, isSavingDraft, lastSavedAt } = useAppSelector(
    (state) => state.shopRegister
  );

  useEffect(() => {
    // Ensure Redux step state is set to 3 when mounting this page
    dispatch(setStep(3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      dispatch(setStep(1));
      navigate("/register-open-shop");
    } else if (targetStep === 2) {
      dispatch(setStep(2));
      navigate("/register-open-shop/step2");
    }
  };

  const handleNextStep = () => {
    dispatch(saveDraftShopRegistration(formData));
    dispatch(setStep(4));
    navigate("/register-open-shop/step4");
  };

  const handleSaveDraft = () => {
    dispatch(saveDraftShopRegistration(formData));
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
            <Step3Stepper onStepClick={handleStepClick} />

            {/* Form Container (width matching Stepper) */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              {/* Hero / Legal Disclaimer Alert Callout */}
              <Step3HeroBanner />

              {/* Khối 1: Định danh pháp lý chủ sở hữu gian hàng */}
              <Step3LegalKycCard
                data={formData.kyc}
                accountHolderName={formData.account.fullName}
                onChange={(fields) => dispatch(updateKyc(fields))}
              />

              {/* Khối 2: Tài khoản ngân hàng nhận tiền doanh thu & COD */}
              <Step3BankAccountCard
                data={formData.kyc}
                accountHolderName={formData.account.fullName}
                onChange={(fields) => dispatch(updateKyc(fields))}
              />

              {/* Action Footer Bar (In-flow card layout, non-sticky like Step 1 & Step 2) */}
              <Step3FooterBar
                onSaveDraft={handleSaveDraft}
                onNextStep={handleNextStep}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl transition-all animate-bounce">
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

      {/* Global Bottom Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep3;
