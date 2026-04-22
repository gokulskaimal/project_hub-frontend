"use client";

import React, { useState, useMemo } from "react";
import {
  Trash2,
  Mail,
  Search,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Users,
  Layout,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InviteModal from "@/components/modals/InviteModal";
import {
  useGetManagerInvitationsQuery,
  useCancelManagerInvitationMutation,
  useGetManagerInvitationStatsQuery,
} from "@/store/api/managerApiSlice";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";
import { USER_ROLES } from "@/utils/constants";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";

interface Invitation {
  id: string;
  email: string;
  assignedRole?: string;
  role?: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
  createdAt?: string;
}

export default function InvitesPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const {
    data: invitationsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerInvitationsQuery({
    page,
    limit: 12,
    search: searchTerm,
    status: filterStatus,
  });

  const { data: inviteStats } = useGetManagerInvitationStatsQuery();

  const [cancelInvite] = useCancelManagerInvitationMutation();

  // Sort State
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const invitations = invitationsData?.items || [];
  const loading = isLoading || isFetching;

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  // Derived Data
  const filteredInvitations = useMemo(() => {
    let result = [...invitations];

    // We avoid client-side filtering for search/status now as it's server-driven.
    // However, if we need local sorting, we keep this useMemo.

    result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortBy === "email") {
        valA = a.email?.toLowerCase() || "";
        valB = b.email?.toLowerCase() || "";
      } else if (sortBy === "createdAt") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [invitations, sortBy, sortOrder]);

  // Calculated Stats
  // const stats = useMemo(() => {
  //   const total = invitationsData?.total || 0;

  //   const pending = (invitations as Invitation[]).filter(
  //     (i) => (i.status || "PENDING") === "PENDING",
  //   ).length;
  //   const accepted = (invitations as Invitation[]).filter(
  //     (i) => i.status === "ACCEPTED",
  //   ).length;
  //   const expired = (invitations as Invitation[]).filter(
  //     (i) => i.status === "EXPIRED",
  //   ).length;
  //   return { total, pending, accepted, expired };
  // }, [invitations, invitationsData?.total]);

  const handleCancelInvite = async (id: string) => {
    const confirmed = await confirmWithAlert(
      "Cancel Invitation?",
      "This will invalidate the invitation link sent to the user.",
    );
    if (!confirmed) return;

    try {
      await cancelInvite(id).unwrap();
      notifier.success("Invitation cancelled successfully");
    } catch (error) {
      notifier.error(error, "Failed to cancel invitation");
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle size={14} className="text-green-500" />;
      case "EXPIRED":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-amber-500" />;
    }
  };

  return (
    <DashboardLayout title="Operational Invites">
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="w-8 h-8 text-primary" />
              </div>
              Authorization <span className="text-primary">&</span> Access
            </h1>
            <p className="text-xs font-black text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-70">
              Tracking all pending entity authorizations within the secure
              perimeter.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refetch}
              className="p-3.5 bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:bg-secondary rounded-2xl transition-all shadow-xl active:scale-95 group"
              title="Sync Invitations"
            >
              <RefreshCw
                size={20}
                className={
                  isFetching
                    ? "animate-spin"
                    : "group-hover:rotate-180 transition-transform duration-500"
                }
              />
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary/20 active:scale-95"
            >
              <Plus size={18} />
              Dispatch Invite
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8 mb-6 px-1">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            Access Analytics
          </h2>
        </div>

        {/* Modular Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Dispatched"
            value={inviteStats?.total || 0}
            icon={Mail}
            color="blue"
          />
          <StatCard
            label="Awaiting Response"
            value={inviteStats?.pending || 0}
            icon={Clock}
            color="orange"
          />
          <StatCard
            label="Authorized Nodes"
            value={inviteStats?.accepted || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="System Expired"
            value={inviteStats?.expired || 0}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Improved Filter Bar */}
        <div className="bg-card p-5 rounded-3xl border border-border/50 shadow-2xl flex flex-col md:flex-row gap-5 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <input
              type="text"
              placeholder="Search by identity email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-11 pr-11 py-3 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 cursor-pointer transition-all hover:bg-secondary/40 w-full"
              >
                <option value="ALL" className="bg-card">
                  Status: ALL
                </option>
                <option value="PENDING" className="bg-card">
                  Pending
                </option>
                <option value="ACCEPTED" className="bg-card">
                  Accepted
                </option>
                <option value="EXPIRED" className="bg-card">
                  Expired
                </option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-3 bg-secondary/30 border border-transparent hover:border-primary/20 rounded-2xl text-muted-foreground hover:text-primary transition-all shadow-inner active:scale-95"
              title="Toggle Sort Sequence"
            >
              <ArrowUpDown
                className={`w-5 h-5 transition-transform duration-500 ${sortOrder === "desc" ? "rotate-180 text-primary" : ""}`}
              />
            </button>
          </div>
        </div>

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={refetch}
        />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card/50 rounded-[2.5rem] p-8 h-56 animate-pulse border border-border/50 shadow-2xl"
              />
            ))}
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
              <Mail className="w-12 h-12 text-primary opacity-40" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
              Null Result Matrix
            </h3>
            <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto leading-relaxed">
              No active authorizations detected within the current query
              parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInvitations.map((invite) => {
              const isPending = (invite.status || "PENDING") === "PENDING";
              const isAccepted = invite.status === "ACCEPTED";
              const isExpired = invite.status === "EXPIRED";

              return (
                <EntityCard
                  key={invite.id}
                  id={invite.id}
                  title={invite.email || "Unknown node"}
                  subtitle={`Access Role: ${(invite.assignedRole || invite.role || "TEAM_MEMBER").toLowerCase().replace("_", " ")}`}
                  icon={Mail}
                  status={invite.status || "PENDING"}
                  statusColor={
                    isAccepted
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : isExpired
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }
                  actions={
                    isPending && (
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        title="Cancel Invitation"
                        className="p-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/20 transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  }
                  footerLeft={
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : isExpired
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {getStatusIcon(invite.status)}
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {isAccepted
                          ? "Authorized"
                          : isPending
                            ? "Dispatched"
                            : "Void"}
                      </span>
                    </div>
                  }
                  footerRight={
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest tabular-nums">
                      {invite.createdAt
                        ? new Date(invite.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  }
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {invitationsData && invitationsData.totalPages > 1 && (
          <div className="px-8 py-5 bg-card border border-border/50 rounded-2xl shadow-2xl flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Matrix Page {page} / {invitationsData.totalPages}
            </span>
            <div className="flex gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-6 py-2.5 bg-secondary/30 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground hover:bg-secondary disabled:opacity-30 transition-all active:scale-95"
              >
                Prev
              </button>
              <button
                disabled={page >= invitationsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 bg-primary text-primary-foreground border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-30 transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
