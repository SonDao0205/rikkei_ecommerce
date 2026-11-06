// Base HTTP Client
export * from "@/shared/api/axiosClient";
export { default as axiosClient } from "@/shared/api/axiosClient";

// Auth API
export * from "@/domains/auth/api/authApi";

// Admin APIs
export * from "@/domains/admin/api/adminDashboardApi";
export * from "@/domains/admin/api/adminOrderApi";
export * from "@/domains/admin/api/adminShopApi";

// User / Profile APIs
export * from "@/domains/customer/api/profileApi";
export * from "@/domains/customer/api/addressApi";

// Product API
export * from "@/domains/storefront/api/productApi";

// Public Shop API
export * from "@/domains/shop/api/shopApi";
export * from "@/domains/shop/api/shopRegisterApi";
