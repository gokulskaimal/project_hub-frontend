"use client";

import {
  Users,
  Building2,
  ReceiptText,
  Banknote,
  Activity,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import {
  useGetAdminReportsQuery,
  useGetAdminInvoicesQuery,
  useGetAdminAnalyticsQuery,
} from "@/store/api/adminApiSlice";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import { StatCard } from "@/components/ui/StatCard";
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

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="p-6 space-y-10">
        {/* Welcome Banner */}
        <RoleBanner
          roleName="Super Admin"
          badgeText="System Authority"
          welcomeMessage={
            <>
              Welcome, <span className="text-blue-400">Admin</span>
            </>
          }
          description={
            <>
              You have full oversight of{" "}
              <span className="text-white font-bold">
                {reportsData?.overview.totalOrganizations || 0} organizations
              </span>{" "}
              and{" "}
              <span className="text-white font-bold">
                {reportsData?.overview.totalUsers || 0} users
              </span>
              . Monitor system health and manage global configurations below.
            </>
          }
          gradientFrom="#3B82F6"
          gradientTo="#6366F1"
        />

        {/* Main Stats Overview using PremiumStatGrid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i: number) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        ) : reportsData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Global Analytics
              </h2>
              <div className="flex items-center gap-4">
                <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Live System
                  </span>
                </div>
              </div>
            </div>
            <PremiumStatGrid
              items={[
                {
                  label: "Total Entities",
                  value:
                    reportsData.overview.totalUsers +
                    reportsData.overview.totalOrganizations,
                  icon: ShieldCheck,
                  color: "blue",
                },
                {
                  label: "Active Users",
                  value: reportsData.users.active,
                  icon: Users,
                  color: "green",
                },
                {
                  label: "Active Orgs",
                  value: reportsData.organizations.active,
                  icon: Building2,
                  color: "purple",
                },
                {
                  label: "System Health",
                  value: `${Math.round(((reportsData.users.active + reportsData.organizations.active) / (reportsData.overview.totalUsers + reportsData.overview.totalOrganizations || 1)) * 100)}%`,
                  icon: Activity,
                  color: "emerald",
                },
              ]}
            />

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center p-20 animate-pulse bg-gray-50/30 rounded-xl border border-dashed border-gray-100">
                    <TrendingUp className="w-8 h-8 text-blue-200" />
                  </div>
                ) : analyticsError ? (
                  <div className="h-full flex items-center justify-center p-12 text-center border-2 border-dashed border-red-50 rounded-xl">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
                      Analytics Unavailable
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                          Revenue Growth
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                          Financial trajectory over time
                        </p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="h-[300px]">
                      <AnalyticsBarChart
                        data={revenueData}
                        color="#10b981"
                        label="Revenue"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-6">
                {/* Org Status Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  {analyticsLoading ? (
                    <div className="h-[200px] flex items-center justify-center animate-pulse bg-gray-50/30 rounded-xl">
                      <Activity className="w-6 h-6 text-purple-200" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                          Org Status
                        </h3>
                        <p className="text-[8px] text-gray-400 font-bold mt-0.5">
                          Account Activity
                        </p>
                      </div>
                      <div className="h-[180px]">
                        <StatusDistribution data={orgData} />
                      </div>
                      <div className="mt-4 space-y-1">
                        {orgData
                          .slice(0, 3)
                          .map((item: { name: string; value: number }) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest"
                            >
                              <span className="text-gray-400">{item.name}</span>
                              <span className="text-gray-900">
                                {item.value} Orgs
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Plan Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  {analyticsLoading ? (
                    <div className="h-[200px] flex items-center justify-center animate-pulse bg-gray-50/30 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-blue-200" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                          Plan Distribution
                        </h3>
                        <p className="text-[8px] text-gray-400 font-bold mt-0.5">
                          Subscription Tiers
                        </p>
                      </div>
                      <div className="h-[180px]">
                        <StatusDistribution data={planData} />
                      </div>
                      <div className="mt-4 space-y-1">
                        {planData
                          .slice(0, 3)
                          .map((item: { name: string; value: number }) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest"
                            >
                              <span className="text-gray-400">{item.name}</span>
                              <span className="text-gray-900">
                                {item.value} Accounts
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Financial & Entity Stats */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 px-1">
            Financial Oversight
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Organizations"
              value={reportsData?.overview.totalOrganizations || 0}
              icon={Building2}
              color="blue"
              loading={loading}
            />
            <StatCard
              label="Users"
              value={reportsData?.overview.totalUsers || 0}
              icon={Users}
              color="green"
              loading={loading}
            />
            <StatCard
              label="Revenue"
              value={`₹${(invoicesData?.totalRevenue || 0).toLocaleString()}`}
              icon={Banknote}
              color="emerald"
              loading={loading}
            />
            <StatCard
              label="Invoices"
              value={invoicesData?.total || 0}
              icon={ReceiptText}
              color="orange"
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
