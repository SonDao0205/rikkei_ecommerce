import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-margin-lg">
      <div className="max-w-[1440px] mx-auto px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl border-b border-outline-variant">
          {/* Brand & Guarantee */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[20px]">
                  deployed_code
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                MarketPulse
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Vietnam&apos;s premier multi-store commerce collective. Connecting discerning buyers
              with certified local artisans, curated brands, and independent designers.
            </p>
            <div className="flex items-center gap-space-md pt-2">
              <div className="flex items-center gap-2 p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  verified_user
                </span>
                <div>
                  <div className="font-label-sm text-label-sm font-bold text-on-surface">
                    100% Genuine Guarantee
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Strict vendor onboarding audit
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Protection */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold mb-2">
              Buyer Protection
            </h4>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Track Package
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Refund &amp; Return Policy
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Escrow Escort Protection
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Dispute Resolution
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Consumer Rights VN
            </Link>
          </div>

          {/* Merchant Ecosystem */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold mb-2">
              Merchant Ecosystem
            </h4>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Sell on MarketPulse
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Seller Standards &amp; Policy
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Warehouse &amp; Fulfilled by MP
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Artisan Incubator Grants
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              Merchant Dashboard Login
            </Link>
          </div>

          {/* Stay Updated */}
          <div className="flex flex-col gap-space-md">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
              Stay Updated
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Subscribe for exclusive drops, curated editorial stories, and secret sale passes.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-body-sm font-body-sm focus:outline-none focus:border-primary"
                placeholder="Enter your email address"
                type="email"
              />
              <button
                type="submit"
                className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
              >
                Join Newsletter
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div>
            © 2025 MarketPulse Technologies Vietnam JSC. Enterprise License No. 0108892461.
          </div>
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="font-label-sm text-label-sm font-bold uppercase text-outline">
              Accepted Payments:
            </span>
            <span className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-[11px]">
              Visa
            </span>
            <span className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-[11px]">
              Mastercard
            </span>
            <span className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-[11px]">
              MoMo Wallet
            </span>
            <span className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-[11px]">
              Cash on Delivery (COD)
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <Link className="hover:text-on-surface transition-colors" to="#">
              Privacy
            </Link>
            <Link className="hover:text-on-surface transition-colors" to="#">
              Terms
            </Link>
            <Link className="hover:text-on-surface transition-colors" to="#">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
