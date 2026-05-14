"use client";

import React, { useMemo } from "react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import api, { API_ROUTES } from "@/utils/api";
import { Plan } from "@/types/plan";
import {
  CheckCircle,
  Zap,
  Shield,
  Star,
  Rocket,
  Layout,
  Target,
  Activity,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";

// ... Razorpay interfaces (Keep existing)
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  order_id: string;
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

      const { id: order_id, amount, currency } = response.data.data;

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
        amount: amount,
        currency: currency,
        order_id: order_id,
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await api.post(API_ROUTES.PAYMENTS.VERIFY, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planId: planId,
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
        return <Rocket className="w-6 h-6" />;
      case "PRO":
        return <Zap className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  return (
    <DashboardLayout title="Subscription Plans">
      <div className="space-y-12">
        {/* Cinematic Header System */}
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter italic flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              Choose a Plan
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              View all available subscription plans
            </p>
          </div>
          <div className="flex items-center gap-4 px-4 py-2 bg-secondary/10 border border-white/5 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              Online
            </span>
          </div>
        </div>

        {/* Stats Grid - Standardized to Midnight Slate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="My Plan"
            value={stats.currentPlan}
            icon={Zap}
            color="blue"
          />
          <StatCard
            label="Level"
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
            label="System"
            value="Online"
            icon={Activity}
            color="blue"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i: number) => (
              <div
                key={i}
                className="bg-card/30 rounded-[2.5rem] h-[500px] animate-pulse border border-white/5 shadow-2xl shadow-black/20"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative pb-20">
            {activePlans.map((plan: Plan) => {
              const isCurrentPlan = currentOrg?.planId === plan.id;
              const isPro = plan.type === "PRO";
              const isEnterprise = plan.type === "ENTERPRISE";

              return (
                <div
                  key={plan.id}
                  className={`relative group bg-card rounded-[3rem] border transition-all duration-500 flex flex-col overflow-hidden ${
                    isCurrentPlan
                      ? "border-primary shadow-[0_30px_70px_-20px_rgba(var(--primary),0.2)] scale-[1.03] z-20"
                      : "border-white/5 hover:border-white/10 shadow-2xl shadow-black/40 hover:-translate-y-2"
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {isPro && (
                    <div className="absolute -left-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                  )}

                  <div className="p-10 flex-1 relative z-10">
                    <div
                      className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border transition-all duration-500 ${
                        isPro
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : isEnterprise
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-secondary/10 border-white/10 text-muted-foreground"
                      }`}
                    >
                      {getPlanIcon(plan.type)}
                    </div>

                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic mb-3">
                      {plan.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-10 opacity-70 leading-relaxed min-h-[48px]">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-2 mb-10">
                      <span className="text-5xl font-black text-foreground tracking-tighter">
                        {plan.price}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {plan.currency}
                        </span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          / Month
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-10">
                      <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] mb-2">
                        Features
                      </p>
                      {plan.features.map((feature: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-4 group/feature"
                        >
                          <div
                            className={`mt-1 p-1 rounded-full transition-colors ${isCurrentPlan ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"}`}
                          >
                            <CheckCircle
                              size={10}
                              className="group-hover/feature:scale-110 transition-transform"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground group-hover/feature:text-foreground transition-colors leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-10 pt-0 relative z-10">
                    {(() => {
                      if (isCurrentPlan) {
                        return (
                          <div className="w-full py-5 rounded-[1.5rem] bg-secondary/10 border border-white/5 flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                              Active
                            </span>
                          </div>
                        );
                      }

                      const currentPlanPrice =
                        (currentOrg?.metadata?.planPrice as number) || 0;
                      const isUpgrade = plan.price > currentPlanPrice;

                      return (
                        <Button
                          onClick={() => handleSubscribe(plan.id)}
                          fullWidth
                          className={`h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all overflow-hidden relative group/btn ${
                            isUpgrade
                              ? "bg-primary text-white shadow-2xl shadow-primary/30"
                              : "bg-secondary text-foreground hover:bg-secondary/80 border border-white/5 shadow-xl shadow-black/20"
                          }`}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {isUpgrade ? (
                              <Zap className="w-4 h-4" />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                            {isUpgrade
                              ? `Upgrade to ${plan.name}`
                              : `Change to ${plan.name}`}
                          </span>
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </Button>
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
