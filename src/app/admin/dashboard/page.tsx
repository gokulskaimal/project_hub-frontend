"use client";

import {
  useGetAdminReportsQuery,
  useGetAdminInvoicesQuery,
} from "@/store/api/adminApiSlice";
import {
  Users,
  Building2,
  CreditCard,
  ReceiptText,
  Banknote,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import { StatCard } from "@/components/ui/StatCard";

export default function AdminDashboardPage() {
  const { data: reportsData, isLoading: reportsLoading } =
    useGetAdminReportsQuery();
  const { data: invoicesData, isLoading: invoicesLoading } =
    useGetAdminInvoicesQuery({
      limit: 1,
      page: 1,
    });

  const loading = reportsLoading || invoicesLoading;

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="p-6 space-y-8">
        {/* Main Stats Overview using PremiumStatGrid */}
        {reportsData ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              System Overview
            </h2>
            <PremiumStatGrid
              stats={{
                total:
                  reportsData.overview.totalUsers +
                  reportsData.overview.totalOrganizations,
                active:
                  reportsData.users.active + reportsData.organizations.active,
                suspended:
                  reportsData.users.inactive +
                  reportsData.organizations.inactive,
              }}
            />
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-xl animate-pulse border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        ) : null}

        {/* Financial & Entity Stats */}
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
    </DashboardLayout>
  );
}
