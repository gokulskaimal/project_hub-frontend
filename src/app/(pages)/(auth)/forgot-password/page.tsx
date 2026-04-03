"use client";

import { useState } from "react";
import Link from "next/link";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { useRequestPasswordResetMutation } from "@/store/api/authApiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      notifier.error(null, "Please enter your email address");
      return;
    }

    try {
      await requestReset({ email }).unwrap();
      setIsSubmitted(true);
      notifier.success("Reset link sent successfully");
    } catch (err: any) {
      notifier.error(err, "Failed to send reset link. Please try again.");
    }
  };

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
                <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  Forgot Password?
                </h1>
                <p className="text-sm text-gray-600">
                  {isSubmitted
                    ? "Check your email for a link to reset your password."
                    : "No worries! Enter your email and we'll send you a reset link."}
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email Address"
                    required
                    leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                    containerClassName="animate-in slide-in-from-bottom-2 duration-300"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                  >
                    Send Reset Link
                  </Button>
                </form>
              ) : (
                <div className="text-center animate-in zoom-in-95 duration-500">
                  <div className="p-4 bg-green-50 rounded-xl mb-6 border border-green-100">
                    <p className="text-sm text-green-700 font-medium">
                      If an account exists for {email}, you will receive a
                      password reset link shortly.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setIsSubmitted(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Didn&apos;t receive an email? Try again
                  </Button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
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
