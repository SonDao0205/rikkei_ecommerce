import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BrandIcon } from "@/shared/components/common/BrandLogo";

const Footer: React.FC = () => {
  const { t } = useTranslation('customer');
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setEmail("");
  }
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-margin-lg">
      <div className="max-w-[1440px] mx-auto px-margin-lg pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl border-b border-outline-variant">
          {/* Brand & Guarantee */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BrandIcon className="w-5 h-5 text-on-primary" />
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                MarketPulse
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              {t("footer.brand_desc")}
            </p>
            <div className="flex items-center gap-space-md pt-2">
              <div className="flex items-center gap-2 p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  verified_user
                </span>
                <div>
                  <div className="font-label-sm text-label-sm font-bold text-on-surface">
                    {t("footer.guarantee_title")}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {t("footer.guarantee_desc")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Protection */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold mb-2">
              {t("footer.buyer_protection.title")}
            </h4>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.buyer_protection.track_package")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.buyer_protection.refund_policy")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.buyer_protection.escrow_protection")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.buyer_protection.dispute_resolution")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.buyer_protection.consumer_rights")}
            </Link>
          </div>

          {/* Merchant Ecosystem */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold mb-2">
              {t("footer.merchant_ecosystem.title")}
            </h4>
            <div className="font-body-md text-body-md text-on-surface flex items-center gap-1.5 py-1">
              <span>{t("footer.merchant_ecosystem.register_shop_label")}</span>
              <Link
                className="text-primary font-bold hover:underline"
                to="/register-open-shop"
              >
                {t("footer.merchant_ecosystem.register_now")}
              </Link>
            </div>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="/register-open-shop">
              {t("footer.merchant_ecosystem.sell_on_mp")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.merchant_ecosystem.seller_standards")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.merchant_ecosystem.warehouse_fulfillment")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="#">
              {t("footer.merchant_ecosystem.artisan_grants")}
            </Link>
            <Link className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface transition-colors" to="/admin/shops">
              {t("footer.merchant_ecosystem.merchant_login")}
            </Link>
          </div>

          {/* Stay Updated */}
          <div className="flex flex-col gap-space-md">
            <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
              {t("footer.newsletter.title")}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t("footer.newsletter.desc")}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                className="w-full h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant text-body-sm font-body-sm focus:outline-none focus:border-primary"
                placeholder={t("footer.newsletter.placeholder")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
              >
                {t("footer.newsletter.button")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div>
            {t("footer.bottom.license")}
          </div>
          <div className="flex flex-wrap items-center gap-space-md">
            <span className="font-label-sm text-label-sm font-bold uppercase text-outline">
              {t("footer.bottom.payments_title")}
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
              {t("footer.bottom.privacy")}
            </Link>
            <Link className="hover:text-on-surface transition-colors" to="#">
              {t("footer.bottom.terms")}
            </Link>
            <Link className="hover:text-on-surface transition-colors" to="#">
              {t("footer.bottom.security")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
