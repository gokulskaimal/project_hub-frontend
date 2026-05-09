import { createSlice, PayloadAction, isAnyOf } from "@reduxjs/toolkit";
import { authApiSlice } from "../../store/api/authApiSlice";
import { userApiSlice } from "../../store/api/userApiSlice";
import { UserProfile } from "@/types/auth";

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

const initialState: AuthState = { ...baseInitialState };

const normalizeRole = (role: string | null): string | null => {
  if (!role) return null;
  // Standardize to uppercase and underscores (e.g., "ORG_MANAGER") to match server and constants
  return role
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

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
      } catch (error) {
        console.error("Error hydrating from storage", error);
      }
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
      } catch (error) {
        console.error("Error logging out", error);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // RTK Query Matchers
      .addMatcher(authApiSlice.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(
          authApiSlice.endpoints.login.matchFulfilled,
          authApiSlice.endpoints.googleSignIn.matchFulfilled,
        ),
        (state, action) => {
          state.loading = false;
          state.isLoggedIn = true;
          state.error = null;
          state.accessToken = action.payload.accessToken;
          state.role = normalizeRole(action.payload.user.role);
          state.user = {
            ...action.payload.user,
            role: state.role || action.payload.user.role,
          };

          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("accessToken", action.payload.accessToken);
              localStorage.setItem("role", state.role || "");
            }
          } catch (error) {
            console.error("Error setting auth in storage", error);
          }
        },
      )
      .addMatcher(
        isAnyOf(
          authApiSlice.endpoints.login.matchRejected,
          authApiSlice.endpoints.googleSignIn.matchRejected,
        ),
        (state, action) => {
          state.loading = false;
          const payload = action.payload as
            | { data?: { error?: { message?: string }; message?: string } }
            | undefined;
          state.error =
            payload?.data?.error?.message ||
            payload?.data?.message ||
            "Authentication failed";
          state.isLoggedIn = false;
        },
      )
      .addMatcher(
        userApiSlice.endpoints.getProfile.matchFulfilled,
        (state, action) => {
          state.loading = false;
          const role = normalizeRole(action.payload.role);
          state.user = {
            ...action.payload,
            role: role || action.payload.role,
          };
          state.role = role;
          state.error = null;
        },
      )
      .addMatcher(authApiSlice.endpoints.verifyOtp.matchFulfilled, (state) => {
        state.loading = false;
        state.signupStep = 3;
        state.otpResendAvailableAt = null;
      })
      .addMatcher(
        authApiSlice.endpoints.registerManager.matchFulfilled,
        (state, action) => {
          state.loading = false;
          state.signupStep = 2;
          const expiresAt = new Date(action.payload.otpExpiresAt).getTime();
          state.otpResendAvailableAt = expiresAt;
        },
      );
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
