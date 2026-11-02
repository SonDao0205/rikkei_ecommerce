export interface SellerAccountData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export type ShopAccountData = SellerAccountData;

export interface ShopStoreData {
  logoUrl: string;
  shopName: string;
  category: string;
  bio: string;
  customStoreUrl?: string;
  warehouseContact: string;
  warehousePhone: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  pickupNote?: string;
  sameReturnAddress: boolean;
  bannerUrl?: string;
  bannerName?: string;
  slug?: string;
  description?: string;
  pickupAddress?: {
    addressLine?: string;
    ward?: string;
    district?: string;
    province?: string;
    contactName?: string;
    contactPhone?: string;
  };
  returnSameAsPickup?: boolean;
}

export interface ShopKycData {
  idNumber: string;
  issueDate: string;
  issuePlace: string;
  frontCardUrl: string;
  frontCardName: string;
  frontCardSize: string;
  backCardUrl: string;
  backCardName: string;
  backCardSize: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankBranch: string;
  taxCode?: string;
  settlementCycle?: string;
}

export interface ShopAgreementData {
  agreeServicePolicy: boolean;
  agreeAuthenticCommitment: boolean;
  agreeEkycConsent: boolean;
}

export interface ShopRegistrationFormData {
  account: SellerAccountData;
  store: ShopStoreData;
  kyc: ShopKycData;
  agreements: ShopAgreementData;
}

export interface ShopRegistrationResponse {
  applicationId: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  shopName: string;
  ownerEmail: string;
  submittedAt: string;
  estimatedReviewTime: string;
  message: string;
}

export interface ShopRegisterState {
  currentStep: number;
  formData: ShopRegistrationFormData;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  lastSavedAt: string | null;
  registrationResult: ShopRegistrationResponse | null;
  isSuccessModalOpen: boolean;
  error: string | null;
}
