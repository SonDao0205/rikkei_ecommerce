import type { UserProfile } from '../user/profile.types';
export type { UserProfile };

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
