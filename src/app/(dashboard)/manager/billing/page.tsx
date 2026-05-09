"use client";

import { useState } from "react";
import { useGetManagerInvoicesQuery } from "@/store/api/managerApiSlice";
import { Invoice } from "@/types/invoice";
import {
  ReceiptText,
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
  const { data, isLoading } = useGetManagerInvoicesQuery({ page, limit: 12 });
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
    <DashboardLayout title="Subscription & Billing">
      <div className="space-y-10 sm:space-y-12 pb-12">
        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              Financial Spectrum
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 opacity-70">
              Live tracking of organizational resource consumption
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Live Matrix Sync
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Invoices Dispatched"
            value={stats.total}
            icon={ReceiptText}
            color="blue"
          />
          <StatCard
            label="Net Flux"
            value={stats.spent}
            icon={IndianRupee}
            color="green"
          />
          <StatCard
            label="Pending Settlement"
            value={stats.pending}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            label="Terminal Billing"
            value={stats.latest}
            icon={ArrowRight}
            color="blue"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase">
              Operational History
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
              Manage your organizational subscription and transaction logs
            </p>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden glass-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30">
              <thead className="bg-secondary/30 border-b border-border/10">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Operational Date
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Quantum Amount
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Status Node
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Allocation Plan
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Syncing History...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : data?.items?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-16 text-center text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-50"
                    >
                      Null Transaction History Detected
                    </td>
                  </tr>
                ) : (
                  data?.items?.map((invoice: Invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-secondary/20 transition-all group"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm font-bold text-foreground">
                          <Calendar className="w-4 h-4 mr-3 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                          {new Date(invoice.billingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-black text-foreground tabular-nums">
                          <span className="text-xs text-muted-foreground mr-1">
                            {invoice.currency}
                          </span>
                          {invoice.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${
                            invoice.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : invoice.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground truncate max-w-[150px]">
                            {invoice.planName || invoice.planId}
                          </span>
                          {invoice.planType && (
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-[0.1em] border uppercase ${
                                invoice.planType === "STARTER"
                                  ? "bg-secondary/50 text-muted-foreground border-border/50"
                                  : invoice.planType === "PRO"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {invoice.planType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all active:scale-95"
                        >
                          Manifest <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="px-8 py-6 bg-secondary/10 border-t border-border/10 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary disabled:opacity-30 transition-all active:scale-95"
              >
                Previous
              </button>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Matrix Page {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-6 py-2.5 bg-primary text-primary-foreground border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-xl shadow-primary/20 active:scale-95"
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
