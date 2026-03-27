"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  setEmail,
  setOtp,
  setName,
  setPassword,
  setFirstName,
  setLastName,
} from "@/features/auth/authSlice";
import {
  useRegisterManagerMutation,
  useVerifyOtpMutation,
  useSendOtpMutation as useResendOtpMutation,
  useCompleteSignupMutation,
  useGoogleSignInMutation,
} from "@/store/api/authApiSlice";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { selectSignupData } from "@/features/auth/selectors";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SignUpPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [registerManagerMutation, { isLoading: registerLoading }] =
    useRegisterManagerMutation();
  const [resendOtpMutation, { isLoading: resendLoading }] =
    useResendOtpMutation();
  const [verifyOtpMutation, { isLoading: verifyLoading }] =
    useVerifyOtpMutation();
  const [completeSignupMutation, { isLoading: completeLoading }] =
    useCompleteSignupMutation();
  const [googleSignInMutation, { isLoading: googleLoading }] =
    useGoogleSignInMutation();

  const {
    email,
    otp,
    name,
    password,
    firstName,
    lastName,
    signupStep,
    error,
    otpResendAvailableAt,
  } = useSelector(selectSignupData);
  const loading =
    registerLoading ||
    resendLoading ||
    verifyLoading ||
    completeLoading ||
    googleLoading;

  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (error && typeof error === "string" && error.trim()) {
      notifier.error(error, MESSAGES.AUTH.SIGNUP_FAILED);
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
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [otpResendAvailableAt]);

  const isResendDisabled = useMemo(() => remainingMs > 0, [remainingMs]);

  const formattedTimer = useMemo(() => {
    if (remainingMs <= 0) return null;
    const seconds = Math.ceil(remainingMs / 1000);
    return `${seconds}s`;
  }, [remainingMs]);

  const onRegisterManager = async () => {
    const schema = z.object({
      email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email"),
      organizationName: z
        .string()
        .trim()
        .min(2, "Organization name is required"),
    });
    const parsed = schema.safeParse({ email, organizationName: name });
    if (!parsed.success) {
      // Set field errors for inline display
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      notifier.error(null, MESSAGES.VALIDATION.INVALID_INPUT);
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await registerManagerMutation({
        email: parsed.data.email,
        organizationName: parsed.data.organizationName,
      }).unwrap();
      notifier.success(MESSAGES.AUTH.OTP_SENT);
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
    }
  };

  const onResendOtp = async () => {
    const emailCheck = z
      .string()
      .trim()
      .email("Enter a valid email")
      .safeParse(email);
    if (!emailCheck.success) {
      notifier.error(null, MESSAGES.VALIDATION.INVALID_INPUT);
      return;
    }
    try {
      await resendOtpMutation({ email: emailCheck.data }).unwrap();
      notifier.success(MESSAGES.AUTH.OTP_RESEND);
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
    }
  };

  const onVerifyOtp = async () => {
    const schema = z.object({
      email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Enter a valid email"),
      otp: z
        .string()
        .trim()
        .min(1, "OTP is required")
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
    });
    const parsed = schema.safeParse({ email, otp });
    if (!parsed.success) {
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      notifier.error(null, MESSAGES.VALIDATION.INVALID_INPUT);
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await verifyOtpMutation(parsed.data).unwrap();
      notifier.success(MESSAGES.AUTH.OTP_VERIFIED);
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
    }
  };

  const onCompleteSignup = async () => {
    const schema = z
      .object({
        email: z
          .string()
          .trim()
          .min(1, "Email is required")
          .email("Enter a valid email"),
        firstName: z.string().trim().min(2, "First name too short"),
        lastName: z.string().trim().min(2, "Last name too short"),
        password: z
          .string()
          .trim()
          .min(8, "Password must be at least 8 characters"),
        confirmPassword: z
          .string()
          .trim()
          .min(1, "Confirm password is required"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });

    const parsed = schema.safeParse({
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      const errors: { [key: string]: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFieldErrors(errors);
      notifier.error(null, MESSAGES.VALIDATION.FIX_ERRORS);
      return;
    } else {
      setFieldErrors({});
    }
    try {
      await completeSignupMutation({
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        password: parsed.data.password,
      }).unwrap();
      notifier.success(MESSAGES.AUTH.SIGNUP_SUCCESS);
      router.push("/login");
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
    }
  };

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [googleOrgName, setGoogleOrgName] = useState("");
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED);
      return;
    }

    try {
      await googleSignInMutation({ idToken: credential }).unwrap();
      notifier.success(MESSAGES.AUTH.GOOGLE_SIGNIN_SUCCESS);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      const errorMessage =
        error?.data?.message || error?.message || "Unknown error";

      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Organization Name Required")
      ) {
        notifier.info(MESSAGES.AUTH.ORG_NAME_REQUIRED, { icon: "🏢" });
        setPendingIdToken(credential);
        setShowOrgModal(true);
        return;
      }
      notifier.error(err, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED);
    }
  };

  const handleGoogleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleOrgName.trim() || !pendingIdToken) return;

    try {
      await googleSignInMutation({
        idToken: pendingIdToken,
        orgName: googleOrgName,
      }).unwrap();
      setShowOrgModal(false);
      setPendingIdToken(null);
      setGoogleOrgName("");
      notifier.success(MESSAGES.AUTH.GOOGLE_SIGNIN_SUCCESS);
      router.push("/login");
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
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
              <div className="flex-1 max-w-2xl">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                  Great outcomes start with{" "}
                  <span className="bg-gradient-to-r from-[#326DEC] to-[#8D65F1] bg-clip-text text-transparent">
                    Project Hub
                  </span>
                </h1>

                <p className="text-gray-600 text-base mb-4 max-w-lg">
                  The modern project management tool your team needs to plan and
                  track work across every team.
                </p>

                <p className="text-xs text-gray-600 mb-6">
                  Use your work email for the best experience.
                </p>

                {/* Signup form steps */}
                {signupStep === 1 && (
                  <div className="grid gap-3 mb-6 max-w-xl">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        dispatch(setEmail(e.target.value));
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      disabled={loading}
                      error={fieldErrors.email}
                      leftIcon={
                        <svg
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 17 17"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.33"
                            d="M14.9964 5.33655L9.00242 9.15455C8.79902 9.27269 8.56798 9.33492 8.33275 9.33492C8.09753 9.33492 7.86649 9.27269 7.66309 9.15455L1.66309 5.33655"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.33"
                            d="M13.6631 3.33655H2.99642C2.26004 3.33655 1.66309 3.9335 1.66309 4.66988V12.6699C1.66309 13.4063 2.26004 14.0032 2.99642 14.0032H13.6631C14.3995 14.0032 14.9964 13.4063 14.9964 12.6699V4.66988C14.9964 3.9335 14.3995 3.33655 13.6631 3.33655Z"
                          />
                        </svg>
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Organization Name"
                      value={name}
                      onChange={(e) => {
                        dispatch(setName(e.target.value));
                        setFieldErrors((prev) => ({
                          ...prev,
                          organizationName: "",
                        }));
                      }}
                      disabled={loading}
                      error={fieldErrors.organizationName}
                    />
                    <Button
                      onClick={onRegisterManager}
                      disabled={loading || !email?.trim() || !name?.trim()}
                      isLoading={loading}
                    >
                      {loading ? "Creating..." : "Create org & Send OTP"}
                    </Button>
                  </div>
                )}

                {signupStep === 2 && (
                  <>
                    <div className="flex items-center gap-3 mb-6 max-w-xl">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => {
                            dispatch(setOtp(e.target.value));
                            setFieldErrors((prev) => ({ ...prev, otp: "" }));
                          }}
                          disabled={loading}
                          error={fieldErrors.otp}
                          leftIcon={
                            <svg
                              className="h-4 w-4 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                              />
                            </svg>
                          }
                        />
                      </div>
                      <div className="mt-[-25px]">
                        <Button
                          onClick={onVerifyOtp}
                          disabled={loading || otp.length !== 6}
                          isLoading={loading}
                        >
                          {loading ? "Verify OTP..." : "Verify OTP"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>Didn&apos;t get the code?</span>
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
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => {
                        dispatch(setFirstName(e.target.value));
                        setFieldErrors((prev) => ({ ...prev, firstName: "" }));
                      }}
                      disabled={loading}
                      error={fieldErrors.firstName}
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => {
                        dispatch(setLastName(e.target.value));
                        setFieldErrors((prev) => ({ ...prev, lastName: "" }));
                      }}
                      disabled={loading}
                      error={fieldErrors.lastName}
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        dispatch(setPassword(e.target.value));
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      disabled={loading}
                      error={fieldErrors.password}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));
                      }}
                      disabled={loading}
                      error={fieldErrors.confirmPassword}
                    />
                    <Button
                      fullWidth
                      onClick={onCompleteSignup}
                      disabled={
                        loading ||
                        !firstName?.trim() ||
                        !lastName?.trim() ||
                        !name?.trim() ||
                        !password?.trim() ||
                        !confirmPassword?.trim()
                      }
                      isLoading={loading}
                    >
                      {loading ? "Signing Up..." : "Complete Signup"}
                    </Button>
                  </div>
                )}

                {error && <></>}

                <p className="mt-8 text-gray-600 text-xs max-w-xl">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#2463EB] hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                <div className="relative my-6 max-w-xl">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center max-w-xl">
                  <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() => {
                      console.error(
                        "[GoogleLogin Error] Sign-in failed on signup page",
                      );
                      notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED);
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
          <Card className="w-full max-w-md shadow-xl" noPadding={false}>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Create Organization
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              To complete your signup via Google as an Organization Manager,
              please enter your Organization Name.
            </p>
            <form onSubmit={handleGoogleOrgSubmit}>
              <Input
                label="Organization Name"
                type="text"
                value={googleOrgName}
                onChange={(e) => setGoogleOrgName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
                autoFocus
                containerClassName="mb-4"
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowOrgModal(false);
                    setPendingIdToken(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !googleOrgName.trim()}
                  isLoading={loading}
                >
                  {loading ? "Creating..." : "Complete Signup"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
