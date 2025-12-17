"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { getFriendlyError } from "@/utils/errors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

// --- Schemas ---
const requestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// --- Components ---

function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = requestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message);
      toast.error(parsed.error.errors[0]?.message ?? "Invalid email");
      return;
    }
    setError(undefined);

    setLoading(true);
    try {
      await api.post("/auth/reset-password-request", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, "Failed to send reset link"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We have sent a password reset link to <strong>{email}</strong>.
        </p>
        <p className="text-sm text-gray-500">
          Didn&apos;t receive it? <button onClick={() => setSent(false)} className="text-blue-600 hover:underline">Try again</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-sm text-gray-600 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(undefined); }}
        disabled={loading}
        error={error}
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        disabled={loading || !email}
        isLoading={loading}
      >
        {loading ? "Sending Link..." : "Send Reset Link"}
      </Button>

      <div className="text-center mt-4">
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Back to Login</Link>
      </div>
    </form>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = resetSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const newErrors: { password?: string; confirmPassword?: string } = {};
      parsed.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as 'password' | 'confirmPassword'] = err.message;
      });
      setErrors(newErrors);
      toast.error("Please fix the errors");
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password: parsed.data.password
      });

      toast.success("Password reset successful! Please log in.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <p className="text-sm text-gray-600 mt-1">Choose a strong new password for your account.</p>
      </div>

      <Input
        label="New Password"
        type="password"
        placeholder="Minimum 8 characters"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
        disabled={loading}
        error={errors.password}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
        disabled={loading}
        error={errors.confirmPassword}
      />

      <Button
        type="submit"
        fullWidth
        disabled={loading || !password}
        isLoading={loading}
      >
        {loading ? "Updating..." : "Set New Password"}
      </Button>
    </form>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // If token is present, show the Reset Password form
  if (token) {
    return <ResetPasswordForm token={token} />;
  }

  // Otherwise, show the Request Reset form (Forgot Password)
  return <RequestResetForm />;
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="relative flex-1 flex items-center justify-center py-16 bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
        <div className="w-full max-w-md">
          <Card className="shadow-xl sm:p-8">
            <Suspense fallback={<div>Loading...</div>}>
              <ResetPasswordContent />
            </Suspense>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}