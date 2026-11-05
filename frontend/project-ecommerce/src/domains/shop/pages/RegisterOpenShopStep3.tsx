import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  setStep,
  saveDraftShopRegistration,
} from "@/domains/shop/state/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingFooter,
  Step3Stepper,
  Step3HeroBanner,
  Step3FooterBar,
} from "@/domains/shop/components/register";

export const RegisterOpenShopStep3: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { formData, currentStep, isSavingDraft, lastSavedAt } = useAppSelector(
    (state) => state.shopRegister
  );

  useEffect(() => {
    if (currentStep < 3) {
      navigate("/register-open-shop", { replace: true });
      return;
    }
    // Ensure Redux step state is set to 3 when mounting this page
    dispatch(setStep(3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, dispatch, navigate]);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      dispatch(setStep(1));
      navigate("/register-open-shop");
    } else if (targetStep === 2) {
      dispatch(setStep(2));
      navigate("/register-open-shop/step2");
    }
  };

  const handleNextStep = async () => {
    try {
      await dispatch(saveDraftShopRegistration(formData)).unwrap();
      dispatch(setStep(4));
      navigate("/register-open-shop/step4");
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : typeof error === "string" ? error : "Không thể lưu bản nháp.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await dispatch(saveDraftShopRegistration(formData)).unwrap();
      setToastMessage("Bản nháp đã được lưu trên máy chủ.");
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : typeof error === "string" ? error : "Không thể lưu bản nháp.");
    }
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
            <Step3Stepper onStepClick={handleStepClick} />

            {/* Form Container (width matching Stepper) */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              {/* Hero / Legal Disclaimer Alert Callout */}
              <Step3HeroBanner />

              <section className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
                <h2 className="font-semibold">Xác minh danh tính và thanh toán chưa được hỗ trợ</h2>
                <p className="mt-2 text-sm">
                  BE hiện chỉ tiếp nhận hồ sơ shop cơ bản. Không nhập hoặc tải lên CCCD, thông tin
                  ngân hàng hay dữ liệu nhạy cảm ở bước này. Các thông tin đó sẽ chỉ được yêu cầu
                  khi có API lưu trữ và quy trình bảo vệ phù hợp.
                </p>
              </section>

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
