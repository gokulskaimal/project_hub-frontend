'use client'

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from '@/store/store';
import {
  verifyOtp,
  completeSignup,
  setEmail,
  setOtp,
  setName,
  setPassword,
  resendOtp,
  setFirstName,
  setLastName,
  googleSignIn,
} from "@/features/auth/authSlice";
import { registerManager } from '@/features/auth/authSlice';
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { selectSignupData } from "@/features/auth/selectors";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();


  const { email, otp, name, password, firstName, lastName, signupStep, error, loading, otpResendAvailableAt } = useSelector(selectSignupData);

  const [confirmPassword, setConfirmPassword] = useState('');
  // Error states for inline validation
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (error && typeof error === 'string' && error.trim()) {
      toast.error(error);
    }
  }, [error]);

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

  const onRegisterManager = async () => {
    const schema = z.object({
      email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
      organizationName: z.string().trim().min(2, 'Organization name is required')
    });
    const parsed = schema.safeParse({ email, organizationName: name });
    if (!parsed.success) {
      // Set field errors for inline display
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid email');
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await dispatch(registerManager({ email: parsed.data.email, organizationName: parsed.data.organizationName })).unwrap();
      toast.success('Organization created and OTP sent');
    } catch (err: unknown) {
      const message = typeof err === 'string' ? err : 'Failed to register';
      toast.error(message);
    }
  };

  const onResendOtp = async () => {
    const emailCheck = z.string().trim().email('Enter a valid email').safeParse(email);
    if (!emailCheck.success) {
      toast.error(emailCheck.error.errors[0]?.message ?? 'Enter a valid email');
      return;
    }
    try {
      await dispatch(resendOtp({ email: emailCheck.data })).unwrap();
      toast.success('OTP resent');
    } catch (err: unknown) {
      const message = typeof err === 'string' ? err : 'Failed to resend OTP';
      toast.error(message);
    }
  };

  const onVerifyOtp = async () => {
    const schema = z.object({
      email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
      otp: z.string().trim().min(1, 'OTP is required').regex(/^\d{6}$/, 'OTP must be 6 digits'),
    });
    const parsed = schema.safeParse({ email, otp });
    if (!parsed.success) {
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid OTP');
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await dispatch(verifyOtp(parsed.data)).unwrap();
      toast.success('OTP verified');
    } catch (err: unknown) {
      const message = typeof err === 'string' ? err : 'OTP verification failed';
      toast.error(message);
    }
  };

  const onCompleteSignup = async () => {
    const schema = z.object({
      email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
      firstName: z.string().trim().min(2, 'First name too short'),
      lastName: z.string().trim().min(2, 'Last name too short'),
      password: z.string().trim().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().trim().min(1, 'Confirm password is required'),
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    });

    const parsed = schema.safeParse({ email, firstName, lastName, password, confirmPassword });
    if (!parsed.success) {
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await dispatch(completeSignup({ email: parsed.data.email, firstName: parsed.data.firstName, lastName: parsed.data.lastName, password: parsed.data.password })).unwrap();
      toast.success('Signup complete. You can now sign in.');
      router.push('/login');
    } catch (err: unknown) {
      const message = typeof err === 'string' ? err : 'Signup failed';
      toast.error(message);
    }
  };

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [googleOrgName, setGoogleOrgName] = useState("");
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      toast.error("Google sign-in failed: No credential received");
      return;
    }

    try {
      // First, try to sign in without organization name
      // If user is new and manager signup is required, backend will return "Organization Name Required"
      await dispatch(
        googleSignIn({ idToken: credential })
      ).unwrap();
      // Success - user exists or already has org
      toast.success("Signed in successfully!");
    } catch (err: unknown) {
      console.error("Google Sign-In Error:", err);
      const errorMessage =
        typeof err === "string"
          ? err
          : (err as Record<string, unknown>)?.message || "Unknown error";

      // If new user needs org name, show modal
      if (errorMessage === "Organization Name Required") {
        toast("Please enter your Organization Name to complete signup", {
          icon: "🏢",
        });
        setPendingIdToken(credential);
        setGoogleOrgName("");
        setShowOrgModal(true);
        return;
      }
      // Other errors
      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else {
        toast.error("Google sign-in failed");
      }
    }
  };

  const handleGoogleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleOrgName.trim() || !pendingIdToken) return;

    try {
      await dispatch(
        googleSignIn({ idToken: pendingIdToken, orgName: googleOrgName })
      ).unwrap();
      setShowOrgModal(false);
      setPendingIdToken(null);
      setGoogleOrgName("");
      toast.success("Account created successfully!");
      router.push('/login')
    } catch (err: unknown) {
      console.error("Google Sign-In with Org Name Failed:", err);
      const message =
        typeof err === "string" ? err : "Failed to complete signup";
      toast.error(message);
    }
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
                  <div className="grid gap-3 mb-6 max-w-xl">
                    <div className="relative">
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
                        onChange={(e) => { dispatch(setEmail(e.target.value)); setFieldErrors((prev) => ({ ...prev, email: '' })); }}
                        disabled={loading}
                      />
                      {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Organization Name"
                        className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                        value={name}
                        onChange={(e) => { dispatch(setName(e.target.value)); setFieldErrors((prev) => ({ ...prev, organizationName: '' })); }}
                        disabled={loading}
                      />
                      {fieldErrors.organizationName && <p className="text-xs text-red-500 mt-1">{fieldErrors.organizationName}</p>}
                    </div>
                    <button
                      className="h-10 px-6 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                      onClick={onRegisterManager}
                      disabled={loading || !email?.trim() || !name?.trim()}
                    >
                      {loading ? 'Creating...' : 'Create org & Send OTP'}
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
                          onChange={(e) => { dispatch(setOtp(e.target.value)); setFieldErrors((prev) => ({ ...prev, otp: '' })); }}
                          disabled={loading}
                        />
                        {fieldErrors.otp && <p className="text-xs text-red-500 mt-1">{fieldErrors.otp}</p>}
                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                      </div>
                      <button
                        className="h-10 px-6 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                        onClick={onVerifyOtp}
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? 'Verify OTP...' : 'Verify OTP'}
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
                        disabled={loading || isResendDisabled || !email?.trim()}
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
                      placeholder="First Name"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={firstName}
                      onChange={(e) => { dispatch(setFirstName(e.target.value)); setFieldErrors((prev) => ({ ...prev, firstName: '' })); }}
                      disabled={loading}
                    />
                    {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={lastName}
                      onChange={(e) => { dispatch(setLastName(e.target.value)); setFieldErrors((prev) => ({ ...prev, lastName: '' })); }}
                      disabled={loading}
                    />
                    {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={password}
                      onChange={(e) => { dispatch(setPassword(e.target.value)); setFieldErrors((prev) => ({ ...prev, password: '' })); }}
                      disabled={loading}
                    />
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, confirmPassword: '' })); }}
                      disabled={loading}
                    />
                    {fieldErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>}
                    <button
                      className="w-full h-10 rounded-lg bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                      onClick={onCompleteSignup}
                      disabled={loading || !firstName?.trim() || !lastName?.trim() || !name?.trim() || !password?.trim() || !confirmPassword?.trim()}
                    >
                      {loading ? 'Signing Up...' : 'Complete Signup'}
                    </button>
                  </div>
                )}

                {error && (
                  <></>
                )}

                <p className="mt-8 text-gray-600 text-xs max-w-xl">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#2463EB] hover:underline">
                    Sign in
                  </Link>
                </p>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() => {
                      console.error("[GoogleLogin Error] Sign-in failed on signup page");
                      toast.error("Google sign-in failed. Please try again or use email signup.");
                    }}
                    text="signup_with"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Organization Name Modal for Google Signup */}
      {showOrgModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Create Organization
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              To complete your signup via Google as an Organization Manager,
              please enter your Organization Name.
            </p>
            <form onSubmit={handleGoogleOrgSubmit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={googleOrgName}
                  onChange={(e) => setGoogleOrgName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Acme Corp"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOrgModal(false);
                    setPendingIdToken(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !googleOrgName.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Complete Signup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
