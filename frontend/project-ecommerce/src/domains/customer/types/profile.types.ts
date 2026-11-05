import type { UserRole } from '@/domains/auth/types/auth.types';

export interface UserProfile {
  id: number;
  email: string | null;
  phone: string;
  full_name: string;
  avatar_url: string | null;
  email_verified: number;
  status: 'ACTIVE' | 'LOCKED';
  role: UserRole;
  roles?: UserRole[];
  shop_status?: string;
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
