import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

export const selectSignupData = createSelector(
    (state: RootState) => state.auth,
    ({email , otp , name , password ,signupStep , error , loading , otpResendAvailableAt})=>({email,otp,name,password , signupStep,error,loading, otpResendAvailableAt})
)