"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import api, { API_ROUTES } from "../../../utils/api";
import { Plan } from "../../../types/plan";
import { CheckCircle, CreditCard, RefreshCw, Zap } from "lucide-react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentOrg, setCurrentOrg] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, orgRes] = await Promise.all([
        api.get(API_ROUTES.MANAGER.PLANS),
        api.get(API_ROUTES.MANAGER.ORGANIZATION),
      ]);
      setPlans(plansRes.data.data);
      setCurrentOrg(orgRes.data.data);
    } catch (error) {
      toast.error("Failed to fetch plans or subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to subscribe');
        return;
      }

      const response = await api.post<SubscriptionResponse>(
        '/payments/subscription',
        { planId },
      );

      const { id: subscription_id, key_id } = response.data.data;

      if (subscription_id.startsWith("sub_free_") || subscription_id.startsWith("sub_mock_")) {
        // Bypass Razorpay for free/mock plans
        try {
          await api.post(
            '/payments/verify',
            {
              razorpay_payment_id: `pay_mock_${Date.now()}`,
              razorpay_order_id: `order_mock_${Date.now()}`,
              razorpay_signature: `sig_mock_${Date.now()}`,
              razorpay_subscription_id: subscription_id
            },
          );
          toast.success('Subscription successful!');
          fetchData();
        } catch {
          toast.error('Payment verification failed');
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
              },
            );
            toast.success('Subscription successful!');
            fetchData(); // Refresh data
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

  // Filter only active plans
  const activePlans = useMemo(() => plans.filter(p => p.isActive), [plans]);

  return (
    <div className="p-8 text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your organization's subscription</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-600">
              No active plans available at the moment.
            </div>
          ) : (
            activePlans.map((plan) => {
              const isCurrentPlan = currentOrg?.planId === plan.id;
              
              return (
                <div 
                  key={plan.id} 
                  className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 ${
                    isCurrentPlan 
                      ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      {isCurrentPlan && (
                        <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit mt-1 bg-blue-100 text-blue-800 font-medium">
                          <CheckCircle size={12} />
                          Current Plan
                        </span>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${plan.type === 'PRO' ? 'bg-purple-50 text-purple-600' : plan.type === 'ENTERPRISE' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'}`}>
                      {plan.type === 'PRO' ? <Zap size={20} /> : <CreditCard size={20} />}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="text-3xl font-bold mb-6 text-gray-900">
                    {plan.currency} {plan.price}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>

                  <button
                    onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                    }`}
                  >
                    {isCurrentPlan ? 'Active' : 'Upgrade Plan'}
                  </button>

                  <div className="space-y-3 pt-6 mt-6 border-t border-gray-100">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
