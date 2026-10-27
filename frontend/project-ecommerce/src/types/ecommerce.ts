/**
 * Database schema interfaces matching scriptDb.sql table definitions.
 */

export interface User {
  id: number;
  email: string | null;
  phone: string;
  password_hash?: string;
  full_name: string;
  avatar_url: string | null;
  email_verified: number;
  status: 'ACTIVE' | 'LOCKED';
  role: 'client' | 'seller' | 'admin';
  created_at: string;
  updated_at: string;
}

export type UserRole = 'client' | 'seller' | 'admin';

export interface UserProfile {
  id: number;
  email: string | null;
  phone: string;
  full_name: string;
  avatar_url: string | null;
  email_verified: number;
  status: 'ACTIVE' | 'LOCKED';
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProfileDetails extends UserProfile {
  username?: string;
  phone_verified?: number;
  date_of_birth?: {
    day: string;
    month: string;
    year: string;
  };
  gender?: 'male' | 'female' | 'other';
  membership_tier?: string;
}

export interface UpdateProfilePayload {
  full_name: string;
  email?: string;
  phone?: string;
  username?: string;
  avatar_url?: string | null;
  date_of_birth?: {
    day: string;
    month: string;
    year: string;
  };
  gender?: 'male' | 'female' | 'other';
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RequestPasswordResetPayload {
  identity: string;
  mode: "email" | "phone";
}

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
  identity: string;
  mode: "email" | "phone";
}

export interface VerifyPasswordResetOtpPayload {
  identity: string;
  otp: string;
}

export interface VerifyPasswordResetOtpResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface ResetPasswordPayload {
  identity: string;
  resetToken?: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface Shop {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  warehouse_address: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  reject_reason: string | null;
  follower_count: number;
  badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN';
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: number;
}

export interface Product {
  id: number;
  shop_id: number;
  category_id: number;
  brand_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  sold_count: number;
  rating_avg: number;
  rating_count: number;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'HIDDEN' | 'REJECTED';
  reject_reason: string | null;
  is_deleted: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Extended Product item for UI rendering with relational & presentation data
 */
export interface ProductItem extends Product {
  category_name?: string;
  stock?: number;
  original_price?: number;
  discount_percent?: number;
  shop_name: string;
  shop_badge?: 'OFFICIAL' | 'MALL' | 'ARTISAN' | 'VERIFIED';
  tag?: string;
  badge_info?: string;
  claimed_percentage?: number;
  stock_alert?: string;
  is_flash_sale?: boolean;
}

export interface AdminProductItem {
  id: number;
  name: string;
  sku: string;
  thumbnail_url: string | null;
  shop_name: string;
  shop_badge: 'MALL' | 'ARTISAN' | 'VERIFIED' | 'OFFICIAL';
  category_name: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
}

export interface InventoryStats {
  totalSkus: number;
  newThisMonth: number;
  activeListings: number;
  activePercentage: number;
  lowStockCount: number;
  outOfStockCount: number;
}
