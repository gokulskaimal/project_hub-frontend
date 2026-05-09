"use client";

import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useGetAdminReportsQuery,
} from "@/store/api/adminApiSlice";
import {
  Search,
  Trash2,
  Shield,
  ShieldOff,
  RefreshCw,
  UserX,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import PremiumStatGrid from "@/components/admin/PremiumStatGrid";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, refetch } = useGetAdminUsersQuery({
    page,
    limit,
    search,
    role: roleFilter,
    status: statusFilter,
  });
  const { data: reportsData } = useGetAdminReportsQuery();
  const [deleteUser] = useDeleteAdminUserMutation();
  const [updateUserStatus] = useUpdateAdminUserStatusMutation();

  const users = useMemo(() => {
    return data?.items ?? [];
  }, [data]);
  const [sortBy] = useState("name");
  const [sortOrder] = useState<"asc" | "desc">("asc");

  const filteredUsers = useMemo(() => {
    const result = [...users];
    // Backend now handles search, roleFilter, and statusFilter

    result.sort((a, b) => {
      const valA = (a[sortBy as keyof typeof a] as string)?.toLowerCase() || "";
      const valB = (b[sortBy as keyof typeof b] as string)?.toLowerCase() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, sortBy, sortOrder]);

  const confirmDeleteUser = async (userId: string) => {
    const confirmed = await confirmWithAlert(
      "Delete User?",
      "This action cannot be undone.",
    );
    if (confirmed) {
      try {
        await deleteUser(userId).unwrap();
        notifier.success(MESSAGES.ADMIN.USER_DELETED);
      } catch (err) {
        notifier.error(err, MESSAGES.ADMIN.DELETE_FAILED);
      }
    }
  };

  const confirmToggleBlock = async (userId: string, currentStatus: string) => {
    const isBlocking = currentStatus === "ACTIVE";
    const title = isBlocking ? "Block User?" : "Unblock User?";
    const text = isBlocking
      ? "The user will lose access."
      : "The user will regain access.";

    const confirmed = await confirmWithAlert(title, text);
    if (confirmed) {
      try {
        await updateUserStatus({
          id: userId,
          status: isBlocking ? "BLOCKED" : "ACTIVE",
        }).unwrap();
        notifier.success(
          isBlocking
            ? MESSAGES.ADMIN.USER_BLOCKED
            : MESSAGES.ADMIN.USER_UNBLOCKED,
        );
      } catch (err) {
        notifier.error(err, MESSAGES.ADMIN.UPDATE_FAILED);
      }
    }
  };

  return (
    <DashboardLayout title="Operational Operators">
      <div className="p-4 md:p-8 space-y-10 sm:space-y-12 pb-20">
        <PremiumStatGrid
          stats={{
            total: reportsData?.users?.total || 0,
            active: reportsData?.users?.active || 0,
            pending: reportsData?.users?.pending || 0,
            suspended: reportsData?.users?.inactive || 0,
          }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 bg-secondary/30 px-6 py-3 rounded-2xl border border-border/10 shadow-inner">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <span
                className="hover:text-primary cursor-pointer transition-colors"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
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
                    ? "FULL BIOMETRIC SCAN"
                    : `NODE: ${statusFilter}`}
              </span>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Re-Sync Biometrics
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-[2.5rem] shadow-2xl border border-border/50 glass-card">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4 z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Locate operational identity..."
              className="w-full pl-12 pr-4 py-3.5 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
          <div className="h-8 w-px bg-border/20 hidden md:block" />
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-6 py-3.5 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all cursor-pointer hover:bg-secondary/40 min-w-[160px]"
            >
              <option value="ALL" className="bg-card text-foreground">
                Role: ALL TYPES
              </option>
              <option value="ORG_MANAGER" className="bg-card text-foreground">
                Org Manager
              </option>
              <option
                value="PROJECT_MANAGER"
                className="bg-card text-foreground"
              >
                PM
              </option>
              <option value="TEAM_MEMBER" className="bg-card text-foreground">
                Member
              </option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3.5 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all cursor-pointer hover:bg-secondary/40 min-w-[160px]"
            >
              <option value="ALL" className="bg-card text-foreground">
                Status: ALL
              </option>
              <option value="ACTIVE" className="bg-card text-foreground">
                Active
              </option>
              <option
                value="BLOCKED"
                className="bg-card text-foreground text-destructive"
              >
                Blocked
              </option>
              <option
                value="PENDING_VERIFICATION"
                className="bg-card text-foreground text-amber-500"
              >
                Pending
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
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full py-40 text-center text-muted-foreground bg-card/30 rounded-[3rem] border border-border/50 border-dashed font-black text-sm uppercase tracking-widest animate-in fade-in zoom-in duration-700">
              <UserX className="w-16 h-16 mx-auto mb-6 opacity-20" />
              No Biological Signals Detected.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <EntityCard
                key={user.id}
                id={user.id}
                title={user.name || "Ident-Unknown"}
                subtitle={user.email}
                icon={
                  <UserAvatar
                    user={user}
                    size="sm"
                    className="ring-2 ring-primary/20 group-hover:ring-primary transition-all duration-500"
                  />
                }
                status={user.status}
                statusColor={
                  user.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }
                actions={
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        confirmToggleBlock(user.id, user.status || "ACTIVE")
                      }
                      title={
                        user.status === "ACTIVE"
                          ? "Void Access"
                          : "Restore Access"
                      }
                      className={`p-3 rounded-xl border transition-all active:scale-90 shadow-xl ${
                        user.status === "ACTIVE"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      }`}
                    >
                      {user.status === "ACTIVE" ? (
                        <ShieldOff size={18} />
                      ) : (
                        <Shield size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => confirmDeleteUser(user.id)}
                      title="Purge Identity"
                      className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all shadow-xl active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                }
                footerLeft={
                  <span className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm">
                    {user.role?.replace("_", " ")}
                  </span>
                }
                footerRight={
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                    <Clock size={12} className="text-primary/50" />
                    {user.organizationName || "Indep. Operator"}
                  </div>
                }
              />
            ))
          )}
        </div>

        <Pagination
          currentPage={page}
          totalPages={data?.totalPages || 1}
          totalItems={data?.total || 0}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
