"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MESSAGES } from "../../../../constants/messages";
import { notifier } from "../../../../utils/notifier";
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
  Layout,
  Target,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";

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

import {
  useGetManagerPlansQuery,
  useGetManagerOrganizationQuery,
} from "@/store/api/managerApiSlice";

export default function ManagerPlansPage() {
  const {
    data: plans = [],
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useGetManagerPlansQuery();
  const {
    data: currentOrg,
    isLoading: orgLoading,
    refetch: refetchOrg,
  } = useGetManagerOrganizationQuery();

  const loading = plansLoading || orgLoading;

  const fetchData = () => {
    refetchPlans();
    refetchOrg();
  };

  const activePlans = useMemo(
    () => plans.filter((p: Plan) => p.isActive),
    [plans],
  );

  // Stats Logic
  const stats = useMemo(() => {
    return {
      currentPlan: currentOrg?.subscriptionStatus || "Free",
      planCount: activePlans.length,
      isPremium: (currentOrg?.subscriptionStatus || "Free") !== "Free",
      orgName: currentOrg?.name || "Organization",
    };
  }, [currentOrg, activePlans]);

  const handleSubscribe = async (planId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        notifier.error(null, MESSAGES.AUTH.LOGIN_REQUIRED_SUBSCRIPTION);
        return;
      }

      const response = await api.post<SubscriptionResponse>(
        API_ROUTES.PAYMENTS.SUBSCRIPTION,
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
          await api.post(API_ROUTES.PAYMENTS.VERIFY, {
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_order_id: order_id,
            razorpay_signature: `sig_mock_${Date.now()}`,
            planId: planId,
          });
          notifier.success(MESSAGES.AUTH.PLAN_UPGRADE_SUCCESS);
          fetchData();
        } catch {
          notifier.error(null, MESSAGES.AUTH.PAYMENT_VERIFY_FAILED);
        }
        return;
      }

      const options: RazorpayOptions & { subscription_id?: string } = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount, // Required for Orders
        currency: currency,
        order_id: order_id, // Required for Orders
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await api.post(API_ROUTES.PAYMENTS.VERIFY, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId,
              // No subscription_id needed for One-Time
            });
            notifier.success(MESSAGES.AUTH.PLAN_UPGRADE_SUCCESS);
            fetchData();
          } catch {
            notifier.error(null, MESSAGES.AUTH.PAYMENT_VERIFY_FAILED);
          }
        },
        theme: {
          color: "#2463EB",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch {
      notifier.error(null, MESSAGES.AUTH.PAYMENT_INIT_FAILED);
    }
  };

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
      <div className="space-y-8">
        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Plan Analytics
          </h2>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Live Sync
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Current Plan"
            value={stats.currentPlan}
            icon={Zap}
            color="blue"
          />
          <StatCard
            label="Tier Status"
            value={stats.isPremium ? "Premium" : "Standard"}
            icon={Shield}
            color={stats.isPremium ? "purple" : "blue"}
          />
          <StatCard
            label="Available Plans"
            value={stats.planCount}
            icon={Target}
            color="green"
          />
          <StatCard
            label="Org Status"
            value="Active"
            icon={Activity}
            color="blue"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i: number) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 h-96 animate-pulse border border-gray-100"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlans.map((plan: Plan) => {
              const isCurrentPlan = currentOrg?.planId === plan.id;
              const colorClass = getPlanColor(plan.type);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border transition-all duration-300 flex flex-col ${isCurrentPlan ? `border-blue-500 ring-2 ring-blue-100 shadow-lg scale-[1.02] z-10` : "border-gray-200 hover:shadow-xl hover:-translate-y-1"}`}
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
                      {plan.features.map((feature: string, i: number) => (
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
                        ? plans.find((p: Plan) => p.id === currentOrg.planId)
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
