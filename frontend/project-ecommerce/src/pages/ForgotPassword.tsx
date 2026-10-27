import { useState } from "react";
import { Link } from "react-router-dom";
import ForgotPasswordStep1 from "../components/auth/ForgotPasswordStep1";
import ForgotPasswordStep2 from "../components/auth/ForgotPasswordStep2";
import ForgotPasswordStep3 from "../components/auth/ForgotPasswordStep3";

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2 group" to="/login">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]">
                <span className="material-symbols-outlined text-on-primary text-[22px]">
                  shopping_bag
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                  MarketPulse
                </span>
                <span className="font-label-sm text-[10px] font-bold text-secondary uppercase tracking-wider -mt-1">
                  Secure Commerce
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-secondary font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>256-Bit SSL Protected</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full pt-20 bg-background flex-1 flex flex-col justify-center">
        <div className="flex flex-col w-full items-center justify-center py-10 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
          {/* Subtle ambient aura effects behind auth container */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div className="w-[680px] h-[520px] rounded-full bg-primary-fixed/35 blur-[120px] -translate-y-12" />
            <div className="w-[420px] h-[340px] rounded-full bg-secondary-fixed/40 blur-[90px] translate-x-48 translate-y-24" />
          </div>

          {/* Centered Structured Auth Canvas Container */}
          <div className="relative z-10 w-full max-w-[640px] flex flex-col gap-4">
            {/* Top Navigation Bar / Breadcrumb */}
            <div className="w-full flex items-center justify-between px-1">
              {currentStep === 1 ? (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 font-label-lg text-sm font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Quay lại đăng nhập</span>
                </Link>
              ) : currentStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1 cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Quay lại bước 1 (Nhập thông tin)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 font-label-md text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1 cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Quay lại bước 2 (Xác thực OTP)</span>
                </button>
              )}
            </div>

            {/* Dynamic Step Rendering */}
            {currentStep === 1 && (
              <ForgotPasswordStep1
                onSuccessStep={() => {
                  setCurrentStep(2);
                }}
              />
            )}

            {currentStep === 2 && (
              <ForgotPasswordStep2
                onBack={() => setCurrentStep(1)}
                onSuccessStep={() => {
                  setCurrentStep(3);
                }}
              />
            )}

            {currentStep === 3 && (
              <ForgotPasswordStep3
                onBack={() => setCurrentStep(2)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Security Footer */}
      <footer className="w-full bg-surface-container-low py-6 shadow-[0_-1px_8px_rgba(0,0,0,0.02)] mt-auto border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
            {/* Security Badges Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
              <div className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  lock
                </span>
                <span className="font-label-md text-xs font-semibold">
                  256-Bit End-to-End Encryption
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  shield
                </span>
                <span className="font-label-md text-xs font-semibold">
                  Marketplace Buyer Protection
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  admin_panel_settings
                </span>
                <span className="font-label-md text-xs font-semibold">
                  Identity Fraud Prevention
                </span>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 text-xs">
              <a
                href="#"
                className="font-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-outline-variant">•</span>
              <a
                href="#"
                className="font-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-outline-variant">•</span>
              <a
                href="#"
                className="font-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Security Center
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-xs text-on-surface-variant">
            <span className="text-center sm:text-left">
              © 2025 MarketPulse Technologies, Inc. All customer credentials encrypted at rest.
            </span>
            <div className="flex items-center gap-1.5 font-label-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Security Infrastructure Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;
