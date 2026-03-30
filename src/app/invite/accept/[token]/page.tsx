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

export default function AcceptInvitePage() {
  const { token: routeToken } = useParams<{ token: string }>();
  const [inviteToken] = useState(routeToken);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Mask the sensitive token in the URL bar immediately
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
    // When accepting invite via Google, pass the invite token
    // Backend will validate token and create user as TEAM_MEMBER
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
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
        <section className="relative overflow-hidden  bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#2463EB]/25 to-[#2463EB]/0 blur-[32px]" />
            <div className="absolute top-0 right-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#8D65F1]/25 to-[#8D65F1]/0 blur-[32px]" />
          </div>

          <div className="container max-w-[1400px] mx-auto px-8 py-24">
            <div className="flex items-start gap-12 justify-center">
              <div className="flex-1 max-w-md">
                <h1 className="text-3xl font-bold mb-2">Accept Invitation</h1>
                <p className="text-gray-600 text-sm mb-6">
                  Set your details to complete your account.
                </p>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full h-10 px-4 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    className="w-full h-10 rounded-xl bg-[#2463EB] text-white text-sm font-medium hover:bg-[#2463EB]/90"
                    onClick={onSubmit}
                    disabled={
                      loading ||
                      !firstName ||
                      !lastName ||
                      !password ||
                      !confirmPassword
                    }
                  >
                    {loading ? "Submitting..." : "Complete Setup"}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSignIn}
                      onError={() => {
                        notifier.error(
                          null,
                          MESSAGES.AUTH.GOOGLE_SIGNIN_FAILED,
                        );
                      }}
                      text="signup_with"
                    />
                  </div>

                  <p className="text-xs text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-[#2463EB] hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
