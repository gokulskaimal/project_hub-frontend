/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { api, API_ROUTES } from "../../utils/api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  orgId?: string;
  status?: string;
  lastLoginAt?: string | Date;
}

interface AuthState {
  email: string;
  password: string;
  isLoggedIn: boolean;
  error: string | null;
  loading: boolean;

  signupStep: number;
  otp: string;
  name: string;
  firstName: string;
  lastName: string;
  otpResendAvailableAt: number | null;
  accessToken: string | null;
  role: string | null;
  user: UserProfile | null;
}

const baseInitialState: AuthState = {
  email: "",
  password: "",
  isLoggedIn: false,
  error: null,
  loading: false,
  signupStep: 1,
  otp: "",
  name: "",
  firstName: "",
  lastName: "",
  otpResendAvailableAt: null,
  accessToken: null,
  role: null,
  user: null,
};

const loadPersistedAuth = (): Partial<AuthState> => {
  try {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    if (token && role) {
      return {
        isLoggedIn: true,
        accessToken: token,
        role: normalizeRole(role),
      };
    }
    return {};
  } catch {
    return {};
  }
};

const initialState: AuthState = { ...baseInitialState, ...loadPersistedAuth() };

const normalizeRole = (role: string | null): string | null => {
  if (!role) return null;
  // Normalize by lowercasing and converting spaces/underscores to hyphens
  return role.toLowerCase().replace(/[\s_]+/g, "-");
};

export const fetchProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("auth/fetchProfile", async (_, thunkAPI) => {
  try {
    const res = await api.get(API_ROUTES.USER.PROFILE);
    const data = res.data?.data;
    if (data) {
      return data as UserProfile;
    }
    return thunkAPI.rejectWithValue("Failed to load profile");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const d = err.response?.data as
        | { message?: string; error?: string }
        | string
        | undefined;
      const message =
        typeof d === "string" ? d : d?.message || d?.error || "Network error";
      return thunkAPI.rejectWithValue(message);
    }
    return thunkAPI.rejectWithValue("Network error");
  }
});

export const googleSignIn = createAsyncThunk<
  { accessToken: string; role: string; user: UserProfile },
  { idToken: string; inviteToken?: string; orgName?: string },
  { rejectValue: string }
>("auth/googleSignIn", async ({ idToken, inviteToken, orgName }, thunkAPI) => {
  try {
    const response = await api.post(API_ROUTES.AUTH.GOOGLE_SIGNIN, {
      idToken,
      inviteToken,
      orgName,
    });
    const { accessToken, user } = response.data;
    if (accessToken && user?.role) {
      return { accessToken, role: user.role, user };
    }
    return thunkAPI.rejectWithValue("Invalid Google sign-in response");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const d = err.response?.data as
        | {
            message?: string;
            error?: string;
            errors?: Array<{ message?: string }>;
            detail?: string;
          }
        | string
        | undefined;
      if (typeof d === "string" && d.trim().length) {
        return thunkAPI.rejectWithValue(d);
      }
      if (d && typeof d === "object") {
        const obj = d as {
          message?: string;
          error?: string;
          errors?: Array<{ message?: string }>;
          detail?: string;
        };
        const firstValidation = Array.isArray(obj.errors)
          ? obj.errors[0]?.message || null
          : null;
        const message =
          obj.message || obj.error || obj.detail || firstValidation;
        if (message && typeof message === "string") {
          return thunkAPI.rejectWithValue(message);
        }
      }
    }
    return thunkAPI.rejectWithValue("Network error");
  }
});

export const acceptInvite = createAsyncThunk<
  void,
  { token: string; password: string; firstName: string; lastName: string },
  { rejectValue: string }
>(
  API_ROUTES.AUTH.ACCEPT_INVITE,
  async ({ token, password, firstName, lastName }, thunkAPI) => {
    try {
      await api.post(API_ROUTES.AUTH.ACCEPT_INVITE, {
        token,
        password,
        firstName,
        lastName,
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as
          | {
              message?: string;
              error?: string;
              errors?: Array<{ message?: string }>;
              detail?: string;
            }
          | string
          | undefined;
        if (typeof d === "string" && d.trim().length) {
          return thunkAPI.rejectWithValue(d);
        }
        if (d && typeof d === "object") {
          const obj = d as {
            message?: string;
            error?: string;
            errors?: Array<{ message?: string }>;
            detail?: string;
          };
          const firstValidation = Array.isArray(obj.errors)
            ? obj.errors[0]?.message || null
            : null;
          const message =
            obj.message || obj.error || obj.detail || firstValidation;
          if (message && typeof message === "string") {
            return thunkAPI.rejectWithValue(message);
          }
        }
      }
      return thunkAPI.rejectWithValue("Network error");
    }
  },
);

export const registerManager = createAsyncThunk<
  { organizationId: string; invitationToken: string; otpExpiresAt: string },
  { email: string; organizationName: string },
  { rejectValue: string }
>(API_ROUTES.AUTH.REGISTER_MANAGER, async (payload, thunkAPI) => {
  try {
    const res = await api.post(API_ROUTES.AUTH.REGISTER_MANAGER, payload);
    // API returns { message, organizationId, invitationToken, otpExpiresAt }
    const data = res.data;
    if (data?.organizationId && data?.otpExpiresAt) {
      return {
        organizationId: data.organizationId,
        invitationToken: data.invitationToken,
        otpExpiresAt: data.otpExpiresAt,
      };
    }
    return thunkAPI.rejectWithValue("Invalid register response");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const d = err.response?.data as
        | {
            message?: string;
            error?: string;
            errors?: Array<{ message?: string }>;
            detail?: string;
          }
        | string
        | undefined;
      if (typeof d === "string" && d.trim().length) {
        return thunkAPI.rejectWithValue(d);
      }
      if (d && typeof d === "object") {
        const obj = d as {
          message?: string;
          error?: string;
          errors?: Array<{ message?: string }>;
          detail?: string;
        };
        const firstValidation = Array.isArray(obj.errors)
          ? obj.errors[0]?.message || null
          : null;
        const message =
          obj.message || obj.error || obj.detail || firstValidation;
        if (message && typeof message === "string") {
          return thunkAPI.rejectWithValue(message);
        }
      }
    }
    return thunkAPI.rejectWithValue("Network error");
  }
});

export const loginUser = createAsyncThunk<
  { accessToken: string; role: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, thunkAPI) => {
  try {
    // Normal API login - server handles super admin credential check
    const response = await api.post(API_ROUTES.AUTH.LOGIN, credentials);
    // API returns { accessToken, user: { role, ... } }
    const { accessToken, user } = response.data;
    if (accessToken && user?.role) {
      return { accessToken, role: user.role };
    }
    return thunkAPI.rejectWithValue("Invalid login response");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const d = err.response?.data as
        | {
            message?: string;
            error?: string;
            errors?: Array<{ message?: string }>;
            detail?: string;
          }
        | string
        | undefined;
      if (typeof d === "string" && d.trim().length) {
        return thunkAPI.rejectWithValue(d);
      }
      if (d && typeof d === "object") {
        const obj = d as {
          message?: string;
          error?: string;
          errors?: Array<{ message?: string }>;
          detail?: string;
        };
        const firstValidation = Array.isArray(obj.errors)
          ? obj.errors[0]?.message || null
          : null;
        const message =
          obj.message || obj.error || obj.detail || firstValidation;
        if (message && typeof message === "string") {
          return thunkAPI.rejectWithValue(message);
        }
      }
    }
    return thunkAPI.rejectWithValue("Network error");
  }
});

export const sendOtp = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/sendOtp", async ({ email }, thunkAPI) => {
  try {
    await api.post(API_ROUTES.AUTH.SEND_OTP, { email });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as
        | { message?: string; error?: string }
        | undefined;
      const message = data?.message ?? data?.error;
      if (message) return thunkAPI.rejectWithValue(message);
    }
    return thunkAPI.rejectWithValue("Network Error");
  }
});

export const resendOtp = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/resendOtp", async ({ email }, thunkAPI) => {
  try {
    await api.post(API_ROUTES.AUTH.SEND_OTP, { email });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as
        | { message?: string; error?: string }
        | undefined;
      const message = data?.message ?? data?.error;
      if (message) return thunkAPI.rejectWithValue(message);
    }
    return thunkAPI.rejectWithValue("Network Error");
  }
});

export const verifyOtp = createAsyncThunk<
  void,
  { email: string; otp: string },
  { rejectValue: string }
>("auth/verifyOtp", async ({ email, otp }, thunkAPI) => {
  try {
    const response = await api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp });

    // Check if OTP was actually verified in the response
    const data = response.data;
    if (!data?.verified) {
      // OTP verification failed, return the error message
      const message = data?.message || "OTP verification failed";
      return thunkAPI.rejectWithValue(message);
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as
        | { message?: string; error?: string }
        | undefined;
      const message = data?.message ?? data?.error;
      if (message) return thunkAPI.rejectWithValue(message);
    }
    return thunkAPI.rejectWithValue("Network Error");
  }
});

export const completeSignup = createAsyncThunk<
  void,
  { email: string; firstName: string; lastName: string; password: string },
  { rejectValue: string }
>(
  "auth/completeSignup",
  async ({ email, firstName, lastName, password }, thunkAPI) => {
    try {
      await api.post(API_ROUTES.AUTH.COMPLETE_SIGNUP, {
        email,
        password,
        firstName,
        lastName,
      });
    } catch (err: any) {
      if (err.response?.data?.message)
        return thunkAPI.rejectWithValue(err.response.data.message);
      return thunkAPI.rejectWithValue("Network Error");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setOtp(state, action: PayloadAction<string>) {
      state.otp = action.payload;
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setFirstName(state, action: PayloadAction<string>) {
      state.firstName = action.payload;
    },
    setLastName(state, action: PayloadAction<string>) {
      state.lastName = action.payload;
    },
    setSignupStep(state, action: PayloadAction<number>) {
      state.signupStep = action.payload;
    },
    hydrateFromStorage(state) {
      try {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("accessToken");
        const role = localStorage.getItem("role");
        if (token && role) {
          state.isLoggedIn = true;
          state.accessToken = token;
          state.role = normalizeRole(role);
        }
      } catch {}
    },
    logout(state) {
      state.isLoggedIn = false;
      state.email = "";
      state.password = "";
      state.error = null;
      state.loading = false;
      state.signupStep = 1;
      state.otp = "";
      state.name = "";
      state.firstName = "";
      state.lastName = "";
      state.otpResendAvailableAt = null;
      state.accessToken = null;
      state.role = null;
      state.user = null;
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("role");
        }
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.error = null;
        state.accessToken = action.payload.accessToken;
        state.role = normalizeRole(action.payload.role);
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", action.payload.accessToken);
            // Store normalized role to ensure consistency on reload
            localStorage.setItem("role", state.role || "");
          }
        } catch {}
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to Login";
        state.isLoggedIn = false;
        state.accessToken = null;
      })
      .addCase(googleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.error = null;
        state.accessToken = action.payload.accessToken;
        state.role = normalizeRole(action.payload.role);
        state.user = action.payload.user;
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", action.payload.accessToken);
            // Store normalized role to ensure consistency on reload
            localStorage.setItem("role", state.role || "");
          }
        } catch {}
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to sign in with Google";
        state.isLoggedIn = false;
        state.accessToken = null;
      })
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.signupStep = 2;
        state.otpResendAvailableAt = Date.now() + 60_000;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to send OTP";
      })
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpResendAvailableAt = Date.now() + 60_000;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to resend OTP";
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.signupStep = 3;
        state.otpResendAvailableAt = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "OTP verification failed";
      })
      .addCase(completeSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSignup.fulfilled, (state) => {
        state.loading = false;
        state.signupStep = 1;
        state.email = "";
        state.otp = "";
        state.name = "";
        state.password = "";
        state.error = null;
        state.otpResendAvailableAt = null;
      })
      .addCase(completeSignup.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string" ? action.payload : "Signup failed";
      })
      .addCase(registerManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerManager.fulfilled, (state, action) => {
        state.loading = false;
        state.signupStep = 2;
        state.error = null;
        // Use server-provided expiry time to ensure timer matches backend
        // Parse the otpExpiresAt ISO string and convert to milliseconds
        const expiresAt = new Date(action.payload.otpExpiresAt).getTime();
        state.otpResendAvailableAt = expiresAt;
      })
      .addCase(registerManager.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Registration failed";
      })
      .addCase(acceptInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvite.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Accept invite failed";
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load profile";
      });
  },
});

export const {
  setEmail,
  setPassword,
  logout,
  setOtp,
  setName,
  setSignupStep,
  setFirstName,
  setLastName,
  hydrateFromStorage,
} = authSlice.actions;
export default authSlice.reducer;
