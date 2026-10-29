// Reducers
export { default as adminDashboardReducer } from "./admin/adminDashboardSlice";
export { default as adminOrderReducer } from "./admin/adminOrderSlice";
export { default as adminProductReducer } from "./admin/adminProductSlice";
export { default as authReducer } from "./auth/authSlice";
export { default as profileReducer } from "./user/profileSlice";
export { default as addressReducer } from "./user/addressSlice";
export { default as productReducer } from "./product/productSlice";
export { default as adminShopReducer } from "./admin/adminShopSlice";

// Slices / Actions (namespaced to avoid action name collision like clearAllFilters, setCurrentPage)
export * as adminDashboardSlice from "./admin/adminDashboardSlice";
export * as adminOrderSlice from "./admin/adminOrderSlice";
export * as adminProductSlice from "./admin/adminProductSlice";
export * as authSlice from "./auth/authSlice";
export * as profileSlice from "./user/profileSlice";
export * as addressSlice from "./user/addressSlice";
export * as productSlice from "./product/productSlice";
export * as adminShopSlice from "./admin/adminShopSlice";
