"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { getFriendlyError } from "@/utils/errors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = requestSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid email");
      return;
    }

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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-gray-600">
          We have sent a password reset link to <strong>{email}</strong>.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive it? <button onClick={() => setSent(false)} className="text-blue-600 hover:underline">Try again</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
        <p className="text-sm text-gray-600 mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className={`w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Sending Link..." : "Send Reset Link"}
      </button>
      
      <div className="text-center mt-4">
        <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">Back to Login</a>
      </div>
    </form>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = resetSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          type="password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !password}
        className={`w-full rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Updating..." : "Set New Password"}
      </button>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
            <Suspense fallback={<div>Loading...</div>}>
              <ResetPasswordContent />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}