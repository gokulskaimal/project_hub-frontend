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
import { motion } from "framer-motion";

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
      router.push("/login");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      notifier.error(
        err,
        "Failed to reset password. The link may have expired.",
      );
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">
          Success!
        </h2>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">
          Neural access key reconfigured. <br />
          Redirecting to primary login node...
        </p>
        <div className="pt-6">
          <Link href="/login">
            <Button
              variant="ghost"
              fullWidth
              className="h-12 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10"
            >
              Access Login Node Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-4">
        <Input
          type="password"
          placeholder="NEW ACCESS KEY (PASSWORD)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
          leftIcon={<Lock className="h-4 w-4 text-primary" />}
        />
        <Input
          type="password"
          placeholder="VERIFY NEW KEY"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
          leftIcon={<Lock className="h-4 w-4 text-primary" />}
        />
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl text-[9px] font-black uppercase tracking-widest border border-destructive/20 animate-in shake duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
      >
        Finalize Key Reset
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/30">
      <Header />
      <main className="relative flex-1 overflow-hidden flex items-center justify-center">
        {/* Animated Background System */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
          <div className="absolute top-[10%] right-[20%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[110px] animate-pulse" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="glass-card !p-10 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem]">
              <div className="mb-10 text-center">
                <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(var(--primary),0.15)] border border-primary/20">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic mb-3">
                  Reconfigure Key
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">
                  Establish a new neural access key <br />
                  to regain network connectivity.
                </p>
              </div>

              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
                  </div>
                }
              >
                <ResetPasswordForm />
              </Suspense>

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:brightness-125 transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 mr-3 transition-transform group-hover:-translate-x-1.5" />
                  Abort & Return
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
