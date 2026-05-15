"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { API_ROUTES } from "@/utils/api";
import { getFriendlyError } from "@/utils/errors";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("code") || searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        await api.post(API_ROUTES.AUTH.VERIFY_EMAIL, { token });
        setStatus("success");
      } catch (err: unknown) {
        setStatus("error");
        setMessage(
          getFriendlyError(
            err,
            "Verification failed. The link may be expired or invalid.",
          ),
        );
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-lg glass-card !p-12 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem] text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      <div className="relative z-10">
        {status === "verifying" && (
          <div className="flex flex-col items-center space-y-8 py-4">
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/10 border-t-primary shadow-[0_0_30px_rgba(var(--primary),0.3)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary/40" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">
                Verifying Account
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">
                Verifying your email and finalizing your setup...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 py-4"
          >
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">
                Email Verified
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed">
                Your account has been successfully verified. <br />
                Welcome to Project Hub.
              </p>
            </div>
            <Link href="/login" className="w-full pt-4">
              <Button className="h-14 w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30">
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 py-4"
          >
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-[0_0_50px_rgba(var(--destructive),0.2)]">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-destructive uppercase tracking-tighter italic">
                Verification Error
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">
                {message || "The verification link is invalid or has expired."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
              <Link href="/login" className="flex-1">
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest border-white/5 hover:bg-white/5"
                >
                  Return to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/30">
      <Header />
      <main className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />
        </div>

        <div className="relative z-10 w-full flex justify-center">
          <Suspense
            fallback={
              <div className="flex flex-col items-center space-y-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">
                  Verifying...
                </p>
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
