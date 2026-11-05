// Reducers
export { default as adminDashboardReducer } from "@/domains/admin/state/adminDashboardSlice";
export { default as adminOrderReducer } from "@/domains/admin/state/adminOrderSlice";
export { default as adminProductReducer } from "@/domains/admin/state/adminProductSlice";
export { default as authReducer } from "@/domains/auth/state/authSlice";
export { default as profileReducer } from "@/domains/customer/state/profileSlice";
export { default as addressReducer } from "@/domains/customer/state/addressSlice";
export { default as productReducer } from "@/domains/storefront/state/productSlice";
export { default as adminShopReducer } from "@/domains/admin/state/adminShopSlice";
export { default as publicShopReducer } from "@/domains/shop/state/publicShopSlice";
export { default as shopRegisterReducer } from "@/domains/shop/state/shopRegisterSlice";
export { default as userOrderReducer } from "@/domains/customer/state/orderSlice";

// Slices / Actions (namespaced to avoid action name collision like clearAllFilters, setCurrentPage)
export * as adminDashboardSlice from "@/domains/admin/state/adminDashboardSlice";
export * as adminOrderSlice from "@/domains/admin/state/adminOrderSlice";
export * as adminProductSlice from "@/domains/admin/state/adminProductSlice";
export * as authSlice from "@/domains/auth/state/authSlice";
export * as profileSlice from "@/domains/customer/state/profileSlice";
export * as addressSlice from "@/domains/customer/state/addressSlice";
export * as productSlice from "@/domains/storefront/state/productSlice";
export * as adminShopSlice from "@/domains/admin/state/adminShopSlice";
export * as publicShopSlice from "@/domains/shop/state/publicShopSlice";
export * as shopRegisterSlice from "@/domains/shop/state/shopRegisterSlice";
export * as userOrderSlice from "@/domains/customer/state/orderSlice";
