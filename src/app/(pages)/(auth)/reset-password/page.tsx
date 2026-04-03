"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { notifier } from "@/utils/notifier";
import { useResetPasswordMutation } from "@/store/api/authApiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      notifier.error(null, "Invalid or missing reset token.");
      router.push("/login"); // Redirect if no token is present
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Initial Validations
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    if (!token) return;

    try {
      await resetPassword({ token, password }).unwrap();
      setIsSuccess(true);
      notifier.success("Password reset successful!");

      // Delay redirect to show success state
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      notifier.error(
        err,
        "Failed to reset password. The link may have expired.",
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
        <p className="text-gray-600">
          Your password has been reset successfully. You will be redirected to
          the login page shortly.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button
              variant="ghost"
              fullWidth
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Go to Login Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          type="password"
          label="New Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
          containerClassName="animate-in slide-in-from-bottom-2 duration-300"
        />
        <Input
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
          containerClassName="animate-in slide-in-from-bottom-2 duration-400"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 animate-in shake duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
      >
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        {/* Background Aesthetics */}
        <div className="absolute inset-0 bg-[radial-gradient(84.09%_62.5%_at_0%_0%,rgba(36,99,235,0.15)_0%,rgba(36,99,235,0)_60%),radial-gradient(84.09%_62.5%_at_100%_0%,rgba(119,80,226,0.15)_0%,rgba(119,80,226,0)_60%),linear-gradient(180deg,#F8FAFC_0%,#EBEFF5_100%)]" />

        <div className="relative flex min-h-full items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <Card className="shadow-xl sm:p-8 backdrop-blur-sm bg-white/90">
              <div className="mb-8 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  Set New Password
                </h1>
                <p className="text-sm text-gray-600">
                  Please enter your new password below to regain access to your
                  account.
                </p>
              </div>

              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                <ResetPasswordForm />
              </Suspense>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
