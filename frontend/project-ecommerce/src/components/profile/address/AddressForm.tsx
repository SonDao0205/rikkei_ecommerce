import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  createAddressThunk,
  updateAddressThunk,
  closeForm,
} from "../../../redux/slices/user/addressSlice";
import type { AddressType } from "../../../types/ecommerce";

// Cascading Vietnam administrative location data
const VIETNAM_LOCATIONS: Record<
  string,
  Record<string, string[]>
> = {
  "TP. Hồ Chí Minh": {
    "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Đa Kao", "Phường Tân Định", "Phường Phạm Ngũ Lão"],
    "Quận 3": ["Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4"],
    "Quận 7": ["Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy", "Phường Phú Mỹ"],
    "TP. Thủ Đức": ["Phường Thảo Điền", "Phường An Phú", "Phường Hiệp Phú", "Phường Linh Trung"],
    "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 12", "Phường 25"],
  },
  "Hà Nội": {
    "Quận Hoàn Kiếm": ["Phường Tràng Tiền", "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Cửa Đông"],
    "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Nghĩa Tân", "Phường Yên Hòa"],
    "Quận Ba Đình": ["Phường Điện Biên", "Phường Đội Cấn", "Phường Kim Mã", "Phường Liễu Giai"],
    "Quận Đống Đa": ["Phường Láng Hạ", "Phường Ô Chợ Dừa", "Phường Nam Đồng", "Phường Khâm Thiên"],
    "Quận Nam Từ Liêm": ["Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Mễ Trì"],
  },
  "Đà Nẵng": {
    "Quận Hải Châu": ["Phường Hải Châu 1", "Phường Hải Châu 2", "Phường Thạch Thang", "Phường Hòa Cường Bắc"],
    "Quận Thanh Khê": ["Phường Vĩnh Trung", "Phường Tân Chính", "Phường Tam Thuận"],
    "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Đông", "Phường Phước Mỹ"],
  },
  "Cần Thơ": {
    "Quận Ninh Kiều": ["Phường An Cư", "Phường An Khánh", "Phường Tân An", "Phường Xuân Khánh"],
    "Quận Cái Răng": ["Phường Lê Bình", "Phường Hưng Phú", "Phường Hưng Thạnh"],
  },
  "Hải Phòng": {
    "Quận Hồng Bàng": ["Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Phan Bội Châu"],
    "Quận Ngô Quyền": ["Phường Cầu Đất", "Phường Lạc Viên", "Phường Máy Tơ"],
  },
};

export const AddressForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { editingAddress, saving, error } = useAppSelector((state) => state.address);
  const isEditMode = Boolean(editingAddress);

  // Form states
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("TP. Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState("Phường Bến Nghé");
  const [streetDetail, setStreetDetail] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when editingAddress changes
  useEffect(() => {
    if (editingAddress) {
      setRecipientName(editingAddress.recipient_name || "");
      // Normalize phone for +84 input
      const cleanPhone = (editingAddress.phone || "").replace(/^\+84\s?/, "").replace(/^0/, "");
      setPhone(cleanPhone);

      const targetProvince = VIETNAM_LOCATIONS[editingAddress.province]
        ? editingAddress.province
        : "TP. Hồ Chí Minh";
      setProvince(targetProvince);

      const availableDistricts = Object.keys(VIETNAM_LOCATIONS[targetProvince] || {});
      const targetDistrict = availableDistricts.includes(editingAddress.district)
        ? editingAddress.district
        : availableDistricts[0] || "";
      setDistrict(targetDistrict);

      const availableWards = VIETNAM_LOCATIONS[targetProvince]?.[targetDistrict] || [];
      const targetWard = availableWards.includes(editingAddress.ward)
        ? editingAddress.ward
        : availableWards[0] || "";
      setWard(targetWard);

      setStreetDetail(editingAddress.street_detail || "");
      setAddressType(editingAddress.address_type || "HOME");
      setIsDefault(Boolean(editingAddress.is_default));
    } else {
      setRecipientName("");
      setPhone("");
      setProvince("TP. Hồ Chí Minh");
      setDistrict("Quận 1");
      setWard("Phường Bến Nghé");
      setStreetDetail("");
      setAddressType("HOME");
      setIsDefault(false);
    }
    setValidationError(null);
  }, [editingAddress]);

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    setProvince(newProv);
    const districts = Object.keys(VIETNAM_LOCATIONS[newProv] || {});
    const firstDist = districts[0] || "";
    setDistrict(firstDist);
    const wards = VIETNAM_LOCATIONS[newProv]?.[firstDist] || [];
    setWard(wards[0] || "");
  };

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    const wards = VIETNAM_LOCATIONS[province]?.[newDist] || [];
    setWard(wards[0] || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!recipientName.trim()) {
      setValidationError("Vui lòng nhập họ và tên người nhận");
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setValidationError("Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số)");
      return;
    }
    if (!streetDetail.trim()) {
      setValidationError("Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường, toà nhà)");
      return;
    }

    const formattedPhone = cleanPhone.startsWith("0")
      ? cleanPhone
      : `0${cleanPhone}`;

    if (isEditMode && editingAddress) {
      dispatch(
        updateAddressThunk({
          id: editingAddress.id,
          recipient_name: recipientName.trim(),
          phone: formattedPhone,
          province,
          district,
          ward,
          street_detail: streetDetail.trim(),
          address_type: addressType,
          is_default: isDefault ? 1 : 0,
        })
      );
    } else {
      dispatch(
        createAddressThunk({
          recipient_name: recipientName.trim(),
          phone: formattedPhone,
          province,
          district,
          ward,
          street_detail: streetDetail.trim(),
          address_type: addressType,
          is_default: isDefault ? 1 : 0,
        })
      );
    }
  };

  const districtOptions = Object.keys(VIETNAM_LOCATIONS[province] || {});
  const wardOptions = VIETNAM_LOCATIONS[province]?.[district] || [];

  return (
    <section className="scroll-mt-32" id="add-address-modal-container">
      {/* Component Title / Context Badge */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">
            {isEditMode ? "edit_location_alt" : "add_location_alt"}
          </span>
          <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">
            {isEditMode ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}
          </span>
        </div>
        <span className="text-body-sm font-body-sm text-outline">
          Production-ready reactive form view
        </span>
      </div>

      {/* Styled Form Container */}
      <div className="w-full rounded-3xl bg-surface-container-lowest shadow-xl border-2 border-primary-fixed overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-surface-container-low to-surface-container-lowest border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                {isEditMode ? "edit_location" : "add_location"}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
                {isEditMode ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {isEditMode
                  ? "Cập nhật địa chỉ nhận hàng của bạn"
                  : "Thêm địa chỉ giao hàng nhận bưu kiện mới"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(closeForm())}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title="Đóng form"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Validation / API Error Banner */}
        {(validationError || error) && (
          <div className="mx-6 mt-5 p-3.5 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form Body */}
        <form className="p-6 sm:p-7 space-y-5" onSubmit={handleSubmit}>
          {/* Recipient & Phone 2-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recipient Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface font-bold">
                Full Name (Họ và tên người nhận) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Nguyễn Văn A"
                className="h-11 px-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                required
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface font-bold">
                Phone Number (Số điện thoại) <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  +84
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full h-11 pl-12 pr-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3-Level Administrative Cascading Selects */}
          <div className="space-y-1.5">
            <label className="font-label-sm text-label-sm text-on-surface font-bold">
              Administrative Area (Tỉnh / Thành phố, Quận / Huyện, Phường / Xã){" "}
              <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Province/City */}
              <div className="relative">
                <select
                  value={province}
                  onChange={handleProvinceChange}
                  className="w-full h-11 px-3 pr-8 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-xs cursor-pointer"
                >
                  {Object.keys(VIETNAM_LOCATIONS).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* District */}
              <div className="relative">
                <select
                  value={district}
                  onChange={handleDistrictChange}
                  className="w-full h-11 px-3 pr-8 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-xs cursor-pointer"
                >
                  {districtOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Ward */}
              <div className="relative">
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full h-11 px-3 pr-8 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 appearance-none shadow-xs cursor-pointer"
                >
                  {wardOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3 text-outline text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Street Address & Building */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm text-on-surface font-bold">
              Street Address &amp; House Number (Số nhà, tên đường, toà nhà){" "}
              <span className="text-error">*</span>
            </label>
            <textarea
              rows={2}
              value={streetDetail}
              onChange={(e) => setStreetDetail(e.target.value)}
              placeholder="Ví dụ: Tầng 4, Tòa nhà Bitexco Financial Tower, số 2 Hải Triều..."
              className="w-full p-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 resize-none transition-all shadow-xs"
              required
            />
          </div>

          {/* Address Category Tags Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-on-surface font-bold">
              Loại địa chỉ
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { type: "HOME" as AddressType, label: "Nhà riêng", icon: "home" },
                { type: "OFFICE" as AddressType, label: "Văn phòng / Công ty", icon: "business" },
                { type: "OTHER" as AddressType, label: "Khác", icon: "pin_drop" },
              ].map((cat) => {
                const isSelected = addressType === cat.type;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setAddressType(cat.type)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-fixed text-primary border-primary font-bold shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary-container border-outline-variant accent-primary cursor-pointer"
              />
              <span className="font-body-md text-body-md text-on-surface">
                Đặt làm địa chỉ giao hàng mặc định
              </span>
            </label>
          </div>

          {/* Action buttons footer */}
          <div className="pt-4 border-t border-surface-container flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => dispatch(closeForm())}
              className="h-11 px-5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{isEditMode ? "Save Changes (Lưu thay đổi)" : "Save Address (Lưu địa chỉ)"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddressForm;
