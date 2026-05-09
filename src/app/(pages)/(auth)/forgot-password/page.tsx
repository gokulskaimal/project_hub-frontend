"use client";

import { useState } from "react";
import Link from "next/link";
import { notifier } from "@/utils/notifier";
import { useRequestPasswordResetMutation } from "@/store/api/authApiSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, ArrowLeft, ShieldQuestion } from "lucide-react";
import { motion } from "framer-motion";

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
    } catch (err: unknown) {
      notifier.error(err, "Failed to send reset link. Please try again.");
    }
  };

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
                  <ShieldQuestion className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic mb-3">
                  Logic Reset
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed">
                  {isSubmitted
                    ? "Check primary signal channel for decryption link."
                    : "Initialize recovery sequence for your neural node."}
                </p>
              </div>

              {!isSubmitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="space-y-4">
                    <Input
                      type="email"
                      placeholder="OPERATIVE IDENTIFIER (EMAIL)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                      leftIcon={<Mail className="h-4 w-4 text-primary" />}
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={isLoading}
                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Send Recovery Signal
                  </Button>
                </form>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                    <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest leading-relaxed">
                      If node exists for {email}, <br />
                      recovery sequence has been broadcast.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setIsSubmitted(false)}
                    className="h-12 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:bg-white/5"
                  >
                    No signal received? Retry
                  </Button>
                </div>
              )}

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
