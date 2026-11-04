import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import productReducer from "./slices/product/productSlice";
import adminProductReducer from "./slices/admin/adminProductSlice";
import authReducer from "./slices/auth/authSlice";
import profileReducer from "./slices/user/profileSlice";
import adminDashboardReducer from "./slices/admin/adminDashboardSlice";
import adminOrderReducer from "./slices/admin/adminOrderSlice";
import addressReducer from "./slices/user/addressSlice";
import adminShopReducer from "./slices/admin/adminShopSlice";
import publicShopReducer from "./slices/shop/publicShopSlice";
import shopRegisterReducer from "./slices/shop/shopRegisterSlice";
import shopDashboardReducer from "./slices/shop/shopDashboardSlice";
import shopProductReducer from "./slices/shop/shopProductSlice";
import userOrderReducer from "./slices/user/orderSlice";
import myShopReducer from "./slices/shop/myShopSlice";

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
    publicShop: publicShopReducer,
    shopRegister: shopRegisterReducer,
    shopDashboard: shopDashboardReducer,
    shopProduct: shopProductReducer,
    userOrder: userOrderReducer,
    myShop: myShopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
