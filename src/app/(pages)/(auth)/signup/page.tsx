'use client'

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from '@/store/store';
import {
  sendOtp,
  verifyOtp,
  completeSignup,
  setEmail,
  setOtp,
  setName,
  setPassword,
  resendOtp,
} from "@/features/auth/authSlice";
import { useEffect, useMemo, useState } from "react";
import { selectSignupData } from "@/features/auth/selectors";

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();


  const { email, otp, name, password, signupStep, error, loading, otpResendAvailableAt } = useSelector(selectSignupData);

  const [confirmPassword, setConfirmPassword] = useState('');

  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!otpResendAvailableAt) {
      setRemainingMs(0);
      return;
    }

    const updateRemaining = () => {
      const diff = otpResendAvailableAt - Date.now();
      setRemainingMs(diff > 0 ? diff : 0);
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(interval);
  }, [otpResendAvailableAt]);

  const isResendDisabled = useMemo(() => remainingMs > 0, [remainingMs]);

  const formattedTimer = useMemo(() => {
    if (remainingMs <= 0) return null;
    const seconds = Math.ceil(remainingMs / 1000);
    return `${seconds}s`;
  }, [remainingMs]);

  const onSendOtp = () => {
    dispatch(sendOtp({ email }));
  };

  const onResendOtp = () => {
    dispatch(resendOtp({ email }));
  };

  const onVerifyOtp = () => {
    dispatch(verifyOtp({ email, otp }));
  };

  const onCompleteSignup = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    dispatch(completeSignup({ email, name, password }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
        <section className="relative overflow-hidden  bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#2463EB]/25 to-[#2463EB]/0 blur-[32px]" />
            <div className="absolute top-0 right-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#8D65F1]/25 to-[#8D65F1]/0 blur-[32px]" />
          </div>

          <div className="container max-w-[1400px] mx-auto px-8 py-24">
            <div className="flex items-start gap-12 justify-center">
              {/* Left side - Sign up form */}
              <div className="flex-1 max-w-2xl">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                  Great outcomes start with{' '}
                  <span className="bg-gradient-to-r from-[#326DEC] to-[#8D65F1] bg-clip-text text-transparent">
                    Project Hub
                  </span>
                </h1>

                <p className="text-gray-600 text-base mb-4 max-w-lg">
                  The modern project management tool your team needs to plan and track work across every team.
                </p>

                <p className="text-xs text-gray-600 mb-6">
                  Use your work email for the best experience.
                </p>

                {/* Signup form steps */}
                {signupStep === 1 && (
                  <div className="flex items-center gap-3 mb-6 max-w-xl">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 17 17">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M14.9964 5.33655L9.00242 9.15455C8.79902 9.27269 8.56798 9.33492 8.33275 9.33492C8.09753 9.33492 7.86649 9.27269 7.66309 9.15455L1.66309 5.33655" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33" d="M13.6631 3.33655H2.99642C2.26004 3.33655 1.66309 3.9335 1.66309 4.66988V12.6699C1.66309 13.4063 2.26004 14.0032 2.99642 14.0032H13.6631C14.3995 14.0032 14.9964 13.4063 14.9964 12.6699V4.66988C14.9964 3.9335 14.3995 3.33655 13.6631 3.33655Z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                        value={email}
                        onChange={(e) => dispatch(setEmail(e.target.value))}
                        disabled={loading}
                      />
                    </div>
                    <button
                      className="h-10 px-6 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                      onClick={onSendOtp}
                      disabled={loading || !email}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                )}

                {signupStep === 2 && (
                  <>
                    <div className="flex items-center gap-3 mb-6 max-w-xl">
                      <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                          value={otp}
                          onChange={(e) => dispatch(setOtp(e.target.value))}
                          disabled={loading}
                        />
                      </div>
                      <button
                        className="h-10 px-6 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                        onClick={onVerifyOtp}
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? 'Verifying OTP...' : 'Verify OTP'}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>
                        Didn&apos;t get the code?
                      </span>
                      <button
                        className="text-[#2463EB] hover:underline disabled:text-gray-400"
                        type="button"
                        onClick={onResendOtp}
                        disabled={loading || isResendDisabled || !email}
                      >
                        Resend OTP
                      </button>
                      {formattedTimer && (
                        <span className="text-xs text-gray-500">
                          Try again in {formattedTimer}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {signupStep === 3 && (
                  <div className="space-y-4 max-w-xl">
                    <input
                      type="text"
                      placeholder="Organization Name"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={name}
                      onChange={(e) => dispatch(setName(e.target.value))}
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={password}
                      onChange={(e) => dispatch(setPassword(e.target.value))}
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      className="w-full h-10 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                      onClick={onCompleteSignup}
                      disabled={loading || !name || !password || !confirmPassword}
                    >
                      {loading ? 'Signing Up...' : 'Complete Signup'}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-sm text-red-600 max-w-xl">
                    {error}
                  </p>
                )}

                <p className="mt-8 text-gray-600 text-xs max-w-xl">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#2463EB] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
