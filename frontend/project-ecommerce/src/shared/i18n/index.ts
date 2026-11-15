import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viCommon from '@/shared/locales/vi/common.json';
import enCommon from '@/shared/locales/en/common.json';
import viCustomerHeader from '@/shared/locales/vi/customer/header.json';
import viCustomerFooter from '@/shared/locales/vi/customer/footer.json';
import viCustomerHome from '@/shared/locales/vi/customer/home.json';
import viCustomerProduct from '@/shared/locales/vi/customer/product.json';
import viCustomerPublicShop from '@/shared/locales/vi/customer/public_shop.json';
import viCustomerCart from '@/shared/locales/vi/customer/cart.json';
import viCustomerCheckout from '@/shared/locales/vi/customer/checkout.json';
import viCustomerOrderComplete from '@/shared/locales/vi/customer/order_complete.json';
import viCustomerWishlist from '@/shared/locales/vi/customer/wishlist.json';
import viCustomerProfile from '@/shared/locales/vi/customer/profile.json';
import enCustomerHeader from '@/shared/locales/en/customer/header.json';
import enCustomerFooter from '@/shared/locales/en/customer/footer.json';
import enCustomerHome from '@/shared/locales/en/customer/home.json';
import enCustomerProduct from '@/shared/locales/en/customer/product.json';
import enCustomerPublicShop from '@/shared/locales/en/customer/public_shop.json';
import enCustomerCart from '@/shared/locales/en/customer/cart.json';
import enCustomerCheckout from '@/shared/locales/en/customer/checkout.json';
import enCustomerOrderComplete from '@/shared/locales/en/customer/order_complete.json';
import enCustomerWishlist from '@/shared/locales/en/customer/wishlist.json';
import enCustomerProfile from '@/shared/locales/en/customer/profile.json';

export const defaultNS = 'common';

export const resources = {
  vi: {
    common: viCommon,
    customer: {
      header: viCustomerHeader,
      footer: viCustomerFooter,
      home: viCustomerHome,
      product: viCustomerProduct,
      public_shop: viCustomerPublicShop,
      cart: viCustomerCart,
      checkout: viCustomerCheckout,
      order_complete: viCustomerOrderComplete,
      wishlist: viCustomerWishlist,
      profile: viCustomerProfile,
    },
  },
  en: {
    common: enCommon,
    customer: {
      header: enCustomerHeader,
      footer: enCustomerFooter,
      home: enCustomerHome,
      product: enCustomerProduct,
      public_shop: enCustomerPublicShop,
      cart: enCustomerCart,
      checkout: enCustomerCheckout,
      order_complete: enCustomerOrderComplete,
      wishlist: enCustomerWishlist,
      profile: enCustomerProfile,
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

