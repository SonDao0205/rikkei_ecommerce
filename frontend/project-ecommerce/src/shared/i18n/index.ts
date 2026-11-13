import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viCommon from '@/shared/locales/vi/common.json';
import enCommon from '@/shared/locales/en/common.json';
import viNav from '@/shared/locales/vi/nav.json';
import enNav from '@/shared/locales/en/nav.json';
import viShop from '@/shared/locales/vi/shop.json';
import enShop from '@/shared/locales/en/shop.json';
import viCustomerHeader from '@/shared/locales/vi/customer/header.json';
import viCustomerFooter from '@/shared/locales/vi/customer/footer.json';
import viCustomerHome from '@/shared/locales/vi/customer/home.json';
import viCustomerProduct from '@/shared/locales/vi/customer/product.json';
import viCustomerPublicShop from '@/shared/locales/vi/customer/public_shop.json';
import enCustomerHeader from '@/shared/locales/en/customer/header.json';
import enCustomerFooter from '@/shared/locales/en/customer/footer.json';
import enCustomerHome from '@/shared/locales/en/customer/home.json';
import enCustomerProduct from '@/shared/locales/en/customer/product.json';
import enCustomerPublicShop from '@/shared/locales/en/customer/public_shop.json';

export const defaultNS = 'common';

export const resources = {
  vi: {
    common: viCommon,
    nav: viNav,
    shop: viShop,
    customer: {
      header: viCustomerHeader,
      footer: viCustomerFooter,
      home: viCustomerHome,
      product: viCustomerProduct,
      public_shop: viCustomerPublicShop,
    },
  },
  en: {
    common: enCommon,
    nav: enNav,
    shop: enShop,
    customer: {
      header: enCustomerHeader,
      footer: enCustomerFooter,
      home: enCustomerHome,
      product: enCustomerProduct,
      public_shop: enCustomerPublicShop,
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;

