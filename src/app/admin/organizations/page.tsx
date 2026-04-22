"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetAdminOrgsQuery,
  useUpdateAdminOrgStatusMutation,
  useDeleteAdminOrgMutation,
  useGetAdminReportsQuery,
} from "@/store/api/adminApiSlice";
import {
  Search,
  Trash2,
  Building2,
  RefreshCw,
  Shield,
  ShieldOff,
  Building,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Users,
} from "lucide-react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import PremiumStatGrid from "@/components/admin/PremiumStatGrid";
import { EntityCard } from "@/components/ui/EntityCard";
import { MoreHorizontal, Edit2 } from "lucide-react";

export default function AdminOrganizationsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, isLoading, refetch } = useGetAdminOrgsQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });
  const { data: reportsData, isLoading: reportsLoading } =
    useGetAdminReportsQuery();
  const [updateStatus] = useUpdateAdminOrgStatusMutation();
  const [deleteOrg] = useDeleteAdminOrgMutation();

  const orgs = useMemo(() => {
    return data?.items ?? [];
  }, [data]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredOrgs = useMemo(() => {
    let result = [...orgs];
    // Backend now handles search and statusFilter

    result.sort((a, b) => {
      const valA = (a[sortBy as keyof typeof a] as string)?.toLowerCase() || "";
      const valB = (b[sortBy as keyof typeof b] as string)?.toLowerCase() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [orgs, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(field);
  };

  const confirmToggleStatus = async (orgId: string, currentStatus: string) => {
    const isSuspending = currentStatus === "ACTIVE";
    const title = isSuspending
      ? "Suspend Organization?"
      : "Activate Organization?";
    const text = isSuspending
      ? "All users will lose access."
      : "Access will be restored.";

    const confirmed = await confirmWithAlert(title, text);
    if (confirmed) {
      try {
        await updateStatus({
          id: orgId,
          status: isSuspending ? "SUSPENDED" : "ACTIVE",
        }).unwrap();
        notifier.success(
          isSuspending
            ? MESSAGES.ADMIN.ORG_SUSPENDED
            : MESSAGES.ADMIN.ORG_ACTIVATED,
        );
      } catch (err) {
        notifier.error(err, MESSAGES.ADMIN.UPDATE_FAILED);
      }
    }
  };

  const confirmDeleteOrg = async (orgId: string) => {
    const confirmed = await confirmWithAlert(
      "Delete Organization?",
      "All data will be permanently removed.",
    );
    if (confirmed) {
      try {
        await deleteOrg(orgId).unwrap();
        notifier.success(MESSAGES.ADMIN.ORG_DELETED);
      } catch (err) {
        notifier.error(err, MESSAGES.ADMIN.DELETE_FAILED);
      }
    }
  };

  return (
    <DashboardLayout title="Client Infrastructure">
      <div className="p-4 md:p-8 space-y-10 sm:space-y-12 pb-20">
        <PremiumStatGrid
          stats={{
            total: reportsData?.organizations?.total || 0,
            active: reportsData?.organizations?.active || 0,
            suspended: reportsData?.organizations?.inactive || 0,
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 bg-secondary/30 px-6 py-3 rounded-2xl border border-border/10 shadow-inner">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <span
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
              >
                Root Registry
              </span>
              <ChevronRight size={12} className="text-border/50" />
              <span className="text-primary truncate max-w-[150px] sm:max-w-none">
                {search
                  ? `QUERY: ${search.toUpperCase()}`
                  : statusFilter === "ALL"
                    ? "GLOBAL UNIVERSE"
                    : `NODE: ${statusFilter}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Sync Network Data
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-2xl border border-border/50 glass-card">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4 z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Locate organization nexus..."
              className="w-full pl-12 pr-4 py-3.5 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
          <div className="h-8 w-px bg-border/20 hidden md:block" />
          <div className="relative w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 appearance-none px-6 py-3.5 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all cursor-pointer hover:bg-secondary/40"
            >
              <option value="ALL" className="bg-card">
                Status: ALL NODES
              </option>
              <option value="ACTIVE" className="bg-card">
                Status: ACTIVE
              </option>
              <option value="SUSPENDED" className="bg-card">
                Status: SUSPENDED
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card p-8 rounded-[2.5rem] border border-border/30 h-64 animate-pulse shadow-2xl"
              />
            ))
          ) : filteredOrgs.length === 0 ? (
            <div className="col-span-full py-40 text-center text-muted-foreground bg-card/30 rounded-[3rem] border border-border/50 border-dashed font-black text-sm uppercase tracking-widest animate-in fade-in zoom-in duration-700">
              <Building className="w-16 h-16 mx-auto mb-6 opacity-20" />
              No Entity Trace Detected.
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <EntityCard
                key={org.id}
                id={org.id}
                title={org.name}
                subtitle={org.email}
                icon={Building2}
                status={org.status}
                statusColor={
                  org.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
                footerLeft={
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-lg group-hover:bg-secondary transition-colors">
                      <Users className="w-3 h-3 text-primary/70" />
                      <span>{org.currentUserCount || 0} Members</span>
                    </div>
                  </div>
                }
                footerRight={
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.1em] opacity-60">
                      Network Access Type
                    </span>
                    <div className="px-3 py-1 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                      {org.planName || "Trial Node"}
                    </div>
                  </div>
                }
                actions={
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        confirmToggleStatus(org.id, org.status || "ACTIVE")
                      }
                      title={
                        org.status === "ACTIVE"
                          ? "Suspend Network"
                          : "Activate Network"
                      }
                      className={`p-3 rounded-xl border transition-all active:scale-90 shadow-xl ${
                        org.status === "ACTIVE"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      }`}
                    >
                      {org.status === "ACTIVE" ? (
                        <ShieldOff size={18} />
                      ) : (
                        <Shield size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => confirmDeleteOrg(org.id)}
                      title="Purge Node"
                      className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all shadow-xl active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                }
              />
            ))
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="p-8 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 glass-card">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              Quadrant Registry Page {page}{" "}
              <span className="mx-2 text-border">/</span> {data.totalPages}
            </span>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex-1 sm:flex-none px-8 py-3 bg-secondary/30 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary disabled:opacity-30 transition-all active:scale-95"
              >
                Previous Trace
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-2xl shadow-primary/20 active:scale-95"
              >
                Next Trace
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
