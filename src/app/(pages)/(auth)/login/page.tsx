"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

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
      } catch {}
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
    } catch (err) {
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
    <div className="min-h-dvh flex flex-col bg-white">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        {/* ... (UI unchanged) ... */}
        <div className="absolute inset-0 bg-[radial-gradient(84.09%_62.5%_at_0%_0%,rgba(36,99,235,0.25)_0%,rgba(36,99,235,0)_60%),radial-gradient(84.09%_62.5%_at_100%_0%,rgba(119,80,226,0.25)_0%,rgba(119,80,226,0)_60%),linear-gradient(180deg,#F8FAFC_0%,#EBEFF5_100%)]" />
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[linear-gradient(135deg,rgba(36,99,235,0.25)_0%,rgba(119,80,226,0.25)_100%)] blur-[32px]" />
        <div className="relative flex min-h-full items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Card className="shadow-sm sm:p-8">
              <div className="mb-8 text-center">
                <h1 className="mb-1 text-2xl font-bold text-gray-900">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-600">
                  Sign in to continue to Project Hub
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mb-2 space-y-4">
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
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

                <Button type="submit" fullWidth isLoading={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mb-6 flex items-center justify-between">
                <Link
                  className="text-sm text-blue-600 hover:text-blue-700"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
                <Link
                  className="text-sm text-gray-600 hover:text-gray-900"
                  href="/signup"
                >
                  Create account
                </Link>
              </div>

              <div className="mb-6 flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs text-gray-500">Or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSignIn}
                  onError={() =>
                    notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED)
                  }
                  text="signin_with"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Organization Name Modal */}
        {showOrgModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md shadow-xl" noPadding={false}>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Create Organization
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                To complete your signup as a Manager, please enter your
                Organization Name.
              </p>
              <form onSubmit={handleOrgSubmit}>
                <Input
                  label="Organization Name"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
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
                  <Button type="submit" disabled={loading} isLoading={loading}>
                    {loading ? "Creating..." : "Complete Signup"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
