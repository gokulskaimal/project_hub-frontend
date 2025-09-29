'use client'

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store/store";
import { loginUser, setEmail, setPassword } from "@/features/auth/authSlice";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter()
  
  const dispatch = useDispatch<AppDispatch>()
  const { email, password, error ,loading , isLoggedIn , role} = useSelector((state: RootState) => state.auth)

  useEffect(() =>{
    if(isLoggedIn){
      switch(role){
        case 'admin' :
          router.push('/admin/dashboard')
          break;
        case 'manager' :
          router.push('/manager/dashboard')
          break;
        case 'member' :
          router.push('/member/dashboard')
          break;
        default:
          break;
      }
    }
  },[isLoggedIn , role , router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) return
    dispatch(loginUser({ email, password }))

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
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}

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
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
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

              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M23.7 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.6c-.3 1.4-1.2 2.7-2.4 3.5v3h3.9c2.3-2.1 3.6-5.2 3.6-8.6z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-4.9H1.4v3.1C3.4 21.1 7.4 24 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l3.9-3.1z" />
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5C18 1.1 15.2 0 12 0 7.4 0 3.4 2.9 1.4 7.1l3.9 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}