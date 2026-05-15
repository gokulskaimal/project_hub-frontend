"use client";

import { useState } from "react";
import { useGetAdminInvoicesQuery } from "@/store/api/adminApiSlice";
import { ReceiptText, Calendar, Search, Eye } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import InvoiceViewModal from "@/components/modals/InvoiceViewModal";
import { Invoice } from "@/types/invoice";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [planType, setPlanType] = useState("ALL");
  const [sort, setSort] = useState("latest");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetAdminInvoicesQuery({
    page,
    limit: 12,
    search: debouncedSearch,
    status,
    sort,
    planType,
  });

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">
              Payments
            </h1>
            <p className="text-xs font-black text-muted-foreground mt-1 uppercase tracking-widest">
              See all payments from organizations.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Filters Header */}
          <div className="p-5 border-b border-border/30 flex flex-col md:flex-row gap-5 items-center justify-between bg-secondary/10">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search organization..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground placeholder-muted-foreground font-bold focus:outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-xs text-foreground font-black uppercase tracking-wider outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all appearance-none cursor-pointer min-w-[140px] hover:bg-secondary/40"
              >
                <option value="ALL" className="bg-card">
                  Status: All
                </option>
                <option value="PAID" className="bg-card">
                  Paid
                </option>
                <option value="PENDING" className="bg-card">
                  Pending
                </option>
                <option value="FAILED" className="bg-card">
                  Failed
                </option>
              </select>
              <select
                value={planType}
                onChange={(e) => {
                  setPlanType(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-xs text-foreground font-black uppercase tracking-wider outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all appearance-none cursor-pointer min-w-[140px] hover:bg-secondary/40"
              >
                <option value="ALL" className="bg-card">
                  Type: All
                </option>
                <option value="STARTER" className="bg-card">
                  Starter
                </option>
                <option value="PRO" className="bg-card">
                  Pro
                </option>
                <option value="ENTERPRISE" className="bg-card">
                  Enterprise
                </option>
              </select>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-xs text-foreground font-black uppercase tracking-wider outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all appearance-none cursor-pointer min-w-[140px] hover:bg-secondary/40"
              >
                <option value="latest" className="bg-card">
                  Recent First
                </option>
                <option value="amount_desc" className="bg-card">
                  Amount: High to Low
                </option>
                <option value="amount_asc" className="bg-card">
                  Amount: Low to High
                </option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Organization
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Plan
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Amount
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Razorpay ID
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-8 py-16 text-center text-muted-foreground font-black uppercase tracking-widest"
                    >
                      <div className="flex justify-center items-center gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(var(--primary),0.3)]"></div>
                        <span>Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : data?.items?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <ReceiptText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-foreground font-black text-lg tracking-tight">
                        No results found
                      </p>
                      <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-2">
                        No payments found in the search.
                      </p>
                    </td>
                  </tr>
                ) : (
                  data?.items?.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-secondary/20 transition-all duration-300 group"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center text-sm text-foreground font-bold">
                          <Calendar className="w-4 h-4 mr-3 text-primary/60 group-hover:text-primary transition-colors" />
                          {new Date(invoice.billingDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                            {invoice.orgName || "Unknown"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-tighter opacity-70">
                            {invoice.orgId.slice(0, 10)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-foreground">
                            {invoice.planName?.toUpperCase() || "CUSTOM"}
                          </span>
                          {invoice.planType && (
                            <span
                              className={`px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase border ${
                                invoice.planType === "STARTER"
                                  ? "bg-secondary/30 text-muted-foreground border-border/30"
                                  : invoice.planType === "PRO"
                                    ? "bg-primary/10 text-primary border-primary/20"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              }`}
                            >
                              {invoice.planType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div
                          className={`flex items-center gap-2 group-hover:translate-x-1 transition-transform`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              invoice.status === "PAID"
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                : invoice.status === "PENDING"
                                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                  : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              invoice.status === "PAID"
                                ? "text-emerald-500"
                                : invoice.status === "PENDING"
                                  ? "text-amber-500"
                                  : "text-rose-500"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-foreground tabular-nums tracking-tight">
                        {invoice.currency} {invoice.amount?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                        {invoice.razorpayPaymentId || "None"}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-secondary/30 text-foreground border border-border/50 rounded-2xl hover:text-primary hover:border-primary/30 hover:bg-secondary transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl group/btn active:scale-95"
                        >
                          <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                            View
                          </div>
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
            <div className="px-8 py-5 bg-card border-t border-border/30 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Page
                </span>
                <span className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg font-black text-[10px] shadow-lg shadow-primary/20">
                  {page}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  of {data.totalPages}
                </span>
              </div>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <InvoiceViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
        />
      </div>
    </DashboardLayout>
  );
}
