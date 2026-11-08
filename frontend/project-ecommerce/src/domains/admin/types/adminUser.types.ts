export type AdminUserRole = "client" | "seller" | "admin";

export type AdminUserStatus = "ACTIVE" | "LOCKED" | "PENDING";

export interface AdminUserAddress {
  id: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
  type: "HOME" | "OFFICE" | "OTHER";
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  roles: AdminUserRole[];
  primaryRole: AdminUserRole;
  status: AdminUserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  totalOrders: number;
  totalSpent: number;
  shopName?: string;
  shopStatus?: string;
  lockReason?: string;
  lockedAt?: string;
  addresses?: AdminUserAddress[];
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  clientUsers: number;
  sellerUsers: number;
  adminUsers: number;
  lockedUsers: number;
}

export type AdminUserRoleTab = "all" | AdminUserRole | "locked";

export interface AdminUserFilterParams {
  search: string;
  roleTab: AdminUserRoleTab;
  status: "all" | AdminUserStatus;
  sortBy: "newest" | "oldest" | "totalSpent" | "totalOrders" | "name";
  page: number;
  pageSize: number;
}

export interface CreateAdminUserPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  roles: AdminUserRole[];
  status: AdminUserStatus;
}

export interface UpdateAdminUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  roles?: AdminUserRole[];
  status?: AdminUserStatus;
}

export interface AdminUserListResponse {
  users: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: AdminUserStats;
}

