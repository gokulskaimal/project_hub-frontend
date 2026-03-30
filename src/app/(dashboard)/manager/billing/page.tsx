"use client";

import { useState } from "react";
import { useGetManagerInvoicesQuery } from "@/store/api/managerApiSlice";
import { Invoice } from "@/types/invoice";
import {
  ReceiptText,
  Download,
  Calendar,
  ArrowRight,
  IndianRupee,
  Layout,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/ui/StatCard";
import InvoiceViewModal from "@/components/modals/InvoiceViewModal";
import { useMemo } from "react";

export default function ManagerBillingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetManagerInvoicesQuery({ page, limit: 10 });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const stats = useMemo(() => {
    if (!data?.items) return { total: 0, spent: 0, pending: 0, latest: "N/A" };
    const items = data.items as Invoice[];
    const total = data.total || items.length;
    const spent = items
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.amount, 0);
    const pending = items.filter((i) => i.status === "PENDING").length;
    const latestDate = items.length > 0 ? items[0].billingDate : null;

    return {
      total,
      spent: `${items[0]?.currency || "INR"} ${spent.toLocaleString()}`,
      pending,
      latest: latestDate ? new Date(latestDate).toLocaleDateString() : "N/A",
    };
  }, [data]);

  return (
    <DashboardLayout title="Billing & Invoices">
      <div className="space-y-8">
        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Billing Analytics
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
            label="Net Invoices"
            value={stats.total}
            icon={ReceiptText}
            color="blue"
          />
          <StatCard
            label="Total Paid"
            value={stats.spent}
            icon={IndianRupee}
            color="green"
          />
          <StatCard
            label="Pending Action"
            value={stats.pending}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            label="Last Billing"
            value={stats.latest}
            icon={ArrowRight}
            color="blue"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Detailed History
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Manage your subscriptions and payment history
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading invoices...
                    </td>
                  </tr>
                ) : data?.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No payment history found.
                    </td>
                  </tr>
                ) : (
                  data?.items?.map((invoice: Invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(invoice.billingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.currency} {invoice.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">
                            {invoice.planName || invoice.planId}
                          </span>
                          {invoice.planType && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                                invoice.planType === "STARTER"
                                  ? "bg-gray-100 text-gray-600"
                                  : invoice.planType === "PRO"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {invoice.planType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                        >
                          View <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Unified Invoicing Modal */}
      <InvoiceViewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />
    </DashboardLayout>
  );
}
