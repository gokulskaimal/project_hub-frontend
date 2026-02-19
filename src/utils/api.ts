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
    ROOT: "/projects",
    TASKS: "/projects/tasks",
  },
  ORGANIZATION: {
    USERS: "/organization/users",
  },
  CHAT: {
    BASE: "/chat",
    PROJECT: (projectId: string) => `/chat/${projectId}`,
    MESSAGE: (messageId: string) => `/chat/${messageId}`,
  },
  UPLOAD: {
    BASE: "/upload",
  },
} as const;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Dependency Injection for Store (to avoid circular dependency)
let appStore: any = null;

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

// Flag to prevent multiple redirects/toasts
let isRedirecting = false;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
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
  async (error) => {
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
      if (statusCode === 401) {
        // Clear localStorage
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          // Prevent infinite loop if the refresh endpoint itself returns 401
          if (config.url?.includes(API_ROUTES.AUTH.REFRESH)) {
            return Promise.reject(error);
          }

          if (isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (config.headers) {
                  config.headers.Authorization = `Bearer ${token}`;
                }
                return api(config);
              })
              .catch((err) => Promise.reject(err));
          }

          if (isRedirecting) {
            return Promise.reject(error);
          }

          config._retry = true;
          isRefreshing = true;

          try {
            // Attempt to refresh token
            // We use a fresh axios instance to avoid interceptor loops if needed,
            // but here we just check the URL above.
            const refreshResponse = await api.post(API_ROUTES.AUTH.REFRESH);
            const { accessToken } = refreshResponse.data?.data || {};

            if (accessToken) {
              localStorage.setItem("accessToken", accessToken);
              // Also update the header for the original request
              if (config.headers) {
                config.headers.Authorization = `Bearer ${accessToken}`;
              }
              processQueue(null, accessToken);
              return api(config);
            } else {
              throw new Error("No access token returned");
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);

            // Refresh failed - proceed to logout
            isRedirecting = true;
            toast.error("Your session has expired. Please login again.", {
              id: "session-expired",
            });
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            setTimeout(() => {
              window.location.href = "/login";
            }, 1000);
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        }
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
