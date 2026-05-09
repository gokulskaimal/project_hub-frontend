"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { motion } from "framer-motion";

// Components
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

// Redux
import { RootState } from "@/store/store";
import {
  useLoginMutation,
  useGoogleSignInMutation,
} from "@/store/api/authApiSlice";
import Link from "next/link";

// Define schema outside component
const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [googleSignInMutation, { isLoading: googleLoading }] =
    useGoogleSignInMutation();

  // Local state for form inputs (Performance Optimization)
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const { error, isLoggedIn, role, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );
  const loading = loginLoading || googleLoading;

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  // Handle local input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Error/Redirect effects remain
  useEffect(() => {
    if (error) {
      notifier.error(null, error);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoggedIn || !role) return;

    if (accessToken) {
      try {
        localStorage.setItem("accessToken", accessToken);
        // Note: For Middleware security, your backend MUST also set a 'role' cookie.
      } catch (e) {
        // Silently fail if storage is unavailable
        console.error("Error setting auth in storage", e);
      }
    }

    const normalizedRole = role.toUpperCase().replace(/[\s-]+/g, "_");

    switch (normalizedRole) {
      case "SUPER_ADMIN":
        router.push("/admin/dashboard");
        break;
      case "ORG_MANAGER":
      case "MANAGER":
        router.push("/manager/dashboard");
        break;
      case "TEAM_MEMBER":
      case "MEMBER":
        router.push("/member/dashboard");
        break;
      default:
        router.push("/");
        break;
    }
  }, [isLoggedIn, role, accessToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      const formattedErrors: { email?: string; password?: string } = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0])
          formattedErrors[err.path[0] as "email" | "password"] = err.message;
      });
      setFormErrors(formattedErrors);
      notifier.error(null, MESSAGES.VALIDATION.FIX_ERRORS);
      return;
    }

    try {
      await login(parsed.data).unwrap();
      notifier.success(MESSAGES.AUTH.LOGIN_SUCCESS);
    } catch {
      // Error handled by authSlice matcher and effect
    }
  };

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED);
      return;
    }
    try {
      await googleSignInMutation({ idToken: credential }).unwrap();
      notifier.success(MESSAGES.AUTH.LOGIN_SUCCESS);
    } catch (err: unknown) {
      const error = err as {
        data?: { error?: { message?: string }; message?: string };
        message?: string;
      };
      const errorMessage =
        error?.data?.error?.message ||
        error?.data?.message ||
        error?.message ||
        "Unknown error";

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

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !pendingIdToken) return;

    try {
      await googleSignInMutation({ idToken: pendingIdToken, orgName }).unwrap();
      setShowOrgModal(false);
      setPendingIdToken(null);
      setOrgName("");
      notifier.success(MESSAGES.AUTH.GOOGLE_SIGNIN_SUCCESS);
    } catch (err) {
      notifier.error(err, MESSAGES.AUTH.SIGNUP_FAILED);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/30">
      <Header />
      <main className="relative flex-1 overflow-hidden flex items-center justify-center">
        {/* Animated Background System */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Card className="glass-card !p-10 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem]">
              <div className="mb-12 text-center space-y-2">
                <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter italic">
                  Welcome back
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-60">
                  Sign in to Project Hub
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={formErrors.email}
                    className="bg-background/50 border-white/5 focus:border-primary/50 text-[11px] font-black uppercase tracking-wider h-14 rounded-2xl"
                    leftIcon={
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    }
                  />

                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    error={formErrors.password}
                    className="bg-background/50 border-white/5 focus:border-primary/50 text-[11px] font-black uppercase tracking-wider h-14 rounded-2xl"
                    leftIcon={
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    }
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  isLoading={loading}
                  className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-8 flex items-center justify-between px-2">
                <Link
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:brightness-125 transition-all"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
                <Link
                  className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
                  href="/signup"
                >
                  Create account
                </Link>
              </div>

              <div className="my-10 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                  Or
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSignIn}
                  onError={() =>
                    notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED)
                  }
                  theme="filled_black"
                  shape="pill"
                  text="signin_with"
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Organization Name Modal */}
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
                    Create Organization
                  </h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed">
                    To complete your signup as a Manager, please enter your
                    Organization Name.
                  </p>
                </div>

                <form onSubmit={handleOrgSubmit} className="space-y-6">
                  <Input
                    label="COLLECTIVE IDENTITY (ORG NAME)"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. CORE SYSTEMS"
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
                      Abort
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      isLoading={loading}
                      className="flex-1 h-12 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      Anchor Node
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
