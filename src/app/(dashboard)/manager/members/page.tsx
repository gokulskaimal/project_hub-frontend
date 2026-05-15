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
  ChevronRight,
  UserPlus,
  Layout,
} from "lucide-react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useSocket } from "@/context/SocketContext";
import InviteModal from "@/components/modals/InviteModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { USER_ROLES } from "@/utils/constants";
import {
  useDeleteManagerMemberMutation,
  useGetManagerMembersQuery,
  useUpdateManagerMemberStatusMutation,
  useGetManagerInvitationStatsQuery,
  useGetManagerMemberStatsQuery,
} from "@/store/api/managerApiSlice";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";

export default function MembersPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    data: membersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerMembersQuery({
    page,
    limit,
    search: searchTerm,
    role: filterRole,
    status: filterStatus,
  });

  const { data: memberStats } = useGetManagerMemberStatsQuery();
  const { data: invitationStats } = useGetManagerInvitationStatsQuery();

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, filterRole, filterStatus]);

  const { socket, isConnected } = useSocket();

  React.useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMemberUpdate = () => {
      refetch();
    };

    socket.on("member:joined", handleMemberUpdate);
    socket.on("member:left", handleMemberUpdate);
    socket.on("member:updated", handleMemberUpdate);

    return () => {
      socket.off("member:joined", handleMemberUpdate);
      socket.off("member:left", handleMemberUpdate);
      socket.off("member:updated", handleMemberUpdate);
    };
  }, [socket, isConnected, refetch]);

  const members = useMemo(() => {
    const list = membersData?.items || [];
    // If the manager is in the list, we filter them out locally as well for extra safety,
    // although the backend already avoids returning the manager.
    return list;
  }, [membersData]);

  const [deleteMember] = useDeleteManagerMemberMutation();
  const [updateMemberStatus] = useUpdateManagerMemberStatusMutation();

  const loading = isLoading || isFetching;

  // Sorting remains local for the current page
  const filteredMembers = useMemo(() => {
    const result = [...members];

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
  }, [members, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Stats
  // const stats = useMemo(() => {
  //   const total = members.length;
  //   const active = members.filter(
  //     (m) => (m.status || "ACTIVE") === "ACTIVE",
  //   ).length;
  //   const inactive = members.filter(
  //     (m) => (m.status || "ACTIVE") !== "ACTIVE",
  //   ).length;
  //   const pendingInvites = invitations.filter(
  //     (i) => (i.status || "PENDING") === "PENDING",
  //   ).length;
  //   return { total, active, inactive, pendingInvites };
  // }, [members, invitations]);

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
        <div className="flex justify-end items-center mb-6 gap-4">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-xl"
            title="Refresh List"
          >
            <RefreshCw
              size={14}
              className={isLoading ? "animate-spin" : "text-primary"}
            />
            <span className="hidden sm:inline">Refresh List</span>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Mail size={14} />
            Invite Member
          </button>
        </div>

        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={refetch}
        />

        <div className="flex items-center justify-between mt-8 mb-6 px-1">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            Team Members
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total Members"
            value={memberStats?.total || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active Members"
            value={memberStats?.active || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Inactive Members"
            value={memberStats?.inactive || 0}
            icon={Ban}
            color="red"
          />
          <StatCard
            label="Pending Invites"
            value={invitationStats?.pending || 0}
            icon={Mail}
            color="orange"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest overflow-hidden">
            <span
              className="hover:text-primary cursor-pointer transition-colors shrink-0"
              onClick={() => {
                setSearchTerm("");
                setFilterRole("ALL");
                setFilterStatus("ALL");
              }}
            >
              Members
            </span>
            <ChevronRight size={12} className="text-border shrink-0" />
            <span className="text-primary truncate">
              {searchTerm
                ? `"${searchTerm}"`
                : filterStatus === "ALL"
                  ? "Directory"
                  : filterStatus}
            </span>
          </div>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest shrink-0"
          >
            <UserPlus size={14} />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-card p-2 sm:p-3 rounded-xl shadow-sm border border-border overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-secondary/30 border border-transparent rounded-lg text-xs sm:text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-card focus:border-primary/30 transition-all font-sans"
            />
          </div>

          <div className="h-6 w-px bg-border mx-1 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-secondary/30 border border-transparent rounded-lg text-[10px] sm:text-xs text-foreground font-black uppercase tracking-wider outline-none focus:bg-card transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                Role
              </option>
              <option value={USER_ROLES.ORG_MANAGER} className="bg-card">
                Manager
              </option>
              <option value={USER_ROLES.TEAM_MEMBER} className="bg-card">
                Member
              </option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-secondary/30 border border-transparent rounded-lg text-[10px] sm:text-xs text-foreground font-black uppercase tracking-wider outline-none focus:bg-card transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                Status
              </option>
              <option value="ACTIVE" className="bg-card">
                Active
              </option>
              <option value="INACTIVE" className="bg-card">
                Inactive
              </option>
            </select>

            <div className="flex border border-border rounded-lg overflow-hidden bg-secondary/30 translate-y-0 text-[10px]">
              {["name", "status"].map((field) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`px-2 py-1.5 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    sortBy === field
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  } ${field !== "status" ? "border-r border-border" : ""}`}
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
                className="bg-card/50 rounded-xl p-6 h-48 animate-pulse border border-border"
              ></div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border-2 border-border border-dashed animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
              <div className="relative w-full h-full bg-primary/5 rounded-full flex items-center justify-center shadow-inner border border-primary/10">
                <Users className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">
              Your Team Awaits
            </h3>
            <p className="text-muted-foreground text-sm font-medium max-w-xs mx-auto mb-8 leading-relaxed">
              No members match your criteria. Expand your workspace or try
              adjusting your search filters.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              + Invite Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                  actions={
                    <div className="flex gap-2 p-1">
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
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
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
                        className="p-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  }
                  footerLeft={
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-black uppercase tracking-wider border border-primary/20">
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

        <Pagination
          currentPage={page}
          totalPages={membersData?.totalPages || 1}
          totalItems={membersData?.total || 0}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
