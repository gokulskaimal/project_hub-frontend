import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

export const selectSignupData = createSelector(
  (state: RootState) => state.auth,
  ({
    email,
    otp,
    name,
    password,
    firstName,
    lastName,
    signupStep,
    error,
    loading,
    otpResendAvailableAt,
    signupToken,
  }) => ({
    email,
    otp,
    name,
    password,
    firstName,
    lastName,
    signupStep,
    error,
    loading,
    otpResendAvailableAt,
    signupToken,
  }),
);
