"use client";

import {
  Users,
  Building2,
  Banknote,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import {
  useGetAdminReportsQuery,
  useGetAdminInvoicesQuery,
  useGetAdminAnalyticsQuery,
} from "@/store/api/adminApiSlice";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import { RoleBanner } from "@/components/ui/RoleBanner";
import {
  AnalyticsFilter,
  TimeFrame,
} from "@/components/analytics/AnalyticsFilter";
import {
  AnalyticsBarChart,
  StatusDistribution,
} from "@/components/analytics/AnalyticsCharts";
import {
  mapRevenueData,
  mapStatusDistribution,
  mapPlanDistribution,
} from "@/utils/analyticsUtils";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("YEAR");
  const { data: reportsData, isLoading: reportsLoading } =
    useGetAdminReportsQuery();
  const { data: invoicesData, isLoading: invoicesLoading } =
    useGetAdminInvoicesQuery({
      limit: 1,
      page: 1,
    });
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetAdminAnalyticsQuery(timeframe);

  const loading = reportsLoading || invoicesLoading || analyticsLoading;

  const revenueData = mapRevenueData(analyticsData?.revenue);
  const orgData = mapStatusDistribution(
    analyticsData?.organizations?.distribution,
  );
  const planData = mapPlanDistribution(analyticsData?.plans);

  if (loading) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="p-6 space-y-10">
          <div className="h-48 bg-secondary/30 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-secondary/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-10 pb-12"
      >
        {/* Welcome Banner */}
        <motion.div variants={item}>
          <RoleBanner
            roleName="Super Admin"
            badgeText="Admin"
            welcomeMessage={
              <>
                Admin <span className="text-white">Dashboard</span>
              </>
            }
            description={
              <>
                Managing{" "}
                <span className="text-white border-b border-white/30 pb-0.5">
                  {reportsData?.overview.totalOrganizations || 0} organizations
                </span>{" "}
                on the entire system.
              </>
            }
            gradientFrom="#6366F1"
            gradientTo="#8B5CF6"
          />
        </motion.div>

        {/* Status Section */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              Stats
            </h2>
            <div className="flex items-center gap-4">
              <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                  Online
                </span>
              </div>
            </div>
          </div>

          <PremiumStatGrid
            items={[
              {
                label: "Total Accounts",
                value:
                  (reportsData?.overview.totalUsers || 0) +
                  (reportsData?.overview.totalOrganizations || 0),
                icon: ShieldCheck,
                color: "blue",
              },
              {
                label: "Active Users",
                value: reportsData?.users.active || 0,
                icon: Users,
                color: "emerald",
              },
              {
                label: "Active Organizations",
                value: reportsData?.organizations.active || 0,
                icon: Building2,
                color: "violet",
              },
              {
                label: "Active Now (%)",
                value: `${Math.round((((reportsData?.users.active || 0) + (reportsData?.organizations.active || 0)) / ((reportsData?.overview.totalUsers || 0) + (reportsData?.overview.totalOrganizations || 0) || 1)) * 100)}%`,
                icon: Activity,
                color: "blue",
              },
            ]}
          />
        </motion.div>

        {/* Visual Analytics */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                  Revenue
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  Revenue over time
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="h-[320px]">
              {analyticsError ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    No Data Found
                  </p>
                </div>
              ) : (
                <AnalyticsBarChart
                  data={revenueData}
                  dataKey="value"
                  xKey="name"
                  color="var(--primary)"
                />
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Org Distribution */}
            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-6">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">
                  Organization Status
                </h3>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                  How many are active
                </p>
              </div>
              <div className="h-[280px]">
                <StatusDistribution data={orgData} />
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-6">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">
                  Plans
                </h3>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">
                  Which plans are used
                </p>
              </div>
              <div className="h-[280px]">
                <StatusDistribution data={planData} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial Oversight Detail */}
        <motion.div variants={item} className="space-y-6">
          <h2 className="text-xl font-black text-foreground tracking-tight px-1 flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Banknote className="w-5 h-5 text-emerald-500" />
            </div>
            Financial Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Revenue
              </span>
              <h4 className="text-2xl font-black text-foreground mt-1">
                ₹{(invoicesData?.totalRevenue || 0).toLocaleString()}
              </h4>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Invoices
              </span>
              <h4 className="text-2xl font-black text-foreground mt-1">
                {invoicesData?.total || 0}
              </h4>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Users
              </span>
              <h4 className="text-2xl font-black text-foreground mt-1">
                {reportsData?.overview.totalUsers || 0}
              </h4>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Organizations
              </span>
              <h4 className="text-2xl font-black text-foreground mt-1">
                {reportsData?.overview.totalOrganizations || 0}
              </h4>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
