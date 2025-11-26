"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api"; // Uses your configured axios instance
import { getFriendlyError } from "@/utils/errors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("code") || searchParams.get("token");
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        // Call the backend endpoint
        await api.post("/auth/verify-email", { token });
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(getFriendlyError(err, "Verification failed. The link may be expired or invalid."));
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl text-center">
      {status === 'verifying' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-xl font-bold text-gray-900">Verifying your email...</h2>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-600">Your account has been successfully verified.</p>
          <Link 
            href="/login" 
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Continue to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
          <p className="text-red-600 text-sm">{message}</p>
          <div className="flex gap-3 w-full mt-2">
            <Link 
              href="/login"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Login
            </Link>
            {/* Optional: Add button to request new verification email if you have that endpoint */}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="relative flex-1 flex items-center justify-center py-16 bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}