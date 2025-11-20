export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    COMPLETE_SIGNUP: "/api/auth/complete-signup",
    GOOGLE_SIGNIN: "/api/auth/google-signin",
    ACCEPT_INVITE: "/api/auth/accept-invite",
    REGISTER_MANAGER: "/api/auth/register-manager",
  },
} as const;
