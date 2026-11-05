import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { refreshAccessToken, registerUser } from "../../redux/slices/auth/authSlice";
import {
  setStep,
  updateAccount,
  updateStore,
  setSuccessModalOpen,
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
  const { user, loading: registering, error: registrationError, isInitialized } = useAppSelector((state) => state.auth);
  const [notice, setNotice] = useState<string | null>(null);
  const [existingShop, setExistingShop] = useState<BackendShop | null>(null);
  const [shopLoading, setShopLoading] = useState(Boolean(user && isInitialized));
  const [shopLoadError, setShopLoadError] = useState<string | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const applyShopToForm = useCallback((shop: BackendShop | null) => {
    setExistingShop(shop);
    if (!shop) return;
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
  }, [dispatch]);

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
    if (!isInitialized) return;
    if (!user) {
      void Promise.resolve().then(() => {
        setExistingShop(null);
        setShopLoading(false);
        setShopLoadError(null);
      });
      return;
    }
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setShopLoading(true);
      setShopLoadError(null);
    });
    void shopRegisterApi.getMyShop().then((shop) => {
      if (!active) return;
      applyShopToForm(shop);
    }).catch((error: unknown) => {
      if (active) {
        setShopLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ shop hiện tại.");
      }
    }).finally(() => { if (active) setShopLoading(false); });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return () => {
      active = false;
    };
  }, [applyShopToForm, dispatch, user, isInitialized]);

  const handleStepClick = (step: number) => {
    if (step === 1) {
      dispatch(setStep(1));
    }
  };

  const handleNext = async () => {
    if (!user) {
      const { fullName, email, phone, password, confirmPassword } = formData.account;
      if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
        setNotice("Vui lòng điền đầy đủ họ tên, email, số điện thoại và mật khẩu để tạo tài khoản.");
        return;
      }
      if (password !== confirmPassword) {
        setNotice("Mật khẩu xác nhận chưa khớp.");
        return;
      }
      const result = await dispatch(registerUser({
        fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, role: "client",
      }));
      if (!registerUser.fulfilled.match(result)) {
        setNotice(typeof result.payload === "string" ? result.payload : "Không thể tạo tài khoản. Vui lòng kiểm tra thông tin và thử lại.");
        return;
      }
      dispatch(updateAccount({ password: "", confirmPassword: "", agreeTerms: true }));
    }
    // Navigate to Step 2 page
    dispatch(setStep(2));
    navigate("/register-open-shop/step2");
  };

  const handleSubmit = () => { void handleNext(); };

  const handleSaveDraft = () => {
    setNotice(user
      ? "Nhập tên shop và địa chỉ kho ở bước 2 để bắt đầu lưu bản nháp lên máy chủ."
      : "Tạo tài khoản miễn phí trước, sau đó bạn có thể lưu hồ sơ nháp và tiếp tục hoàn thiện sau.");
  };

  const handleCloseModal = () => {
    dispatch(setSuccessModalOpen(false));
    navigate("/register-open-shop");
  };

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    try {
      await dispatch(refreshAccessToken()).unwrap();
      const latestShop = await shopRegisterApi.getMyShop();
      applyShopToForm(latestShop);
      setNotice("Đã cập nhật trạng thái hồ sơ và quyền tài khoản.");
    } catch {
      setNotice("Không thể cập nhật trạng thái lúc này. Vui lòng thử lại sau.");
    } finally {
      setRefreshingStatus(false);
    }
  };

  const reloadShop = async () => {
    setShopLoading(true);
    setShopLoadError(null);
    try {
      applyShopToForm(await shopRegisterApi.getMyShop());
    } catch (error: unknown) {
      setShopLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ shop hiện tại.");
    } finally {
      setShopLoading(false);
    }
  };

  if (!isInitialized) {
    return <div className="min-h-screen grid place-items-center text-on-surface-variant">Đang khôi phục phiên đăng nhập...</div>;
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Area */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {shopLoading && user && <p role="status" className="rounded-xl bg-surface-container-low p-4">Đang tải trạng thái gian hàng...</p>}
            {shopLoadError && <div role="alert" className="rounded-xl border border-error/30 bg-error-container/30 p-4 text-sm"><p>Không thể tải hồ sơ shop. Để tránh tạo trùng shop, vui lòng tải lại trước khi tiếp tục.</p><button type="button" onClick={reloadShop} className="mt-2 rounded-lg border px-3 py-2 font-semibold">Thử tải lại</button></div>}
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
                {existingShop.status !== "ACTIVE" && (
                  <button type="button" disabled={refreshingStatus} onClick={handleRefreshStatus} className="mt-3 rounded-lg border border-amber-700 px-4 py-2 text-amber-950 disabled:opacity-60">
                    {refreshingStatus ? "Đang cập nhật..." : "Cập nhật trạng thái hồ sơ"}
                  </button>
                )}
              </section>
            )}

            {!shopLoading && !shopLoadError && (!existingShop || ["DRAFT", "NEEDS_INFO", "REJECTED"].includes(existingShop.status)) && (
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
                  <h2 className="text-2xl font-bold text-on-surface">{user ? "Dùng tài khoản hiện tại để mở shop" : "Tạo tài khoản để bắt đầu bán hàng"}</h2>
                  <p className="text-on-surface-variant">
                    {user ? "Bạn không cần tạo tài khoản người bán riêng. Sau khi shop được duyệt, tài khoản này được bổ sung quyền SELLER và vẫn giữ quyền mua hàng." : "Tạo một tài khoản duy nhất để mua sắm và đăng ký bán hàng. Quyền SELLER chỉ được cấp sau khi admin duyệt hồ sơ."}
                  </p>
                  <dl className="grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-2">
                    {user ? <>
                      <div><dt className="text-sm text-on-surface-variant">Chủ tài khoản</dt><dd className="font-semibold">{user.full_name}</dd></div>
                      <div><dt className="text-sm text-on-surface-variant">Email</dt><dd className="font-semibold">{user.email || "Chưa có email"}</dd></div>
                      <div><dt className="text-sm text-on-surface-variant">Số điện thoại</dt><dd className="font-semibold">{user.phone}</dd></div>
                      <div><dt className="text-sm text-on-surface-variant">Vai trò hiện tại</dt><dd className="font-semibold">{user.roles?.join(", ") || user.role}</dd></div>
                    </> : <div className="grid gap-4 sm:grid-cols-2">
                      <label className="text-sm font-medium">Họ và tên<input required autoComplete="name" value={formData.account.fullName} onChange={(e) => dispatch(updateAccount({ fullName: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /></label>
                      <label className="text-sm font-medium">Email<input required type="email" autoComplete="email" value={formData.account.email} onChange={(e) => dispatch(updateAccount({ email: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /></label>
                      <label className="text-sm font-medium">Số điện thoại<input required type="tel" autoComplete="tel" value={formData.account.phone} onChange={(e) => dispatch(updateAccount({ phone: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /></label>
                      <label className="text-sm font-medium">Mật khẩu<input required type="password" autoComplete="new-password" minLength={10} value={formData.account.password} onChange={(e) => dispatch(updateAccount({ password: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /><span className="text-xs text-slate-500">Ít nhất 10 ký tự, gồm chữ cái và chữ số.</span></label>
                      <label className="text-sm font-medium sm:col-span-2">Xác nhận mật khẩu<input required type="password" autoComplete="new-password" value={formData.account.confirmPassword} onChange={(e) => dispatch(updateAccount({ confirmPassword: e.target.value }))} className="mt-1 w-full rounded-lg border p-3" /></label>
                      <p className="text-sm text-slate-600 sm:col-span-2">Tài khoản mới được tạo với quyền người mua. Quyền người bán chỉ được cấp khi shop được admin duyệt.</p>
                      <p className="text-sm sm:col-span-2">Đã có tài khoản? <Link className="font-semibold text-indigo-700 underline" to="/login" state={{ from: { pathname: "/register-open-shop" } }}>Đăng nhập để tiếp tục</Link></p>
                    </div>}
                  </dl>
                </div>
              </div>
              {(notice || registrationError) && <p role="alert" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{notice || registrationError}</p>}

              {/* Action Footer Bar */}
              <Step1FooterBar
                currentStep={1}
                onPrevStep={() => {}}
                onNextStep={handleNext}
                onSubmit={handleSubmit}
                onSaveDraft={handleSaveDraft}
                isSavingDraft={isSavingDraft}
                isSubmitting={registering || isSubmitting}
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
