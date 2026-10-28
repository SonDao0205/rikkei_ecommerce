import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import productReducer from "./slices/productSlice";
import adminProductReducer from "./slices/adminProductSlice";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import adminDashboardReducer from "./slices/adminDashboardSlice";
import adminOrderReducer from "./slices/adminOrderSlice";

export const store = configureStore({
  reducer: {
    product: productReducer,
    adminProduct: adminProductReducer,
    auth: authReducer,
    profile: profileReducer,
    adminDashboard: adminDashboardReducer,
    adminOrder: adminOrderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
