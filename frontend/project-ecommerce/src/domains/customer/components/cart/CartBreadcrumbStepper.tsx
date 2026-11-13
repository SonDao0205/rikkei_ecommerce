import React from "react";
import { useTranslation } from "react-i18next";

export interface CartBreadcrumbStepperProps {
  currentStep?: 1 | 2 | 3;
}

export const CartBreadcrumbStepper: React.FC<CartBreadcrumbStepperProps> = ({
  currentStep = 1,
}) => {
  const { t } = useTranslation("customer");
  const steps = [
    { step: 1, label: t("cart.stepper.cart"), icon: "shopping_cart", path: "/cart" },
    { step: 2, label: t("cart.stepper.checkout"), icon: "credit_card", path: "/checkout" },
    { step: 3, label: t("cart.stepper.complete"), icon: "task_alt", path: "#" },
  ];

  return (
    <div className="w-full bg-surface-container-lowest border-b border-outline-variant py-3 px-4 sm:px-6 mb-6">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between sm:justify-center gap-3 sm:gap-8">
        {steps.map((s, index) => {
          const isActive = s.step === currentStep;
          const isPassed = s.step < currentStep;

          return (
            <React.Fragment key={s.step}>
              {index > 0 && (
                <div
                  className={`flex-1 max-w-[60px] sm:max-w-[100px] h-[2px] transition-colors ${
                    isPassed ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isActive
                      ? "bg-primary-container text-on-primary ring-4 ring-primary-fixed"
                      : isPassed
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-outline"
                  }`}
                >
                  {isPassed ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    s.step
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-on-surface font-bold"
                      : isPassed
                      ? "text-primary"
                      : "text-outline"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CartBreadcrumbStepper;
