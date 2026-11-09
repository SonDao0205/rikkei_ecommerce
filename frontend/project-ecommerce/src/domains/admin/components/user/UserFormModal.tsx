import React, { useState } from "react";
import type {
  AdminUserItem,
  AdminUserRole,
  AdminUserStatus,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "@/domains/admin/types/adminUser.types";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (payload: CreateAdminUserPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateAdminUserPayload) => Promise<void>;
  editingUser: AdminUserItem | null;
  isSaving: boolean;
}

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roles: AdminUserRole[];
  status: AdminUserStatus;
}

const getInitialState = (user: AdminUserItem | null): FormState => {
  if (user) {
    return {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: "",
      roles: [...user.roles],
      status: user.status,
    };
  }
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    roles: ["client"],
    status: "ACTIVE",
  };
};

interface FormContentProps {
  onClose: () => void;
  onSubmitCreate: (payload: CreateAdminUserPayload) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdateAdminUserPayload) => Promise<void>;
  editingUser: AdminUserItem | null;
  isSaving: boolean;
}

const FormContent: React.FC<FormContentProps> = ({
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingUser,
  isSaving,
}) => {
  const [formData, setFormData] = useState<FormState>(() => getInitialState(editingUser));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Họ và tên không được để trống";
    }

    if (!formData.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Định dạng email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{9,11}$/.test(formData.phone.replace(/\s+/g, ""))) {
      errors.phone = "Số điện thoại phải từ 9 - 11 chữ số";
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = "Mật khẩu không được để trống khi tạo mới";
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.roles.length === 0) {
      errors.roles = "Vui lòng chọn ít nhất một vai trò";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRoleToggle = (role: AdminUserRole) => {
    if (formData.roles.includes(role)) {
      // Don't allow removing all roles
      if (formData.roles.length > 1) {
        setFormData({
          ...formData,
          roles: formData.roles.filter((r) => r !== role),
        });
      }
    } else {
      setFormData({
        ...formData,
        roles: [...formData.roles, role],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingUser) {
      await onSubmitUpdate(editingUser.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roles: formData.roles,
        status: formData.status,
      });
    } else {
      await onSubmitCreate({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        roles: formData.roles,
        status: formData.status,
      });
    }
  };

  return (
    <div
      className="bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">
              {editingUser ? "manage_accounts" : "person_add"}
            </span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </h2>
            <p className="font-body-xs text-body-xs text-on-surface-variant">
              {editingUser ? `Cập nhật thông tin cho ${editingUser.fullName}` : "Khởi tạo tài khoản và phân quyền vai trò trên hệ thống"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
        {/* Full Name */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
            Họ và tên <span className="text-error">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Nguyễn Văn An"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
          {formErrors.fullName && (
            <p className="text-error text-xs mt-1">{formErrors.fullName}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Email <span className="text-error">*</span>
            </label>
            <input
              type="email"
              placeholder="VD: user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.email && (
              <p className="text-error text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Số điện thoại <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 0912345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.phone && (
              <p className="text-error text-xs mt-1">{formErrors.phone}</p>
            )}
          </div>
        </div>

        {/* Password (only on create) */}
        {!editingUser && (
          <div>
            <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
              Mật khẩu khởi tạo <span className="text-error">*</span>
            </label>
            <input
              type="password"
              placeholder="Nhập tối thiểu 6 ký tự"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
            {formErrors.password && (
              <p className="text-error text-xs mt-1">{formErrors.password}</p>
            )}
          </div>
        )}

        {/* Roles Selection */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">
            Phân quyền vai trò (Roles) <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: "client", label: "Khách hàng", desc: "Mua sắm, đặt đơn", icon: "person" },
              { id: "seller", label: "Người bán", desc: "Kênh gian hàng", icon: "storefront" },
              { id: "admin", label: "Quản trị viên", desc: "Toàn quyền quản trị", icon: "shield_person" },
            ].map((role) => {
              const isChecked = formData.roles.includes(role.id as AdminUserRole);
              return (
                <div
                  key={role.id}
                  onClick={() => handleRoleToggle(role.id as AdminUserRole)}
                  className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    isChecked
                      ? "border-primary bg-primary/5 text-primary shadow-2xs"
                      : "border-outline-variant/30 hover:bg-surface-container-high/40 text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-[20px]">{role.icon}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-outline-variant text-primary focus:ring-primary pointer-events-none"
                    />
                  </div>
                  <div className="font-semibold text-xs text-on-surface">{role.label}</div>
                  <div className="text-[11px] text-on-surface-variant">{role.desc}</div>
                </div>
              );
            })}
          </div>
          {formErrors.roles && (
            <p className="text-error text-xs mt-1">{formErrors.roles}</p>
          )}
        </div>

        {/* Status Selection */}
        <div>
          <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1.5">
            Trạng thái tài khoản
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminUserStatus })}
            className="w-full px-4 py-2.5 bg-surface-container-low rounded-xl font-body-sm text-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="LOCKED">Bị khoá (LOCKED)</option>
            <option value="PENDING">Chờ duyệt (PENDING)</option>
          </select>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl font-label-md text-label-md font-medium transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-label-md text-label-md font-semibold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>{editingUser ? "Cập nhật" : "Tạo người dùng"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  editingUser,
  isSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <FormContent
        key={editingUser ? `edit-${editingUser.id}` : "create"}
        onClose={onClose}
        onSubmitCreate={onSubmitCreate}
        onSubmitUpdate={onSubmitUpdate}
        editingUser={editingUser}
        isSaving={isSaving}
      />
    </div>
  );
};

