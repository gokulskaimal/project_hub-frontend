'use client'

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

// Components
import Footer from "@/components/Footer";
import Header from "@/components/Header";

// Redux
import { RootState, AppDispatch } from "@/store/store";
import { loginUser, googleSignIn } from "@/features/auth/authSlice";
import Link from "next/link";

// Define schema outside component
const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters')
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Local state for form inputs (Performance Optimization)
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  const { error, loading, isLoggedIn, role, accessToken } = useSelector((state: RootState) => state.auth);

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  // Handle local input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Error/Redirect effects remain
  useEffect(() => {
    if (error && error !== "Organization Name Required") {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoggedIn || !role) return;

    if (accessToken) {
      try {
        localStorage.setItem('accessToken', accessToken);
        // Note: For Middleware security, your backend MUST also set a 'role' cookie.
      } catch {}
    }

    const normalizedRole = role.toLowerCase().replace(/[\s_]+/g, '-');

    switch (normalizedRole) {
      case 'super-admin':
        router.push('/super-admin/dashboard');
        break;
      case 'org-manager':
      case 'manager':
        router.push('/manager/dashboard');
        break;
      case 'team-member':
      case 'member':
        router.push('/member/dashboard');
        break;
      default:
        router.push('/');
        break;
    }
  }, [isLoggedIn, role, accessToken, router]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse(formData);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }
    // Dispatch login using local state data
    dispatch(loginUser(parsed.data));
  };

  const handleGoogleSignIn = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) {
      toast.error("Google sign-in failed: No credential");
      return;
    }
    try {
      await dispatch(googleSignIn({ idToken: credential })).unwrap();
      toast.success("Signed in successfully!");
    } catch (err: unknown) {
      const errorMessage = (err as Record<string, unknown>)?.message || (typeof err === "string" ? err : "Unknown error");
      
      console.log("DEBUG: Google Sign-In Error", { err, errorMessage, type: typeof errorMessage, match: errorMessage === "Organization Name Required" });

      if (errorMessage === "Organization Name Required") {
        toast("Please enter your Organization Name to complete signup", { icon: "🏢" });
        setPendingIdToken(credential);
        setShowOrgModal(true);
        return;
      }
      toast.error(typeof errorMessage === "string" ? errorMessage : "Google sign-in failed");
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !pendingIdToken) return;

    try {
      await dispatch(googleSignIn({ idToken: pendingIdToken, orgName })).unwrap();
      setShowOrgModal(false);
      setPendingIdToken(null);
      setOrgName("");
      toast.success("Account created and you are now signed in!");
    } catch (err) {
      const message = typeof err === "string" ? err : "Failed to complete signup";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        {/* ... (UI unchanged) ... */}
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
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
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
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`mb-6 w-full rounded-lg py-2.5 text-sm font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mb-6 flex items-center justify-between">
                <Link className="text-sm text-blue-600 hover:text-blue-700" href="/reset-password">Forgot password?</Link>
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
                  onError={() => toast.error("Google sign-in failed. Please try email/password or refresh the page.")}
                  text="signin_with"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Organization Name Modal */}
        {showOrgModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Create Organization</h2>
              <p className="mb-4 text-sm text-gray-600">To complete your signup as a Manager, please enter your Organization Name.</p>
              <form onSubmit={handleOrgSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Acme Corp"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowOrgModal(false); setPendingIdToken(null); }}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Complete Signup"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}