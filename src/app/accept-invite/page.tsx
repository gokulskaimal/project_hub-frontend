"use client"

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { z } from 'zod'
import { AppDispatch } from '@/store/store'
import { acceptInvite } from '@/features/auth/authSlice'
import { toast } from 'react-hot-toast'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

// 1. Define Schema outside the component scope for efficiency
const acceptInviteSchema = z.object({
  token: z.string().min(10, 'Invalid invite token'),
  firstName: z.string().min(2, 'First name too short'),
  lastName: z.string().min(2, 'Last name too short'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { 
  message: 'Passwords do not match', 
  path: ['confirmPassword'] 
});


export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // 2. Use local state for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper for local input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    const fullPayload = { 
      token, 
      ...formData, 
      confirmPassword 
    };

    const parsed = acceptInviteSchema.safeParse(fullPayload);
    
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      await dispatch(acceptInvite(parsed.data)).unwrap();
      toast.success('Invitation accepted. You can now sign in.');
      router.push('/login');
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : 'Failed to accept invitation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.password && (formData.password === confirmPassword);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
        <section className="relative overflow-hidden  bg-gradient-to-b from-[#F8FAFC] to-[#EBEFF5]">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#2463EB]/25 to-[#2463EB]/0 blur-[32px]" />
            <div className="absolute top-0 right-0 h-[512px] w-[512px] rounded-full bg-gradient-to-br from-[#8D65F1]/25 to-[#8D65F1]/0 blur-[32px]" />
          </div>

          <div className="container max-w-[1400px] mx-auto px-8 py-24">
            <div className="flex items-start gap-12 justify-center">
              <div className="flex-1 max-w-md">
                <h1 className="text-3xl font-bold mb-2">Accept Invitation</h1>
                <p className="text-gray-600 text-sm mb-6">Set your details to complete your account and join the team.</p>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password (Min 8 chars)"
                    className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full h-10 px-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2463EB] focus:border-transparent"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  
                  <button
                    className={`w-full h-10 rounded-lg text-white text-sm font-medium transition-colors ${
                      isFormValid && !loading ? 'bg-[#2463EB] hover:bg-[#2463EB]/90' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={onSubmit}
                    disabled={!isFormValid || loading}
                  >
                    {loading ? 'Submitting...' : 'Complete Setup'}
                  </button>
                  
                  <p className="text-xs text-gray-600 pt-2">
                    Already have an account? <Link href="/login" className="text-[#2463EB] hover:underline">Sign in</Link>
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