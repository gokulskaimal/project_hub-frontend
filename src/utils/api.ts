import axios from "axios";
import toast from "react-hot-toast";
import { startLoading, stopLoading } from "@/features/ui/uiSlice";

export const API_BASE_URL = "/api";

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh-token",
    RESET_PASSWORD_REQUEST: "/auth/reset-password-request",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    REGISTER_MANAGER: "/auth/register-manager",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    COMPLETE_SIGNUP: "/auth/complete-signup",
    INVITE_MEMBER: "/auth/invite-member",
    ACCEPT_INVITE: "/auth/accept-invite",
    GOOGLE_SIGNIN: "/auth/google-signin",
  },
  USER: {
    PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/user/change-password",
  },
  ADMIN: {
    ORGS: "/admin/organizations",
    USERS: "/admin/users",
    PLANS: "/admin/plans",
  },
  MANAGER: {
    MEMBERS: "/manager/members",
    PLANS: "/plans", // Public route for listing plans
    INVITATIONS: "/manager/invitations",
    ORGANIZATION: "/manager/organization",
  },
    PROJECTS: {
      ROOT : "/projects",
      TASKS : "/projects/tasks"
    }
} as const;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Dependency Injection for Store (to avoid circular dependency)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let appStore: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const injectStore = (store: any) => {
  appStore = store;
};

// Request Counter to handle parallel requests
let activeRequests = 0;

const showLoader = () => {
  if (activeRequests === 0 && appStore) {
    appStore.dispatch(startLoading());
  }
  activeRequests++;
};

const hideLoader = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    if (appStore) {
      appStore.dispatch(stopLoading());
    }
  }
};

// Extend AxiosRequestConfig to include our custom property
declare module "axios" {
  export interface AxiosRequestConfig {
    skipGlobalLoader?: boolean;
  }
}

api.interceptors.request.use(
  (config) => {
    // Trigger Global Loader unless explicitly skipped
    if (!config.skipGlobalLoader) {
      showLoader();
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {

    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (!response.config.skipGlobalLoader) {
        hideLoader();
    }
    return response;
  },
  (error) => {
    // attempt to read config from error object
    const config = error?.config || error?.response?.config;
    if (!config?.skipGlobalLoader) {
        hideLoader();
    }
    
    try {
      const data = error?.response?.data;
      const statusCode = error?.response?.status;
      const errorCode = data?.code;

      // Handle JWT token expiration
      if (statusCode === 401 && errorCode === "TOKEN_EXPIRED") {
        // Show toast notification
        toast.error("Your session has expired. Please login again.");

        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }

        // Redirect to login page
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000); // Give time for toast to be visible
        }

        return Promise.reject(error);
      }

      const extracted =
        typeof data === "string" && data.trim()
          ? data
          : data?.error?.message || // Standardized Backend Error
            data?.message ||
            data?.error || // Legacy text
            data?.detail ||
            (Array.isArray(data?.errors) && data.errors[0]?.message) ||
            error?.message ||
            "Network error";
      // Mutate the original AxiosError message so downstream handlers can read a friendly message
      if (extracted && typeof extracted === "string") {
        error.message = extracted;
      }
    } catch {}
    // Important: keep the original AxiosError so axios.isAxiosError remains true
    return Promise.reject(error);
  },
);

export default api;
