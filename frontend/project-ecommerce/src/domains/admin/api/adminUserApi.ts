import axiosClient, { shouldFallbackToMock } from "@/shared/api/axiosClient";
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
    avatarUrl: null,
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
  };
};

export let mockAdminUsersStore: AdminUserItem[] = [
  {
    id: "usr-1001",
    fullName: "Hoàng Minh Quang",
    email: "hoangminhquang@gmail.com",
    phone: "0912345678",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    roles: ["client", "seller"],
    primaryRole: "seller",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-01-15T08:30:00Z",
    lastLoginAt: "2026-11-08T10:15:00Z",
    totalOrders: 18,
    totalSpent: 42500000,
    shopName: "MarketPulse Studio",
    shopStatus: "ACTIVE",
    addresses: [
      {
        id: "addr-1",
        recipientName: "Hoàng Minh Quang",
        phone: "0912345678",
        fullAddress: "Tầng 5, Tòa nhà Keangnam, Mễ Trì, Nam Từ Liêm, Hà Nội",
        isDefault: true,
        type: "OFFICE",
      },
    ],
  },
  {
    id: "usr-1002",
    fullName: "Nguyễn Thu Hà",
    email: "thuha.nguyen@outlook.com",
    phone: "0987654321",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    roles: ["client"],
    primaryRole: "client",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-03-20T14:20:00Z",
    lastLoginAt: "2026-11-07T18:45:00Z",
    totalOrders: 32,
    totalSpent: 18900000,
    addresses: [
      {
        id: "addr-2",
        recipientName: "Nguyễn Thu Hà",
        phone: "0987654321",
        fullAddress: "Số 45, Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        isDefault: true,
        type: "HOME",
      },
    ],
  },
  {
    id: "usr-1003",
    fullName: "Trần Anh Đức",
    email: "anhduc.tech@gmail.com",
    phone: "0903112233",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    roles: ["client", "seller"],
    primaryRole: "seller",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-02-10T09:12:00Z",
    lastLoginAt: "2026-11-08T07:22:00Z",
    totalOrders: 9,
    totalSpent: 8750000,
    shopName: "Gia Dụng Thông Minh Đức Phát",
    shopStatus: "ACTIVE",
    addresses: [
      {
        id: "addr-3",
        recipientName: "Trần Anh Đức",
        phone: "0903112233",
        fullAddress: "Khu đô thị Sala, Mai Chí Thọ, TP. Thủ Đức, TP. Hồ Chí Minh",
        isDefault: true,
        type: "OFFICE",
      },
    ],
  },
  {
    id: "usr-1004",
    fullName: "Lê Hoàng Yến",
    email: "hoangyen.le@gmail.com",
    phone: "0934567890",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    roles: ["client"],
    primaryRole: "client",
    status: "LOCKED",
    emailVerified: true,
    phoneVerified: false,
    createdAt: "2026-05-18T11:00:00Z",
    lastLoginAt: "2026-10-12T16:00:00Z",
    totalOrders: 2,
    totalSpent: 450000,
    lockReason: "Nghi vấn gian lận đặt hàng ảo và bùng cọc COD nhiều lần",
    lockedAt: "2026-10-15T09:00:00Z",
    addresses: [
      {
        id: "addr-4",
        recipientName: "Lê Hoàng Yến",
        phone: "0934567890",
        fullAddress: "128 Nguyễn Trãi, Thanh Xuân Bắc, Thanh Xuân, Hà Nội",
        isDefault: true,
        type: "HOME",
      },
    ],
  },
  {
    id: "usr-1005",
    fullName: "Admin Tổng Hệ Thống",
    email: "admin@rikkei.vn",
    phone: "0988001122",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    roles: ["admin"],
    primaryRole: "admin",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2025-12-01T00:00:00Z",
    lastLoginAt: "2026-11-08T11:00:00Z",
    totalOrders: 0,
    totalSpent: 0,
  },
  {
    id: "usr-1006",
    fullName: "Phạm Hải Đăng",
    email: "haidang.fashion@gmail.com",
    phone: "0971239876",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    roles: ["client", "seller"],
    primaryRole: "seller",
    status: "PENDING",
    emailVerified: false,
    phoneVerified: true,
    createdAt: "2026-11-02T13:40:00Z",
    lastLoginAt: "2026-11-06T15:10:00Z",
    totalOrders: 1,
    totalSpent: 350000,
    shopName: "Đăng Store Unisex",
    shopStatus: "PENDING",
  },
  {
    id: "usr-1007",
    fullName: "Vũ Phương Linh",
    email: "phuonglinh.vu@gmail.com",
    phone: "0945671234",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    roles: ["client"],
    primaryRole: "client",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-06-14T10:05:00Z",
    lastLoginAt: "2026-11-07T21:30:00Z",
    totalOrders: 15,
    totalSpent: 9800000,
    addresses: [
      {
        id: "addr-7",
        recipientName: "Vũ Phương Linh",
        phone: "0945671234",
        fullAddress: "88 Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội",
        isDefault: true,
        type: "HOME",
      },
    ],
  },
  {
    id: "usr-1008",
    fullName: "Đỗ Quốc Bảo",
    email: "quocbao.do@gmail.com",
    phone: "0963221155",
    avatarUrl: null,
    roles: ["client"],
    primaryRole: "client",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: false,
    createdAt: "2026-08-09T17:50:00Z",
    lastLoginAt: "2026-11-05T12:00:00Z",
    totalOrders: 7,
    totalSpent: 3200000,
  },
  {
    id: "usr-1009",
    fullName: "Bùi Thanh Hương",
    email: "thanhhuong.cosmetics@gmail.com",
    phone: "0922889900",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    roles: ["client", "seller"],
    primaryRole: "seller",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-04-11T09:30:00Z",
    lastLoginAt: "2026-11-08T08:10:00Z",
    totalOrders: 24,
    totalSpent: 16500000,
    shopName: "Hương Cosmetics Korea",
    shopStatus: "ACTIVE",
  },
  {
    id: "usr-1010",
    fullName: "Nguyễn Trọng Tín",
    email: "trongtin.nguyen@gmail.com",
    phone: "0909876543",
    avatarUrl: null,
    roles: ["client"],
    primaryRole: "client",
    status: "LOCKED",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2026-07-01T15:20:00Z",
    lastLoginAt: "2026-09-30T10:15:00Z",
    totalOrders: 3,
    totalSpent: 1200000,
    lockReason: "Vi phạm chính sách đánh giá spam tiêu cực và tống tiền người bán",
    lockedAt: "2026-10-02T14:30:00Z",
  },
];

export const adminUserApi = {
  async getAdminUsers(params: Partial<AdminUserFilterParams> = {}): Promise<AdminUserListResponse> {
    const {
      search = "",
      roleTab = "all",
      status = "all",
      sortBy = "newest",
      page = 1,
      pageSize = 10,
    } = params;

    let userPool: AdminUserItem[];

    try {
      const response = await axiosClient.get<ApiResponse<BackendUserItem[]>>("/api/v1/admin/users");
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        userPool = response.data.data.map(normalizeBackendUser);
        if (userPool.length > 0) {
          mockAdminUsersStore = userPool;
        }
      } else {
        userPool = [...mockAdminUsersStore];
      }
    } catch (error) {
      if (shouldFallbackToMock(error) || (error as { code?: string })?.code === "ERR_NETWORK") {
        userPool = [...mockAdminUsersStore];
      } else {
        userPool = [...mockAdminUsersStore];
      }
    }

    let filtered = [...userPool];

    // Filter by role tab
    if (roleTab === "client") {
      filtered = filtered.filter((u) => u.roles.includes("client") && !u.roles.includes("seller") && !u.roles.includes("admin"));
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
    try {
      const response = await axiosClient.get<ApiResponse<BackendUserItem[]>>("/api/v1/admin/users");
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const users = response.data.data.map(normalizeBackendUser);
        return {
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.status === "ACTIVE").length,
          clientUsers: users.filter((u) => u.roles.includes("client")).length,
          sellerUsers: users.filter((u) => u.roles.includes("seller")).length,
          adminUsers: users.filter((u) => u.roles.includes("admin")).length,
          lockedUsers: users.filter((u) => u.status === "LOCKED").length,
        };
      }
    } catch {
      // fallback to mock
    }

    return {
      totalUsers: mockAdminUsersStore.length,
      activeUsers: mockAdminUsersStore.filter((u) => u.status === "ACTIVE").length,
      clientUsers: mockAdminUsersStore.filter((u) => u.roles.includes("client")).length,
      sellerUsers: mockAdminUsersStore.filter((u) => u.roles.includes("seller")).length,
      adminUsers: mockAdminUsersStore.filter((u) => u.roles.includes("admin")).length,
      lockedUsers: mockAdminUsersStore.filter((u) => u.status === "LOCKED").length,
    };
  },

  async getUserDetail(id: string): Promise<AdminUserItem> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const user = mockAdminUsersStore.find((u) => u.id === id);
    if (!user) throw new Error("Không tìm thấy người dùng");
    return user;
  },

  async createUser(payload: CreateAdminUserPayload): Promise<AdminUserItem> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Check duplicate email
    if (mockAdminUsersStore.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error("Email này đã được sử dụng");
    }

    const primaryRole = payload.roles.includes("admin")
      ? "admin"
      : payload.roles.includes("seller")
      ? "seller"
      : "client";

    const newUser: AdminUserItem = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      avatarUrl: null,
      roles: payload.roles.length > 0 ? payload.roles : ["client"],
      primaryRole,
      status: payload.status,
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      totalOrders: 0,
      totalSpent: 0,
      addresses: [],
    };

    mockAdminUsersStore = [newUser, ...mockAdminUsersStore];
    return newUser;
  },

  async updateUser(id: string, payload: UpdateAdminUserPayload): Promise<AdminUserItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = mockAdminUsersStore.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Không tìm thấy người dùng");

    const current = mockAdminUsersStore[index];
    const roles = payload.roles ?? current.roles;
    const primaryRole = roles.includes("admin")
      ? "admin"
      : roles.includes("seller")
      ? "seller"
      : "client";

    const updated: AdminUserItem = {
      ...current,
      fullName: payload.fullName ?? current.fullName,
      email: payload.email ?? current.email,
      phone: payload.phone ?? current.phone,
      roles,
      primaryRole,
      status: payload.status ?? current.status,
    };

    mockAdminUsersStore[index] = updated;
    return updated;
  },

  async lockUser(id: string, reason: string): Promise<AdminUserItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockAdminUsersStore.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Không tìm thấy người dùng");

    const updated: AdminUserItem = {
      ...mockAdminUsersStore[index],
      status: "LOCKED",
      lockReason: reason,
      lockedAt: new Date().toISOString(),
    };

    mockAdminUsersStore[index] = updated;
    return updated;
  },

  async unlockUser(id: string): Promise<AdminUserItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = mockAdminUsersStore.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Không tìm thấy người dùng");

    const updated: AdminUserItem = {
      ...mockAdminUsersStore[index],
      status: "ACTIVE",
      lockReason: undefined,
      lockedAt: undefined,
    };

    mockAdminUsersStore[index] = updated;
    return updated;
  },

  async deleteUser(id: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const exists = mockAdminUsersStore.some((u) => u.id === id);
    if (!exists) throw new Error("Không tìm thấy người dùng");

    mockAdminUsersStore = mockAdminUsersStore.filter((u) => u.id !== id);
    return id;
  },

  async resetPassword(id: string): Promise<{ success: boolean; tempPassword?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const user = mockAdminUsersStore.find((u) => u.id === id);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const tempPassword = `MK${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      tempPassword,
    };
  },

  async exportCsv(): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 300));
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

    const rows = mockAdminUsersStore.map((u) => [
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

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return csvContent;
  },
};

