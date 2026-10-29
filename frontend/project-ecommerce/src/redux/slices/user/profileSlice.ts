import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { profileApi } from "../../../api/user/profileApi";
import type {
  UserProfileDetails,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "../../../types/ecommerce";

interface ProfileState {
  profile: UserProfileDetails | null;
  loading: boolean;
  saving: boolean;
  passwordLoading: boolean;
  error: string | null;
  successMessage: string | null;
  passwordSuccessMessage: string | null;
  passwordError: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  saving: false,
  passwordLoading: false,
  error: null,
  successMessage: null,
  passwordSuccessMessage: null,
  passwordError: null,
};

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.getProfile();
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to fetch profile"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (payload: UpdateProfilePayload, { rejectWithValue }) => {
    try {
      return await profileApi.updateProfile(payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "profile/changeUserPassword",
  async (payload: ChangePasswordPayload, { rejectWithValue }) => {
    try {
      return await profileApi.changePassword(payload);
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to change password"
      );
    }
  }
);

export const removeUserAvatar = createAsyncThunk(
  "profile/removeUserAvatar",
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi.removeAvatar();
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to remove avatar"
      );
    }
  }
);

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileStatus: (state) => {
      state.error = null;
      state.successMessage = null;
      state.passwordError = null;
      state.passwordSuccessMessage = null;
    },
    setLocalAvatarPreview: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.avatar_url = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
        state.successMessage = "Cập nhật hồ sơ thành công!";
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })

      // Change Password
      .addCase(changeUserPassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordSuccessMessage = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.passwordSuccessMessage =
          "Đổi mật khẩu thành công, bạn có thể đăng nhập lại bằng mật khẩu mới";
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload as string;
      })

      // Remove Avatar
      .addCase(removeUserAvatar.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.successMessage = "Đã xóa ảnh đại diện.";
      });
  },
});

export const { clearProfileStatus, setLocalAvatarPreview } =
  profileSlice.actions;

export default profileSlice.reducer;
