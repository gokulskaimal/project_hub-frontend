"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import api, { API_ROUTES } from "@/utils/api";
import { Plan } from "../../types/plan";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";

interface SubscriptionResponse {
  success: boolean;
  data: {
    id: string;
    key_id: string;
  };
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
        const response = await api.get<ApiResponse<Plan[]>>(
          API_ROUTES.PLANS.GET_ALL,
        );
        // Sort plans by price
        const sortedPlans = [...response.data.data].sort(
          (a, b) => a.price - b.price,
        );
        setPlans(sortedPlans);
      } catch (error) {
        console.error("Error loading plans:", error);
        notifier.error(error, "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { id: subscription_id, key_id } = response.data.data;

      const options: RazorpayOptions = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription_id,
        name: "Project Hub",
        description: "Subscription",
        handler: async function (response: RazorpayResponse) {
          try {
            await api.post(
              API_ROUTES.PAYMENTS.VERIFY,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_subscription_id: response.razorpay_subscription_id,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            notifier.success(MESSAGES.AUTH.PLAN_UPGRADE_SUCCESS);
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

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
          Loading plans...
        </p>
      </div>
    );
  }

  return (
    <section
      id="pricing"
      className="py-24 relative overflow-hidden bg-background"
    >
      <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mb-4 opacity-70 italic">
            Pricing
          </div>
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">
            Our Plans
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
            Choose the best plan for your team. Powerful features for any team
            size.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            // Only highlight the middle plan or the most expensive one if 3 plans exist
            const isFeatured =
              plans.length === 3 ? index === 1 : plan.type === "PRO";

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-[2.5rem] border transition-all duration-500 relative group p-1 ${
                  isFeatured
                    ? "border-primary bg-primary/5 shadow-[0_40px_100px_-20px_rgba(var(--primary),0.3)] scale-[1.05] z-10"
                    : "border-white/5 bg-card/40 backdrop-blur-xl hover:border-white/10 shadow-2xl"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-5 py-2 bg-primary rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-primary/40">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-10 flex-1 flex flex-col">
                  <div className="mb-10">
                    <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic mb-4">
                      {plan.name}
                    </h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-40 leading-relaxed italic">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-12 flex items-baseline gap-2">
                    <span className="text-6xl font-black text-foreground tracking-tighter italic">
                      {plan.price}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                        {plan.currency}
                      </span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                        / MO
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 mb-12 flex-1">
                    <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.4em] mb-4">
                      What&apos;s Included
                    </p>
                    {plan.features.map((feature, fIndex) => (
                      <div
                        key={fIndex}
                        className="flex items-center gap-4 group/feat"
                      >
                        <div
                          className={`p-1.5 rounded-full ${isFeatured ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"}`}
                        >
                          <CheckCircle
                            size={12}
                            className="group-hover/feat:scale-125 transition-transform"
                          />
                        </div>
                        <span className="text-[11px] font-black text-muted-foreground group-hover/feat:text-foreground transition-colors uppercase tracking-tight opacity-70">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group/btn ${
                      isFeatured
                        ? "bg-primary text-white shadow-2xl shadow-primary/30"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-white/5 shadow-xl"
                    }`}
                  >
                    <span className="relative z-10">
                      {plan.price === 0 ? "Get Started" : "Choose Plan"}
                    </span>
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
