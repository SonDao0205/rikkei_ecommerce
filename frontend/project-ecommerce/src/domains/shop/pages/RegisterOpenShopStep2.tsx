import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/state/store";
import {
  setStep,
  updateStore,
  resetStore,
  saveDraftShopRegistration,
} from "@/domains/shop/state/shopRegisterSlice";
import { shopRegisterApi } from "@/domains/shop/api/shopRegisterApi";
import { isValidVietnamesePhone } from "@/shared/utils/validation";
import {
  OnboardingHeader,
  OnboardingFooter,
  Step2IntroBanner,
  Step2Stepper,
  Step2StoreBranding,
  Step2WarehouseLogistics,
  Step2ReturnWarehouse,
  Step2FooterBar,
} from "@/domains/shop/components/register";

export const RegisterOpenShopStep2: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditingPendingShop = Boolean(
    (location.state as { editPendingShop?: boolean } | null)?.editPendingShop
  );
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const { formData, isSavingDraft, lastSavedAt } = useAppSelector(
    (state) => state.shopRegister
  );
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Ensure Redux step state is set to 2 when mounting this page
    dispatch(setStep(2));
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (isEditingPendingShop) {
      if (!formData.store.shopName) {
        void shopRegisterApi
          .getMyShop()
          .then((shop) => {
            if (!shop || shop.status !== "PENDING") {
              dispatch(resetStore());
              return;
            }
            const addressParts = (shop.warehouse_address || "")
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean);
            const addressDetail =
              addressParts.length > 3
                ? addressParts.slice(0, -3).join(", ")
                : addressParts[0] || "";
            const ward =
              addressParts.length > 3
                ? addressParts[addressParts.length - 3]
                : "";
            const district =
              addressParts.length > 2
                ? addressParts[addressParts.length - 2]
                : "";
            const province =
              addressParts.length > 1
                ? addressParts[addressParts.length - 1]
                : "";

            dispatch(
              updateStore({
                shopName: shop.name || "",
                bio: shop.description || "",
                logoUrl: shop.logo_url || "",
                bannerUrl: shop.banner_url || "",
                warehousePhone: shop.phone || "",
                addressDetail,
                ward: ward || "Phường Bến Nghé",
                district: district || "Quận 1",
                province: province || "TP. Hồ Chí Minh",
              })
            );
          })
          .catch(() => {
            // Non-blocking
          });
      }
    } else {
      // Normal flow: reset store inputs to empty when entering Step 2
      dispatch(resetStore());
    }
  }, [dispatch, isEditingPendingShop, formData.store.shopName]);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 1) {
      dispatch(setStep(1));
      navigate("/register-open-shop");
    }
  };

  const handleNextStep = async () => {
    const warehousePhone = formData.store.warehousePhone.trim();
    if (warehousePhone && !isValidVietnamesePhone(warehousePhone)) {
      setToastMessage("Số điện thoại kho không hợp lệ theo định dạng Việt Nam (VD: 0909 123 456).");
      return;
    }

    dispatch(setStep(3));
    try {
      await dispatch(saveDraftShopRegistration(formData)).unwrap();
    } catch {
      // Non-blocking draft save, proceed to Step 3
    }
    navigate("/register-open-shop/step3", {
      state: isEditingPendingShop ? { editPendingShop: true } : undefined,
    });
  };

  const handleSaveDraft = async () => {
    try {
      await dispatch(saveDraftShopRegistration(formData)).unwrap();
      setToastMessage("Bản nháp đã được lưu trên máy chủ.");
    } catch (error: unknown) {
      setToastMessage(error instanceof Error ? error.message : typeof error === "string" ? error : "Không thể lưu bản nháp.");
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Top Fixed Header */}
      <OnboardingHeader />

      {/* Main Content Canvas */}
      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1440px] mx-auto px-gutter py-space-md sm:py-space-lg flex flex-col gap-space-lg">
            {/* Top Navigation Context & Stepper Progress (4 steps) */}
            <Step2Stepper onStepClick={handleStepClick} />

            {/* Form Container with width matching Stepper */}
            <div className="w-full flex flex-col gap-space-lg mb-20">
              {/* Header Intro Banner within Card */}
              <Step2IntroBanner />

              {/* Khối 1: Nhận diện thương hiệu Gian hàng */}
              <Step2StoreBranding
                data={formData.store}
                onChange={(fields) => dispatch(updateStore(fields))}
              />

              {/* Khối 2: Thông tin Kho hàng & Vận hành lấy hàng */}
              <Step2WarehouseLogistics
                data={formData.store}
                onChange={(fields) => dispatch(updateStore(fields))}
              />

              {/* Khối 3: Cấu hình Kho hoàn / trả hàng */}
              <Step2ReturnWarehouse
                data={formData.store}
                onChange={(fields) => dispatch(updateStore(fields))}
              />

              {/* Action Footer Bar (In-flow card layout like Step 1) */}
              <Step2FooterBar
                onSaveDraft={handleSaveDraft}
                onNextStep={handleNextStep}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl transition-all">
          <span className="material-symbols-outlined text-[20px] text-primary-fixed">
            info
          </span>
          <span className="font-body-md text-body-md font-medium">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-inverse-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Global Bottom Footer */}
      <OnboardingFooter />
    </div>
  );
};

export default RegisterOpenShopStep2;
