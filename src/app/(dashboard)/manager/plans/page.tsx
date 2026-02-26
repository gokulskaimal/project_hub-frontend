"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import api, { API_ROUTES } from "../../../../utils/api";
import { Plan } from "../../../../types/plan";
import {
  CheckCircle,
  CreditCard,
  RefreshCw,
  Zap,
  Shield,
  Star,
  Rocket,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// ... Razorpay interfaces (Keep existing)
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number; // Required for Standard Checkout display (sometimes) or good practice
  currency: string;
  order_id: string; // Changed back to order_id for One-time payment
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
    entity: string;
    amount: number;
    currency: string;
    plan_id: string;
    status: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ManagerPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to subscribe");
        return;
      }

      const response = await api.post<SubscriptionResponse>(
        "/payments/subscription",
        { planId },
      );

      // Backend now returns an Order object (for One-Time payment)
      // id is now order_id
      const { id: order_id, amount, currency } = response.data.data;

      // Mock Handler for Free Plans or Dev Environment
      if (
        order_id.startsWith("sub_free_") ||
        order_id.startsWith("sub_mock_") ||
        order_id.startsWith("order_free_") ||
        order_id.startsWith("order_mock_")
      ) {
        try {
          await api.post("/payments/verify", {
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_order_id: order_id,
            razorpay_signature: `sig_mock_${Date.now()}`,
            planId: planId,
          });
          toast.success("Plan upgraded successfully!");
          fetchData();
        } catch {
          toast.error("Payment verification failed");
        }
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Required for Orders
        currency: currency,
        order_id: order_id, // Required for Orders
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await api.post("/payments/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId,
              // No subscription_id needed for One-Time
            });
            toast.success("Subscription successful!");
            fetchData();
          } catch {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#2463EB",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch {
      toast.error("Failed to initiate subscription");
    }
  };

  const activePlans = useMemo(() => plans.filter((p) => p.isActive), [plans]);

  const getPlanIcon = (type: string) => {
    switch (type) {
      case "ENTERPRISE":
        return <Rocket className="w-6 h-6 text-orange-600" />;
      case "PRO":
        return <Zap className="w-6 h-6 text-purple-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-600" />;
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case "ENTERPRISE":
        return "bg-orange-50 border-orange-100 ring-orange-100";
      case "PRO":
        return "bg-purple-50 border-purple-100 ring-purple-100";
      default:
        return "bg-blue-50 border-blue-100 ring-blue-100";
    }
  };

  return (
    <DashboardLayout title="Subscription Plans">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Current Status
            </h2>
            <p className="text-xs text-gray-500">
              You are currently on the{" "}
              <span className="font-bold text-blue-600">
                {currentOrg?.subscriptionStatus || "Free"}
              </span>{" "}
              plan
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
            title="Refresh Plans"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 h-96 animate-pulse border border-gray-100"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlans.map((plan) => {
              const isCurrentPlan = currentOrg?.planId === plan.id;
              const colorClass = getPlanColor(plan.type);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border transition-all duration-300 flex flex-col ${isCurrentPlan ? `border-blue-500 ring-2 ring-blue-100 shadow-lg scale-[1.02] z-10` : "border-gray-200 hover:shadow-xl hover:-translate-y-1"}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                      CURRENT PLAN
                    </div>
                  )}

                  <div className="p-6 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}
                    >
                      {getPlanIcon(plan.type)}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 min-h-[40px]">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.currency} {plan.price}
                      </span>
                      <span className="text-gray-500 font-medium">/month</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-green-600">
                            <CheckCircle size={12} />
                          </div>
                          <span className="text-sm text-gray-600 leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    {(() => {
                      if (isCurrentPlan) {
                        return (
                          <button
                            disabled
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all bg-gray-100 text-gray-400 cursor-not-allowed"
                          >
                            Active Plan
                          </button>
                        );
                      }

                      const currentPlanPrice = currentOrg?.planId
                        ? plans.find((p) => p.id === currentOrg.planId)
                            ?.price || 0
                        : 0;

                      const isDowngrade = plan.price < currentPlanPrice;

                      return (
                        <button
                          onClick={() => handleSubscribe(plan.id)}
                          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-xl ${
                            isDowngrade
                              ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          }`}
                        >
                          {isDowngrade
                            ? `Downgrade to ${plan.name}`
                            : `Upgrade to ${plan.name}`}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
