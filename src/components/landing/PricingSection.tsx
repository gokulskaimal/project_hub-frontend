"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plan } from '../../types/plan';
import { toast } from 'react-hot-toast';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayOptions {
  key: string | undefined;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  theme: {
    color: string;
  };
}

interface SubscriptionResponse {
  success: boolean;
  data: {
    id: string;
    key_id: string;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export default function PricingSection() {

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get<ApiResponse<Plan[]>>('/api/plans');
        setPlans(response.data.data);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to subscribe');
        return;
      }

      const response = await axios.post<SubscriptionResponse>(
        '/api/payments/subscription',
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: subscription_id, key_id } = response.data.data;

      const options: RazorpayOptions = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await axios.post(
              '/api/payments/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_subscription_id: response.razorpay_subscription_id
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Subscription successful!');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: {
          color: "#2463EB",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch {
      toast.error('Failed to initiate subscription');
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading plans...</div>;
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container max-w-[1400px] mx-auto px-8">
        <div className="text-center mb-8">
          <div className="text-sm font-semibold text-[#2463EB] tracking-wider uppercase mb-2">Subscriptions</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose a plan that grows with your team.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border ${plan.type === 'PRO' ? 'border-2 border-[#2463EB] shadow-lg relative' : 'border-gray-200 shadow-sm'} bg-white p-6`}>
              {plan.type === 'PRO' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-[#326DEC] to-[#8D65F1] px-3 py-1 text-xs font-medium text-white shadow-lg">Most popular</span>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="text-sm text-gray-600">/{plan.currency.toLowerCase()}/mo</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-gray-900">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button 
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full rounded-lg py-3 text-sm font-medium ${plan.type === 'PRO' ? 'bg-gradient-to-r from-[#326DEC] to-[#8D65F1] text-white shadow-lg hover:shadow-xl' : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'}`}
              >
                {plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}