"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { AppDispatch } from "@/store/store";
import {
  useAcceptInviteMutation,
  useGoogleSignInMutation,
} from "@/store/api/authApiSlice";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserCheck, ShieldPlus, ArrowRight } from "lucide-react";

export default function AcceptInvitePage() {
  const { token: routeToken } = useParams<{ token: string }>();
  const [inviteToken] = useState(routeToken);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (inviteToken) {
      window.history.replaceState({}, "", "/invite/accept/active");
    }
  }, [inviteToken]);

  const [acceptInviteMutation, { isLoading: acceptLoading }] =
    useAcceptInviteMutation();
  const [googleSignInMutation, { isLoading: googleLoading }] =
    useGoogleSignInMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loading = acceptLoading || googleLoading;

  const schema = useMemo(
    () =>
      z
        .object({
          token: z.string().min(10, "Invalid invite token"),
          firstName: z.string().min(2, "First name too short"),
          lastName: z.string().min(2, "Last name too short"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        }),
    [],
  );

  const onSubmit = async () => {
    const parsed = schema.safeParse({
      token: inviteToken,
      firstName,
      lastName,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      notifier.error(
        null,
        parsed.error.errors[0]?.message ?? MESSAGES.VALIDATION.INVALID_INPUT,
      );
      return;
    }

    try {
      await acceptInviteMutation({
        token: inviteToken,
        firstName,
        lastName,
        password,
        confirmPassword,
      }).unwrap();
      notifier.success(MESSAGES.TEAM.INVITE_ACCEPTED);
      router.push("/login");
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.TEAM.INVITE_ACCEPT_FAILED);
    }
  };

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      notifier.error(null, MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED);
      return;
    }
    try {
      await googleSignInMutation({
        idToken: credential,
        inviteToken: inviteToken,
      }).unwrap();
      notifier.success(MESSAGES.TEAM.INVITE_ACCEPTED);
      router.push("/login");
    } catch (err: unknown) {
      notifier.error(err, MESSAGES.TEAM.GOOGLE_INVITE_FAILED);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background selection:bg-primary/30">
      <Header />
      <main className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Animated Background System */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card !p-10 border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3rem]">
              <div className="mb-10 text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.15)] text-primary">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tighter italic mb-2">
                  Accept invite
                </h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60 leading-relaxed italic">
                  Configure your node credentials <br />
                  to join the collective matrix.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="FIRST NAME"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className="bg-background/40 border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-wider"
                  />
                  <Input
                    type="text"
                    placeholder="LAST NAME"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    className="bg-background/40 border-white/5 h-12 rounded-xl text-[10px] font-black uppercase tracking-wider"
                  />
                </div>
                <Input
                  type="password"
                  placeholder="ACCESS KEY (PASSWORD)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                  leftIcon={<ShieldPlus className="w-4 h-4 text-primary" />}
                />
                <Input
                  type="password"
                  placeholder="VERIFY ACCESS KEY"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="bg-background/40 border-white/5 h-14 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                />

                <Button
                  fullWidth
                  onClick={onSubmit}
                  disabled={
                    loading ||
                    !firstName ||
                    !lastName ||
                    !password ||
                    !confirmPassword
                  }
                  isLoading={loading}
                  className="h-14 mt-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
                >
                  {loading ? "INITIALIZING..." : "JOIN COLLECTIVE"}
                </Button>

                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                    OR AUTO-SYNC
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
                    text="signup_with"
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                    Already an active node?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:brightness-125 transition-all"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
