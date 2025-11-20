/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store/store";
import { loginUser, setEmail, setPassword, googleSignIn } from "@/features/auth/authSlice";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function LoginPage() {

  const router = useRouter()
  
  const dispatch = useDispatch<AppDispatch>()
  const { email, password, error ,loading , isLoggedIn , role, accessToken } = useSelector((state: RootState) => state.auth)

  const loginSchema = useMemo(() => z.object({
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters')
  }), [])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (!isLoggedIn || !role) return

    if (accessToken) {
      try {
        localStorage.setItem('accessToken', accessToken)
      } catch {}
    }

  // normalize role by lowercasing and replacing spaces/underscores with hyphens
  const normalizedRole = role.toLowerCase().replace(/[\s_]+/g, '-')

    switch (normalizedRole) {
      case 'super-admin':
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'org-manager':
      case 'manager':
        router.push('/manager/dashboard')
        break
      case 'team-member':
      case 'member':
        router.push('/member/dashboard')
        break
      default:
        break
    }
  }, [isLoggedIn, role, accessToken, router])


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input')
      return
    }
    dispatch(loginUser(parsed.data))

  }

  const handleGoogleSignIn = (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse
    if (!credential) {
      toast.error("Google sign-in failed")
      return
    }
    dispatch(googleSignIn({ idToken: credential }))
  }





  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Header />

      <main
        className="relative flex-1 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(84.09%_62.5%_at_0%_0%,rgba(36,99,235,0.25)_0%,rgba(36,99,235,0)_60%),radial-gradient(84.09%_62.5%_at_100%_0%,rgba(119,80,226,0.25)_0%,rgba(119,80,226,0)_60%),linear-gradient(180deg,#F8FAFC_0%,#EBEFF5_100%)]" />
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[linear-gradient(135deg,rgba(36,99,235,0.25)_0%,rgba(119,80,226,0.25)_100%)] blur-[32px]" />
        <div className="relative flex min-h-full items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-8 text-center">
                <h1 className="mb-1 text-2xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-sm text-gray-600">Sign in to continue to Project Hub</p>
              </div>

              <form onSubmit={handleSubmit} className="mb-2 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    onChange={(e) => dispatch(setEmail(e.target.value))}
                    value={email}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <input
                    onChange={(e) => dispatch(setPassword(e.target.value))}
                    value={password}
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <></>
                <button
                  type="submit"
                  disabled={loading}
                  className={`mb-6 w-full rounded-lg py-2.5 text-sm font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mb-6 flex items-center justify-between">
                <Link className="text-sm text-blue-600 hover:text-blue-700" href="/forgot">Forgot password?</Link>
                <Link className="text-sm text-gray-600 hover:text-gray-900" href="/signup">Create account</Link>
              </div>


              <div className="mb-6 flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs text-gray-500">Or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSignIn}
                  onError={() => toast.error("Google sign-in failed")}
                  useOneTap
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}