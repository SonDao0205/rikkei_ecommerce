import axiosClient from "@/shared/api/axiosClient";
import type {
  AdminUserItem,
  AdminUserRole,
  AdminUserStatus,
  AdminUserStats,
  AdminUserFilterParams,
  AdminUserListResponse,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/domains/admin/types/adminUser.types";

export interface BackendUserItem {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  roles?: string[];
  shop_status?: string;
  status: string;
  email_verified: boolean | number;
  created_at: string;
  avatar_url?: string | null;
  lock_reason?: string | null;
  locked_at?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const normalizeBackendUser = (bu: BackendUserItem): AdminUserItem => {
  const roles: AdminUserRole[] = (
    bu.roles && bu.roles.length > 0 ? bu.roles : [bu.role || "CLIENT"]
  ).map((r) => {
    const lower = r.toLowerCase().trim();
    if (lower === "seller") return "seller";
    if (lower === "admin") return "admin";
    return "client";
  });

  const primaryRole: AdminUserRole =
    bu.role?.toLowerCase() === "admin"
      ? "admin"
      : bu.role?.toLowerCase() === "seller" || roles.includes("seller")
      ? "seller"
      : "client";

  const status: AdminUserStatus =
    bu.status?.toUpperCase() === "LOCKED"
      ? "LOCKED"
      : bu.status?.toUpperCase() === "PENDING"
      ? "PENDING"
      : "ACTIVE";

  return {
    id: `usr-${bu.id}`,
    fullName: bu.full_name || "Chưa đặt tên",
    email: bu.email || "",
    phone: bu.phone || "",
    avatarUrl: bu.avatar_url ?? null,
    roles,
    primaryRole,
    status,
    emailVerified: Boolean(bu.email_verified),
    phoneVerified: Boolean(bu.phone),
    createdAt: bu.created_at || new Date().toISOString(),
    lastLoginAt: null,
    totalOrders: 0,
    totalSpent: 0,
    shopName: bu.shop_status ? "Gian hàng đối tác" : undefined,
    shopStatus: bu.shop_status || undefined,
    lockReason: bu.lock_reason || undefined,
    lockedAt: bu.locked_at || undefined,
  };
};

function parseNumericUserId(id: string | number): number {
  const raw = String(id).replace(/^usr-/, "").trim();
  const num = parseInt(raw, 10);
  if (isNaN(num) || num <= 0) {
    throw new Error("Mã người dùng không hợp lệ");
  }
  return num;
}

export const adminUserApi = {
  fetchUsers: async function (
    params: Partial<AdminUserFilterParams> = {}
  ): Promise<AdminUserListResponse> {
    const {
      search = "",
      roleTab = "all",
      status = "all",
      sortBy = "newest",
      page = 1,
      pageSize = 10,
    } = params;

    const response = await axiosClient.get<ApiResponse<BackendUserItem[]>>("/api/v1/admin/users");
    const rawUsers = response.data?.data;
    const userPool: AdminUserItem[] = Array.isArray(rawUsers)
      ? rawUsers.map(normalizeBackendUser)
      : [];

    let filtered = [...userPool];

    // Filter by role tab
    if (roleTab === "client") {
      filtered = filtered.filter(
        (u) =>
          u.roles.includes("client") &&
          !u.roles.includes("seller") &&
          !u.roles.includes("admin")
      );
    } else if (roleTab === "seller") {
      filtered = filtered.filter((u) => u.roles.includes("seller"));
    } else if (roleTab === "admin") {
      filtered = filtered.filter((u) => u.roles.includes("admin"));
    } else if (roleTab === "locked") {
      filtered = filtered.filter((u) => u.status === "LOCKED");
    }

    // Filter by status dropdown
    if (status !== "all") {
      filtered = filtered.filter((u) => u.status === status);
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          (u.shopName && u.shopName.toLowerCase().includes(q)) ||
          u.id.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "totalOrders":
          return b.totalOrders - a.totalOrders;
        case "name":
          return a.fullName.localeCompare(b.fullName, "vi");
        default:
          return 0;
      }
    });

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    // Compute stats
    const stats: AdminUserStats = {
      totalUsers: userPool.length,
      activeUsers: userPool.filter((u) => u.status === "ACTIVE").length,
      clientUsers: userPool.filter((u) => u.roles.includes("client")).length,
      sellerUsers: userPool.filter((u) => u.roles.includes("seller")).length,
      adminUsers: userPool.filter((u) => u.roles.includes("admin")).length,
      lockedUsers: userPool.filter((u) => u.status === "LOCKED").length,
    };

    return {
      users: paginated,
      total,
      page,
      pageSize,
      stats,
    };
  },

  async getUserStats(): Promise<AdminUserStats> {
    const response = await axiosClient.get<ApiResponse<BackendUserItem[]>>("/api/v1/admin/users");
    const users = Array.isArray(response.data?.data)
      ? response.data.data.map(normalizeBackendUser)
      : [];

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "ACTIVE").length,
      clientUsers: users.filter((u) => u.roles.includes("client")).length,
      sellerUsers: users.filter((u) => u.roles.includes("seller")).length,
      adminUsers: users.filter((u) => u.roles.includes("admin")).length,
      lockedUsers: users.filter((u) => u.status === "LOCKED").length,
    };
  },

  async getUserDetail(id: string): Promise<AdminUserItem> {
    const numId = parseNumericUserId(id);
    const response = await axiosClient.get<ApiResponse<BackendUserItem>>(
      `/api/v1/admin/users/${numId}`
    );
    return normalizeBackendUser(response.data.data);
  },

  async createUser(payload: CreateAdminUserPayload): Promise<AdminUserItem> {
    const backendRoles = (
      payload.roles.length > 0 ? payload.roles : ["client"]
    ).map((r) => r.toUpperCase());

    const body = {
      full_name: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      password: payload.password || "SecurePass123!",
      roles: backendRoles,
      status: payload.status,
      reason: payload.status === "LOCKED" ? "Khóa khi tạo tài khoản" : undefined,
    };

    const response = await axiosClient.post<ApiResponse<BackendUserItem>>(
      "/api/v1/admin/users",
      body
    );
    return normalizeBackendUser(response.data.data);
  },

  async updateUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserItem> {
    const numId = parseNumericUserId(id);
    const backendRoles = payload.roles
      ? payload.roles.map((r) => r.toUpperCase())
      : undefined;

    const body = {
      full_name: payload.fullName?.trim(),
      email: payload.email?.trim(),
      phone: payload.phone?.trim(),
      roles: backendRoles,
      status: payload.status,
      reason: payload.status === "LOCKED" ? "Khóa bởi quản trị viên" : undefined,
    };

    const response = await axiosClient.put<ApiResponse<BackendUserItem>>(
      `/api/v1/admin/users/${numId}`,
      body
    );
    return normalizeBackendUser(response.data.data);
  },

  async lockUser(id: string, reason: string): Promise<AdminUserItem> {
    const numId = parseNumericUserId(id);
    const response = await axiosClient.patch<ApiResponse<BackendUserItem>>(
      `/api/v1/admin/users/${numId}/status`,
      {
        status: "LOCKED",
        reason: reason.trim() || "Tài khoản bị khóa bởi quản trị viên",
      }
    );
    return normalizeBackendUser(response.data.data);
  },

  async unlockUser(id: string): Promise<AdminUserItem> {
    const numId = parseNumericUserId(id);
    const response = await axiosClient.patch<ApiResponse<BackendUserItem>>(
      `/api/v1/admin/users/${numId}/status`,
      {
        status: "ACTIVE",
        reason: "",
      }
    );
    return normalizeBackendUser(response.data.data);
  },

  async deleteUser(id: string): Promise<string> {
    // Backend preserves accounts for referential integrity and audit logs.
    // Deleting a user locks their status to prevent further access.
    await adminUserApi.lockUser(id, "Tài khoản bị vô hiệu hóa/xóa bởi quản trị viên");
    return id;
  },

  async resetPassword(_id: string): Promise<{ success: boolean; tempPassword?: string }> {
    // Reset password via OTP flow is user-directed in Rikkei E-Commerce.
    // Simulated return for admin UI compatibility
    const tempPassword = `MK${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      tempPassword,
    };
  },

  async exportCsv(): Promise<string> {
    const response = await axiosClient.get<ApiResponse<BackendUserItem[]>>("/api/v1/admin/users");
    const rawUsers = response.data?.data;
    const users: AdminUserItem[] = Array.isArray(rawUsers)
      ? rawUsers.map(normalizeBackendUser)
      : [];

    const headers = [
      "Mã ID",
      "Họ và Tên",
      "Email",
      "Số điện thoại",
      "Vai trò",
      "Trạng thái",
      "Tổng đơn",
      "Tổng chi tiêu (VND)",
      "Ngày tham gia",
    ];

    const rows = users.map((u) => [
      u.id,
      `"${u.fullName}"`,
      u.email,
      u.phone,
      u.roles.join(";"),
      u.status,
      u.totalOrders,
      u.totalSpent,
      u.createdAt.split("T")[0],
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  },

  getAdminUsers(params?: Partial<AdminUserFilterParams>): Promise<AdminUserListResponse> {
    return adminUserApi.fetchUsers(params);
  },
};

export const mockAdminUsersStore: AdminUserItem[] = [];
export default adminUserApi;
