import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ShopRegisterState,
  SellerAccountData,
  ShopStoreData,
  ShopKycData,
  ShopAgreementData,
  ShopRegistrationFormData,
  ShopRegistrationResponse,
} from "../../../types";
import { shopRegisterApi, initialShopRegistrationData } from "../../../api/shop/shopRegisterApi";

const initialState: ShopRegisterState = {
  currentStep: 1,
  formData: initialShopRegistrationData,
  isSubmitting: false,
  isSavingDraft: false,
  lastSavedAt: "15:20",
  registrationResult: null,
  isSuccessModalOpen: false,
  error: null,
};

export const submitShopRegistration = createAsyncThunk<
  ShopRegistrationResponse,
  ShopRegistrationFormData,
  { rejectValue: string }
>("shopRegister/submitRegistration", async (formData, { rejectWithValue }) => {
  try {
    const res = await shopRegisterApi.submitRegistration(formData);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đăng ký mở shop thất bại";
    return rejectWithValue(message);
  }
});

export const saveDraftShopRegistration = createAsyncThunk<
  { savedAt: string },
  Partial<ShopRegistrationFormData>,
  { rejectValue: string }
>("shopRegister/saveDraft", async (draftData, { rejectWithValue }) => {
  try {
    const res = await shopRegisterApi.saveDraft(draftData);
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lưu bản nháp thất bại";
    return rejectWithValue(message);
  }
});

export const shopRegisterSlice = createSlice({
  name: "shopRegister",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      const step = Math.max(1, Math.min(4, action.payload));
      state.currentStep = step;
    },
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    updateAccount: (state, action: PayloadAction<Partial<SellerAccountData>>) => {
      state.formData.account = {
        ...state.formData.account,
        ...action.payload,
      };
    },
    updateStore: (state, action: PayloadAction<Partial<ShopStoreData>>) => {
      state.formData.store = {
        ...state.formData.store,
        ...action.payload,
      };
    },
    updateKyc: (state, action: PayloadAction<Partial<ShopKycData>>) => {
      state.formData.kyc = {
        ...state.formData.kyc,
        ...action.payload,
      };
    },
    updateAgreements: (state, action: PayloadAction<Partial<ShopAgreementData>>) => {
      state.formData.agreements = {
        ...state.formData.agreements,
        ...action.payload,
      };
    },
    setSuccessModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSuccessModalOpen = action.payload;
    },
    resetForm: (state) => {
      state.formData = initialShopRegistrationData;
      state.currentStep = 1;
      state.registrationResult = null;
      state.isSuccessModalOpen = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // submit
    builder.addCase(submitShopRegistration.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
    });
    builder.addCase(submitShopRegistration.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.registrationResult = action.payload;
      state.isSuccessModalOpen = true;
    });
    builder.addCase(submitShopRegistration.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload ?? "Gửi hồ sơ thất bại";
    });

    // save draft
    builder.addCase(saveDraftShopRegistration.pending, (state) => {
      state.isSavingDraft = true;
    });
    builder.addCase(saveDraftShopRegistration.fulfilled, (state, action) => {
      state.isSavingDraft = false;
      state.lastSavedAt = action.payload.savedAt;
    });
    builder.addCase(saveDraftShopRegistration.rejected, (state) => {
      state.isSavingDraft = false;
    });
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  updateAccount,
  updateStore,
  updateKyc,
  updateAgreements,
  setSuccessModalOpen,
  resetForm,
} = shopRegisterSlice.actions;

export default shopRegisterSlice.reducer;
