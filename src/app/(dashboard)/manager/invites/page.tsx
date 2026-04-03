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
    <DashboardLayout title="Member Invitations">
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Manage Invitations
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Track and manage all pending and accepted organization invites
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              <RefreshCw
                size={20}
                className={isFetching ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white hover:bg-black rounded-xl text-sm font-black transition-all shadow-xl shadow-gray-200"
            >
              <Plus size={18} />
              Dispatch Invites
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 mb-2 px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Invitation Analytics
          </h2>
        </div>

        {/* Modular Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Invitations"
            value={inviteStats?.total || 0}
            icon={Mail}
            color="blue"
          />
          <StatCard
            label="Pending"
            value={inviteStats?.pending || 0}
            icon={Clock}
            color="orange"
          />
          <StatCard
            label="Accepted"
            value={inviteStats?.accepted || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Expired"
            value={inviteStats?.expired || 0}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Improved Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Input
              placeholder="Filter by email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 transition-all shadow-sm"
              title="Toggle Sort Order"
            >
              <ArrowUpDown
                className={`w-5 h-5 transition-transform duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[2rem] p-8 h-48 animate-pulse border border-gray-100 shadow-sm"
              />
            ))}
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              No invitations found
            </h3>
            <p className="text-gray-500 font-medium">
              Try adjusting your filters or send a new invitation.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvitations.map((invite) => {
              const isPending = (invite.status || "PENDING") === "PENDING";
              const isAccepted = invite.status === "ACCEPTED";
              const isExpired = invite.status === "EXPIRED";

              return (
                <EntityCard
                  key={invite.id}
                  id={invite.id}
                  title={invite.email || "No Email"}
                  subtitle={`Role: ${(invite.assignedRole || invite.role || "TEAM_MEMBER").toLowerCase().replace("_", " ")}`}
                  icon={Mail}
                  status={invite.status || "PENDING"}
                  statusColor={
                    isAccepted
                      ? "bg-green-50 text-green-700 border-green-100"
                      : isExpired
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                  }
                  actions={
                    isPending && (
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        title="Cancel Invitation"
                        className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )
                  }
                  footerLeft={
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isAccepted
                            ? "bg-green-50 text-green-600"
                            : isExpired
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {getStatusIcon(invite.status)}
                      </div>
                    </div>
                  }
                  footerRight={
                    invite.createdAt
                      ? new Date(invite.createdAt).toLocaleDateString()
                      : "N/A"
                  }
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {invitationsData && invitationsData.totalPages > 1 && (
          <div className="px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Showing Page {page} of {invitationsData.totalPages} (
              {invitationsData.total} total items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= invitationsData.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
