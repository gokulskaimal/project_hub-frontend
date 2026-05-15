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
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ShieldCheck, UserPlus, Fingerprint } from "lucide-react";

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
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/30">
      <Header />

      <main className="relative flex-1 overflow-hidden">
        {/* Cinematic Background System */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="container max-w-[1400px] mx-auto px-6 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 justify-center">
            {/* Left Content: Hero Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 max-w-xl text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Rocket className="w-4 h-4" />
                Step 1: Sign Up
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-8 uppercase tracking-tighter leading-[0.9]">
                Build Your <br />
                <span className="text-gradient">Projects</span>
              </h1>

              <p className="text-muted-foreground text-sm mb-12 max-w-lg font-bold leading-relaxed opacity-70">
                The easiest way to manage your work. Bring your team together,
                track your progress, and get things done faster.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                {[
                  {
                    icon: ShieldCheck,
                    label: "Safe & Secure",
                    desc: "Your data is safe with us",
                  },
                  {
                    icon: Fingerprint,
                    label: "Easy Sync",
                    desc: "Updates for your whole team",
                  },
                ].map((feat, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="p-2.5 bg-secondary/10 rounded-xl border border-white/5 text-primary shrink-0">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-foreground uppercase tracking-widest">
                        {feat.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase opacity-40">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content: Signup Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-lg lg:max-w-xl"
            >
              <Card className="glass-card !p-10 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem]">
                <div className="mb-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">
                      Create Account
                    </h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
                      Form Step {signupStep} of 3
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-500 ${signupStep >= step ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "w-3 bg-white/5"}`}
                      />
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {signupStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Input
                          type="email"
                          placeholder="EMAIL ADDRESS"
                          value={email}
                          onChange={(e) => {
                            dispatch(setEmail(e.target.value));
                            setFieldErrors((prev) => ({ ...prev, email: "" }));
                          }}
                          disabled={loading}
                          error={fieldErrors.email}
                          className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                          leftIcon={
                            <UserPlus className="h-4 w-4 text-primary" />
                          }
                        />
                        <Input
                          type="text"
                          placeholder="ORGANIZATION NAME"
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
                          className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                        />
                      </div>
                      <Button
                        onClick={onRegisterManager}
                        disabled={loading || !email?.trim() || !name?.trim()}
                        isLoading={loading}
                        fullWidth
                        className="h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30"
                      >
                        {loading ? "SENDING..." : "Send Code"}
                      </Button>
                    </motion.div>
                  )}

                  {signupStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-relaxed italic">
                          We sent a code to{" "}
                          <span className="text-primary not-italic">
                            {email}
                          </span>
                          . <br />
                          Please enter the 6-digit code.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <Input
                          type="text"
                          placeholder="6-DIGIT CODE"
                          value={otp}
                          maxLength={6}
                          onChange={(e) => {
                            dispatch(setOtp(e.target.value));
                            setFieldErrors((prev) => ({ ...prev, otp: "" }));
                          }}
                          disabled={loading}
                          error={fieldErrors.otp}
                          className="bg-background/40 border-white/5 h-14 rounded-2xl text-center text-xl font-black tracking-[0.5em] flex-1"
                        />
                        <Button
                          onClick={onVerifyOtp}
                          disabled={loading || otp.length !== 6}
                          isLoading={loading}
                          className="h-14 px-8 rounded-2xl bg-primary font-black uppercase tracking-widest text-[11px]"
                        >
                          {loading ? "..." : "VERIFY"}
                        </Button>
                      </div>
                      <div className="flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <span className="opacity-40">
                            Didn&apos;t get the code?
                          </span>
                          <button
                            className="text-primary hover:brightness-125 disabled:opacity-30 disabled:pointer-events-none transition-all"
                            onClick={onResendOtp}
                            disabled={loading || isResendDisabled}
                          >
                            Resend Code
                          </button>
                        </div>
                        {formattedTimer && (
                          <div className="px-4 py-1 bg-secondary/10 border border-white/5 rounded-full opacity-40">
                            Wait: {formattedTimer}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {signupStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="FIRST NAME"
                          value={firstName}
                          onChange={(e) => {
                            dispatch(setFirstName(e.target.value));
                            setFieldErrors((prev) => ({
                              ...prev,
                              firstName: "",
                            }));
                          }}
                          disabled={loading}
                          error={fieldErrors.firstName}
                          className="bg-background/40 border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-wider"
                        />
                        <Input
                          type="text"
                          placeholder="LAST NAME"
                          value={lastName}
                          onChange={(e) => {
                            dispatch(setLastName(e.target.value));
                            setFieldErrors((prev) => ({
                              ...prev,
                              lastName: "",
                            }));
                          }}
                          disabled={loading}
                          error={fieldErrors.lastName}
                          className="bg-background/40 border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-wider"
                        />
                      </div>
                      <Input
                        type="password"
                        placeholder="CHOOSE A PASSWORD"
                        value={password}
                        onChange={(e) => {
                          dispatch(setPassword(e.target.value));
                          setFieldErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        disabled={loading}
                        error={fieldErrors.password}
                        className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                      />
                      <Input
                        type="password"
                        placeholder="CONFIRM PASSWORD"
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
                        className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                      />
                      <Button
                        fullWidth
                        onClick={onCompleteSignup}
                        disabled={
                          loading ||
                          !firstName?.trim() ||
                          !lastName?.trim() ||
                          !password?.trim() ||
                          confirmPassword !== password
                        }
                        isLoading={loading}
                        className="h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30"
                      >
                        {loading ? "SAVING..." : "Complete Signup"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-12 flex flex-col items-center gap-8">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Have an account?</span>
                    <Link
                      href="/login"
                      className="text-primary hover:brightness-125 transition-all"
                    >
                      Sign In
                    </Link>
                  </div>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-px bg-white/5" />
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-card px-4 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                        Social Sign In
                      </div>
                    </div>
                  </div>

                  <GoogleLogin
                    onSuccess={handleGoogleSignIn}
                    onError={() =>
                      notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED)
                    }
                    theme="filled_black"
                    shape="pill"
                    text="signup_with"
                  />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Organization Name Modal for Google Signup */}
      {showOrgModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/80 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card
              className="w-full max-w-md glass-card !p-10 border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-[3rem]"
              noPadding={false}
            >
              <div className="mb-8 space-y-2">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">
                  Organization Name
                </h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed">
                  Please enter your organization or team name to finish.
                </p>
              </div>
              <form onSubmit={handleGoogleOrgSubmit} className="space-y-6">
                <Input
                  label="ORGANIZATION NAME"
                  type="text"
                  value={googleOrgName}
                  onChange={(e) => setGoogleOrgName(e.target.value)}
                  placeholder="e.g. My Organization"
                  required
                  autoFocus
                  className="bg-background/50 border-white/5 text-[11px] font-black uppercase tracking-wider h-14 rounded-2xl"
                  labelClassName="!text-[9px] !font-black !uppercase !tracking-[0.2em] !text-muted-foreground !mb-2"
                />
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowOrgModal(false);
                      setPendingIdToken(null);
                    }}
                    className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !googleOrgName.trim()}
                    isLoading={loading}
                    className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    Create Organization
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
