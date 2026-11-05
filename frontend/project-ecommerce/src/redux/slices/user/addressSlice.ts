import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { addressApi } from "../../../api/user/addressApi";
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../../../types/user";

interface AddressState {
  addresses: Address[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  isFormOpen: boolean;
  editingAddress: Address | null;
}

const initialState: AddressState = {
  addresses: [],
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  isFormOpen: false,
  editingAddress: null,
};

export const fetchAddresses = createAsyncThunk<Address[], void, { rejectValue: string }>(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      return await addressApi.fetchAddresses();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Không thể tải danh sách địa chỉ");
    }
  }
);

export const createAddressThunk = createAsyncThunk<Address, CreateAddressPayload, { rejectValue: string }>(
  "address/createAddress",
  async (payload, { rejectWithValue }) => {
    try {
      return await addressApi.createAddress(payload);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Thêm địa chỉ thất bại");
    }
  }
);

export const updateAddressThunk = createAsyncThunk<Address, UpdateAddressPayload, { rejectValue: string }>(
  "address/updateAddress",
  async (payload, { rejectWithValue }) => {
    try {
      return await addressApi.updateAddress(payload);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Cập nhật địa chỉ thất bại");
    }
  }
);

export const deleteAddressThunk = createAsyncThunk<number, number, { rejectValue: string }>(
  "address/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      return await addressApi.deleteAddress(id);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Xóa địa chỉ thất bại");
    }
  }
);

export const setDefaultAddressThunk = createAsyncThunk<Address, number, { rejectValue: string }>(
  "address/setDefaultAddress",
  async (id, { rejectWithValue }) => {
    try {
      return await addressApi.setDefaultAddress(id);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Thiết lập địa chỉ mặc định thất bại");
    }
  }
);

export const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    openCreateForm: (state) => {
      state.isFormOpen = true;
      state.editingAddress = null;
      state.error = null;
      state.successMessage = null;
    },
    openEditForm: (state, action: PayloadAction<Address>) => {
      state.isFormOpen = true;
      state.editingAddress = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    closeForm: (state) => {
      state.isFormOpen = false;
      state.editingAddress = null;
      state.error = null;
    },
    clearAddressMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể tải danh sách địa chỉ";
      })
      // Create
      .addCase(createAddressThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.saving = false;
        const newAddr = action.payload;
        if (newAddr.is_default) {
          state.addresses = state.addresses.map((a) => ({ ...a, is_default: false }));
        }
        state.addresses.unshift(newAddr);
        state.isFormOpen = false;
        state.editingAddress = null;
        state.successMessage = "Thêm địa chỉ mới thành công!";
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Thêm địa chỉ thất bại";
      })
      // Update
      .addCase(updateAddressThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated.is_default) {
          state.addresses = state.addresses.map((a) => ({
            ...a,
            is_default: a.id === updated.id,
          }));
        }
        const idx = state.addresses.findIndex((a) => a.id === updated.id);
        if (idx !== -1) {
          state.addresses[idx] = updated;
        }
        state.isFormOpen = false;
        state.editingAddress = null;
        state.successMessage = "Cập nhật địa chỉ thành công!";
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Cập nhật địa chỉ thất bại";
      })
      // Delete
      .addCase(deleteAddressThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.saving = false;
        const deletedId = action.payload;
        state.addresses = state.addresses.filter((a) => a.id !== deletedId);
        if (state.addresses.length > 0 && !state.addresses.some((a) => a.is_default)) {
          state.addresses[0].is_default = true;
        }
        state.successMessage = "Đã xóa địa chỉ thành công!";
      })
      .addCase(deleteAddressThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Xóa địa chỉ thất bại";
      })
      // Set Default
      .addCase(setDefaultAddressThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.saving = false;
        const defaultAddr = action.payload;
        state.addresses = state.addresses.map((a) => ({
          ...a,
          is_default: a.id === defaultAddr.id,
        }));
        state.successMessage = "Đã đặt làm địa chỉ mặc định!";
      })
      .addCase(setDefaultAddressThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Thiết lập mặc định thất bại";
      });
  },
});

export const {
  openCreateForm,
  openEditForm,
  closeForm,
  clearAddressMessages,
} = addressSlice.actions;

export default addressSlice.reducer;
