import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setStep,
  updateAccount,
  setSuccessModalOpen,
  submitShopRegistration,
  saveDraftShopRegistration,
} from "../../redux/slices/shop/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingSuccessModal,
  OnboardingFooter,
} from "../../components/shop/register";
import {
  Step1Stepper,
  Step1AccountPanel,
  Step1FooterBar,
} from "../../components/shop/register/step1";

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

  useEffect(() => {
    // Ensure Redux step state is set to 1 when on Step 1 page
    dispatch(setStep(1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      dispatch(setStep(1));
    }
  };

  const handleNext = () => {
    // Navigate to Step 2 page
    dispatch(setStep(2));
    navigate("/register-open-shop/step2");
  };

  const handleSubmit = () => {
    dispatch(submitShopRegistration(formData));
  };

  const handleSaveDraft = () => {
    dispatch(saveDraftShopRegistration(formData));
  };

  const handleCloseModal = () => {
    dispatch(setSuccessModalOpen(false));
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {/* Context subheader & 4-step stepper */}
            <Step1Stepper onStepClick={handleStepClick} />

            {/* Form Content Wrapper with width matching Stepper */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-10 transition-all">
                <Step1AccountPanel
                  data={formData.account}
                  onChange={(fields) => dispatch(updateAccount(fields))}
                />
              </div>

              {/* Action Footer Bar */}
              <Step1FooterBar
                currentStep={1}
                onPrevStep={() => {}}
                onNextStep={handleNext}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isSubmitting={isSubmitting}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
              />
            </div>
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
