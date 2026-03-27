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
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InviteModal from "@/components/modals/InviteModal";
import {
  useGetManagerInvitationsQuery,
  useCancelManagerInvitationMutation,
} from "@/store/api/managerApiSlice";
import { Input } from "@/components/ui/Input";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";

export default function InvitesPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    data: invitations = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerInvitationsQuery();
  const [cancelInvite] = useCancelManagerInvitationMutation();

  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loading = isLoading || isFetching;

  // Derived Data
  const filteredInvitations = useMemo(() => {
    let result = [...invitations];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((i) => i.email?.toLowerCase().includes(lowerTerm));
    }

    if (filterStatus !== "ALL") {
      result = result.filter((i) => (i.status || "PENDING") === filterStatus);
    }

    result.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

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
  }, [invitations, searchTerm, filterStatus, sortBy, sortOrder]);

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
            {filteredInvitations.map((invite) => (
              <div
                key={invite.id}
                className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        invite.status === "ACCEPTED"
                          ? "bg-green-50 text-green-600"
                          : invite.status === "EXPIRED"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {getStatusIcon(invite.status)}
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                        invite.status === "ACCEPTED"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : invite.status === "EXPIRED"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {invite.status || "PENDING"}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {invite.createdAt
                      ? new Date(invite.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="mb-6">
                  <h3
                    className="font-black text-gray-900 text-lg truncate group-hover:text-blue-600 transition-colors"
                    title={invite.email}
                  >
                    {invite.email}
                  </h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                    Role: {invite.role?.toLowerCase().replace("_", " ")}
                  </p>
                </div>

                {invite.status === "PENDING" && (
                  <button
                    onClick={() => handleCancelInvite(invite.id)}
                    className="pt-6 border-t border-gray-50 w-full text-red-500 hover:text-red-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  >
                    <Trash2 size={14} /> Cancel Invitation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
