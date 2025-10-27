import axios from "axios";

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api`;

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
  },
  USER: {
    PROFILE: "/user/profile",
  },
  ADMIN: {
    ORGS: "/admin/orgs",
    USERS: "/admin/users",
  },
  MANAGER: {
    MEMBERS: "/manager/members",
  },
} as const;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error || error?.message || "Network error";
    return Promise.reject(new Error(message));
  },
);

export default api;
