"use client";

import React, { useState, useMemo } from "react";
import {
  Trash2,
  Ban,
  CheckCircle,
  RefreshCw,
  Mail,
  Search,
  ArrowUpDown,
  Users,
  Filter,
  ChevronRight,
  UserPlus,
  Layout,
} from "lucide-react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InviteModal from "@/components/modals/InviteModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { USER_ROLES } from "@/utils/constants";
import {
  useDeleteManagerMemberMutation,
  useGetManagerMembersQuery,
  useUpdateManagerMemberStatusMutation,
  useGetManagerInvitationsQuery,
} from "@/store/api/managerApiSlice";
import { extractErrorMessage } from "@/utils/api";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";

export default function MembersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    data: members = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerMembersQuery();
  const { data: invitations = [] } = useGetManagerInvitationsQuery();
  const [deleteMember] = useDeleteManagerMemberMutation();
  const [updateMemberStatus] = useUpdateManagerMemberStatusMutation();

  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loading = isLoading || isFetching;

  // Derived Data
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.email.toLowerCase().includes(lowerTerm) ||
          (m.firstName && m.firstName.toLowerCase().includes(lowerTerm)) ||
          (m.lastName && m.lastName.toLowerCase().includes(lowerTerm)),
      );
    }

    // Filter
    if (filterRole !== "ALL") {
      result = result.filter((m) => m.role === filterRole);
    }
    if (filterStatus !== "ALL") {
      result = result.filter((m) => (m.status || "ACTIVE") === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let valA = "";
      let valB = "";

      if (sortBy === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortBy === "role") {
        valA = a.role || "";
        valB = b.role || "";
      } else if (sortBy === "status") {
        valA = a.status || "ACTIVE";
        valB = b.status || "ACTIVE";
      } else if (sortBy === "name") {
        valA = (a.firstName || "").toLowerCase();
        valB = (b.firstName || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [members, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(
      (m) => (m.status || "ACTIVE") === "ACTIVE",
    ).length;
    const inactive = members.filter(
      (m) => (m.status || "ACTIVE") !== "ACTIVE",
    ).length;
    const pendingInvites = invitations.filter(
      (i) => (i.status || "PENDING") === "PENDING",
    ).length;
    return { total, active, inactive, pendingInvites };
  }, [members, invitations]);

  const handleRemoveMember = async (id: string) => {
    const confirmed = await confirmWithAlert(
      "Are you sure?",
      "This will permanently delete the member's account.",
    );

    if (!confirmed) return;

    try {
      await deleteMember(id).unwrap();
      notifier.success(MESSAGES.TEAM.MEMBER_DELETED);
    } catch (error) {
      notifier.error(error, MESSAGES.TEAM.MEMBER_DELETED);
    }
  };

  const handleBlockMember = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const action = currentStatus === "ACTIVE" ? "block" : "unblock";

    const confirmed = await confirmWithAlert(
      `Are you sure?`,
      `Do you want to ${action} this member?`,
    );

    if (!confirmed) return;

    try {
      await updateMemberStatus({ id, status: newStatus }).unwrap();
      notifier.success(
        newStatus === "ACTIVE"
          ? MESSAGES.TEAM.MEMBER_UNBLOCKED
          : MESSAGES.TEAM.MEMBER_BLOCKED,
      );
    } catch (error) {
      notifier.error(error, `Failed to ${action} member`);
    }
  };

  return (
    <DashboardLayout title="Team Members">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end mb-2 gap-3">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow"
          >
            <Mail size={16} />
            Invite Member
          </button>
        </div>

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={refetch}
        />

        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between mt-4 mb-2 px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Real-time Analytics
          </h2>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Live Sync
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Members"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active Members"
            value={stats.active}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Inactive Members"
            value={stats.inactive}
            icon={Ban}
            color="red"
          />
          <StatCard
            label="Pending Invites"
            value={stats.pendingInvites}
            icon={Mail}
            color="orange"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest overflow-hidden">
            <span
              className="hover:text-blue-600 cursor-pointer transition-colors shrink-0"
              onClick={() => {
                setSearchTerm("");
                setFilterRole("ALL");
                setFilterStatus("ALL");
              }}
            >
              Members
            </span>
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <span className="text-blue-600 truncate">
              {searchTerm
                ? `"${searchTerm}"`
                : filterStatus === "ALL"
                  ? "Directory"
                  : filterStatus}
            </span>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0"
          >
            <UserPlus size={14} />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs sm:text-sm text-gray-900 font-bold placeholder-gray-400 outline-none focus:bg-white focus:border-blue-100 transition-all font-sans"
            />
          </div>

          <div className="h-6 w-px bg-gray-100 mx-1 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[10px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Role</option>
              <option value={USER_ROLES.ORG_MANAGER}>Manager</option>
              <option value={USER_ROLES.TEAM_MEMBER}>Member</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[10px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <div className="flex border border-gray-100 rounded-lg overflow-hidden bg-gray-50 translate-y-0 text-[10px]">
              {["name", "status"].map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`px-2 py-1.5 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    sortBy === field
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  } ${field !== "status" ? "border-r border-gray-200" : ""}`}
                >
                  <span className="hidden sm:inline">{field}</span>
                  <ArrowUpDown size={10} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 h-48 animate-pulse border border-gray-100"
              ></div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-gray-100 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
              <div className="relative w-full h-full bg-blue-50 rounded-full flex items-center justify-center shadow-inner border border-blue-100">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Your Team Awaits
            </h3>
            <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto mb-8 leading-relaxed">
              No members match your criteria. Expand your workspace or try
              adjusting your search filters.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              + Invite Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {filteredMembers.map((member) => {
              const isActive = (member.status || "ACTIVE") === "ACTIVE";
              return (
                <EntityCard
                  key={member.id}
                  id={member.id}
                  title={`${member.firstName} ${member.lastName}`}
                  subtitle={member.email}
                  icon={<UserAvatar user={member} size="sm" />}
                  status={isActive ? "ACTIVE" : "BLOCKED"}
                  statusColor={
                    isActive
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }
                  actions={
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleBlockMember(
                            member.id,
                            member.status || "ACTIVE",
                          )
                        }
                        title={isActive ? "Block" : "Unblock"}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isActive
                            ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                            : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                        }`}
                      >
                        {isActive ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        title="Remove"
                        className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                  footerLeft={
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider border border-blue-100">
                      {member.role === USER_ROLES.SUPER_ADMIN
                        ? "Super Admin"
                        : member.role === USER_ROLES.ORG_MANAGER
                          ? "Manager"
                          : "Team Member"}
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
