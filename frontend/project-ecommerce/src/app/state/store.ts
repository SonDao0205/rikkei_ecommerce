import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import productReducer from "@/domains/storefront/state/productSlice";
import adminProductReducer from "@/domains/admin/state/adminProductSlice";
import authReducer from "@/domains/auth/state/authSlice";
import profileReducer from "@/domains/customer/state/profileSlice";
import adminDashboardReducer from "@/domains/admin/state/adminDashboardSlice";
import adminOrderReducer from "@/domains/admin/state/adminOrderSlice";
import addressReducer from "@/domains/customer/state/addressSlice";
import adminShopReducer from "@/domains/admin/state/adminShopSlice";
import adminUserReducer from "@/domains/admin/state/adminUserSlice";
import publicShopReducer from "@/domains/shop/state/publicShopSlice";
import shopRegisterReducer from "@/domains/shop/state/shopRegisterSlice";
import shopDashboardReducer from "@/domains/shop/state/shopDashboardSlice";
import shopProductReducer from "@/domains/shop/state/shopProductSlice";
import userOrderReducer from "@/domains/customer/state/orderSlice";
import myShopReducer from "@/domains/shop/state/myShopSlice";
import cartReducer from "@/domains/customer/state/cartSlice";
import wishlistReducer from "@/domains/customer/state/wishlistSlice";
import shopOrderReducer from "@/domains/shop/state/shopOrderSlice";
import shopVoucherReducer from "@/domains/shop/state/shopVoucherSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    adminProduct: adminProductReducer,
    auth: authReducer,
    profile: profileReducer,
    adminDashboard: adminDashboardReducer,
    adminOrder: adminOrderReducer,
    address: addressReducer,
    adminShop: adminShopReducer,
    adminUser: adminUserReducer,
    publicShop: publicShopReducer,
    shopRegister: shopRegisterReducer,
    shopDashboard: shopDashboardReducer,
    shopProduct: shopProductReducer,
    shopOrder: shopOrderReducer,
    shopVoucher: shopVoucherReducer,
    userOrder: userOrderReducer,
    myShop: myShopReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
