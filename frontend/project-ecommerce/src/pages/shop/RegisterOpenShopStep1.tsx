import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  setStep,
  updateAccount,
  updateStore,
  setSuccessModalOpen,
  submitShopRegistration,
} from "../../redux/slices/shop/shopRegisterSlice";
import {
  OnboardingHeader,
  OnboardingSuccessModal,
  OnboardingFooter,
} from "../../components/shop/register";
import {
  Step1Stepper,
  Step1FooterBar,
} from "../../components/shop/register/step1";
import { shopRegisterApi, type BackendShop } from "../../api/shop/shopRegisterApi";

export const RegisterOpenShopStep1: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    formData,
    isSubmitting,
    isSavingDraft,
    lastSavedAt,
    isSuccessModalOpen,
    registrationResult,
  } = useAppSelector((state) => state.shopRegister);
  const { user } = useAppSelector((state) => state.auth);
  const [notice, setNotice] = useState<string | null>(null);
  const [existingShop, setExistingShop] = useState<BackendShop | null>(null);

  useEffect(() => {
    dispatch(setStep(1));
    if (user) {
      dispatch(updateAccount({
        fullName: user.full_name,
        phone: user.phone,
        email: user.email ?? "",
        password: "",
        confirmPassword: "",
      }));
    }
    let active = true;
    void shopRegisterApi.getMyShop().then((shop) => {
      if (!active || !shop) return;
      setExistingShop(shop);
      const address = (shop.warehouse_address || "").split(",").map((part) => part.trim());
      dispatch(updateStore({
        shopName: shop.name,
        bio: shop.description || "",
        logoUrl: shop.logo_url || "",
        bannerUrl: shop.banner_url || "",
        warehousePhone: shop.phone || "",
        addressDetail: address.length > 3 ? address.slice(0, -3).join(", ") : address[0] || "",
        ward: address.length > 3 ? address[address.length - 3] : "",
        district: address.length > 2 ? address[address.length - 2] : "",
        province: address.length > 1 ? address[address.length - 1] : "",
      }));
    }).catch((error: unknown) => {
      if (active) {
        setNotice(error instanceof Error ? error.message : "Không thể tải hồ sơ shop hiện tại.");
      }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      active = false;
    };
  }, [dispatch, user]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      dispatch(setStep(1));
    }
  };

  const handleNext = () => {
    // Navigate to Step 2 page
    dispatch(setStep(2));
    navigate("/register-open-shop/step2");
  };

  const handleSubmit = () => {
    dispatch(submitShopRegistration(formData));
  };

  const handleSaveDraft = () => {
    setNotice("Nhập tên shop và địa chỉ kho ở bước 2 để bắt đầu lưu bản nháp lên máy chủ.");
  };

  const handleCloseModal = () => {
    dispatch(setSuccessModalOpen(false));
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {existingShop && (
              <section className={`rounded-xl border p-5 ${existingShop.status === "ACTIVE" ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
                <h2 className="font-semibold text-on-surface">
                  {existingShop.status === "ACTIVE" ? "Shop đã được duyệt" :
                    existingShop.status === "PENDING" ? "Hồ sơ đang chờ xét duyệt" :
                      existingShop.status === "SUSPENDED" ? "Shop đang bị tạm ngưng" :
                        "Đã tìm thấy bản nháp hồ sơ shop"}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {existingShop.status === "ACTIVE"
                    ? "Quyền SELLER đã được cấp. Bạn vẫn có thể mua sắm bằng tài khoản này."
                    : existingShop.status === "PENDING"
                      ? "Không cần gửi lại. Bạn có thể tiếp tục mua sắm trong lúc hồ sơ được xét duyệt."
                      : existingShop.status === "SUSPENDED"
                        ? "Liên hệ bộ phận hỗ trợ để biết thêm thông tin. Quyền mua hàng vẫn được giữ nguyên."
                        : "Thông tin shop được tải từ máy chủ để bạn tiếp tục hoàn thiện."}
                </p>
                {existingShop.reject_reason && (
                  <p className="mt-2 text-sm text-red-800">Ghi chú xét duyệt: {existingShop.reject_reason}</p>
                )}
                {existingShop.status === "ACTIVE" && (
                  <button type="button" onClick={() => navigate("/shop/dashboard")} className="mt-3 rounded-lg bg-primary px-4 py-2 text-on-primary">
                    Vào Seller Center
                  </button>
                )}
              </section>
            )}

            {(!existingShop || ["DRAFT", "NEEDS_INFO", "REJECTED"].includes(existingShop.status)) && (
              <>
                {/* Context subheader & 4-step stepper */}
                <Step1Stepper onStepClick={handleStepClick} />

                {/* Form Content Wrapper with width matching Stepper */}
                <div className="w-full flex flex-col gap-space-lg mb-20">
              <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-10 transition-all">
                <div className="max-w-3xl space-y-4">
                  <p className="inline-flex rounded-full bg-primary-fixed px-3 py-1 text-label-sm font-semibold text-on-primary-fixed">
                    Một tài khoản cho cả mua sắm và bán hàng
                  </p>
                  <h2 className="text-2xl font-bold text-on-surface">Dùng tài khoản hiện tại để mở shop</h2>
                  <p className="text-on-surface-variant">
                    Bạn không cần tạo tài khoản hoặc mật khẩu người bán mới. Sau khi shop được duyệt,
                    tài khoản này sẽ được bổ sung quyền SELLER và vẫn giữ nguyên quyền mua hàng.
                  </p>
                  <dl className="grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2">
                    <div><dt className="text-sm text-on-surface-variant">Chủ tài khoản</dt><dd className="font-semibold">{user?.full_name}</dd></div>
                    <div><dt className="text-sm text-on-surface-variant">Email</dt><dd className="font-semibold">{user?.email || "Chưa có email"}</dd></div>
                    <div><dt className="text-sm text-on-surface-variant">Số điện thoại</dt><dd className="font-semibold">{user?.phone}</dd></div>
                    <div><dt className="text-sm text-on-surface-variant">Vai trò hiện tại</dt><dd className="font-semibold">{user?.roles?.join(", ") || user?.role}</dd></div>
                  </dl>
                </div>
              </div>
              {notice && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{notice}</p>}

              {/* Action Footer Bar */}
              <Step1FooterBar
                currentStep={1}
                onPrevStep={() => {}}
                onNextStep={handleNext}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isSubmitting={isSubmitting}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
              />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Post-submission Success Modal */}
      <OnboardingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        applicationId={registrationResult?.applicationId}
        shopName={registrationResult?.shopName || formData.store.shopName}
        ownerEmail={registrationResult?.ownerEmail || formData.account.email}
        message={registrationResult?.message}
      />

      {/* Bottom Global Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep1;
