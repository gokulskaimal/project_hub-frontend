import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type {
  AuthResponse,
  LoginPayload,
  GoogleSignInPayload,
  RegisterManagerPayload,
  RegisterManagerResponse,
  VerifyOtpPayload,
  CompleteSignupPayload,
  AcceptInvitePayload,
} from "@/types/auth";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (credentials) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        data: credentials,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
    }),
    googleSignIn: builder.mutation<AuthResponse, GoogleSignInPayload>({
      query: (data) => ({
        url: API_ROUTES.AUTH.GOOGLE_SIGNIN,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
    }),
    registerManager: builder.mutation<
      RegisterManagerResponse,
      RegisterManagerPayload
    >({
      query: (data) => ({
        url: API_ROUTES.AUTH.SIGNUP_MANAGER,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: RegisterManagerResponse }) =>
        response.data,
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpPayload>({
      query: (data) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
    }),
    sendOtp: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: API_ROUTES.AUTH.SEND_OTP,
        method: "POST",
        data,
      }),
    }),
    completeSignup: builder.mutation<AuthResponse, CompleteSignupPayload>({
      query: (data) => ({
        url: API_ROUTES.AUTH.COMPLETE_SIGNUP,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
    }),
    acceptInvite: builder.mutation<AuthResponse, AcceptInvitePayload>({
      query: (data) => ({
        url: API_ROUTES.AUTH.ACCEPT_INVITE,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: AuthResponse }) => response.data,
    }),
    requestPasswordReset: builder.mutation<void, { email: string }>({
      query: (data) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD_REQUEST,
        method: "POST",
        data,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: (data) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: "POST",
        data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleSignInMutation,
  useRegisterManagerMutation,
  useVerifyOtpMutation,
  useSendOtpMutation,
  useCompleteSignupMutation,
  useAcceptInviteMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApiSlice;
