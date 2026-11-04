/**
 * Address Book Interfaces matching scriptDb.sql addresses table & Go backend address domain
 */
export type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

export interface Address {
  id: number;
  user_id?: number;
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street_detail: string;
  is_default: boolean;
  address_type?: AddressType;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressPayload {
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street_detail: string;
  is_default?: boolean | number;
  address_type?: AddressType;
}

export interface UpdateAddressPayload extends CreateAddressPayload {
  id: number;
}
