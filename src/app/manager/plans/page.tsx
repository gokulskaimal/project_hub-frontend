"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { API_ROUTES } from "../../../utils/api";
import { Plan } from "../../../types/plan";
import axios from "axios";

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

export default function ManagerPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get(API_ROUTES.MANAGER.PLANS);
      // The public API returns { success: true, data: [...] }
      // The Admin API returns { success: true, message: "...", data: [...] }
      // Let's handle both or assume consistent structure.
      // Based on AdminController.getPlans, it uses sendSuccess which wraps in data.
      // The public route uses AdminController.getPlans too.
      setPlans(response.data.data);
    } catch (error) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await api.post<SubscriptionResponse>(
        '/payments/subscription',
        { planId }
      );

      const { id: subscription_id, key_id } = response.data.data;

      // MOCK FLOW: If subscription ID is a mock, bypass Razorpay modal
      if (subscription_id.startsWith("sub_mock_")) {
        console.log("Mock Subscription detected, bypassing Razorpay modal...");
        try {
            await api.post(
                '/payments/verify',
                {
                    razorpay_payment_id: `pay_mock_${Date.now()}`,
                    razorpay_order_id: subscription_id, 
                    razorpay_signature: `sig_mock_${Date.now()}`,
                    razorpay_subscription_id: subscription_id
                }
            );
            toast.success('Subscription successful! (Mock Mode)');
        } catch (error) {
            console.error("Mock verification failed", error);
            toast.error('Payment verification failed (Mock)');
        }
        return;
      }

      const options: RazorpayOptions = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await api.post(
              '/payments/verify',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_subscription_id: response.razorpay_subscription_id
              }
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

  if (loading) return <div className="p-8">Loading plans...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Available Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <span className="text-3xl font-bold text-gray-900">
                {plan.currency} {plan.price}
              </span>
              <span className="text-sm text-gray-600">/mo</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-gray-900">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  {feature}
                </li>
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
  );
}
