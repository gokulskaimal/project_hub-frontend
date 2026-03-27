"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  UserCheck,
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
import { MoreHorizontal, Edit2 } from "lucide-react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, refetch } = useGetAdminUsersQuery({
    page,
    limit,
    search,
  });
  const { data: reportsData, isLoading: reportsLoading } =
    useGetAdminReportsQuery();
  const [deleteUser] = useDeleteAdminUserMutation();
  const [updateUserStatus] = useUpdateAdminUserStatusMutation();

  const users = useMemo(() => {
    return data?.items ?? [];
  }, [data]);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredUsers = useMemo(() => {
    let result = [...users];
    if (search) {
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.status === statusFilter);
    }
    result.sort((a, b) => {
      const valA = (a[sortBy as keyof typeof a] as string)?.toLowerCase() || "";
      const valB = (b[sortBy as keyof typeof b] as string)?.toLowerCase() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [users, search, roleFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

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
    <DashboardLayout title="User Management">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PremiumStatGrid
          stats={{
            total: reportsData?.users?.total || 0,
            active: reportsData?.users?.active || 0,
            pending: reportsData?.users?.pending || 0,
            suspended: reportsData?.users?.inactive || 0,
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
            <span
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Users
            </span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-blue-600 truncate max-w-[100px] sm:max-w-none">
              {search
                ? `"${search}"`
                : statusFilter === "ALL"
                  ? "Registry"
                  : statusFilter}
            </span>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs sm:text-sm text-gray-900 font-bold placeholder-gray-400 outline-none focus:bg-white focus:border-blue-100 transition-all"
            />
          </div>
          <div className="h-6 w-px bg-gray-100 mx-1 shrink-0" />
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[10px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Role</option>
              <option value="ORG_MANAGER">Org Manager</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="TEAM_MEMBER">Team Member</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-20 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[10px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
              <option value="PENDING_VERIFICATION">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-48 animate-pulse"
              />
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 font-medium">No users found.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <EntityCard
                key={user.id}
                id={user.id}
                title={user.name || "Unknown User"}
                subtitle={user.email}
                icon={<UserAvatar user={user} size="sm" />}
                status={user.status}
                statusColor={
                  user.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        confirmToggleBlock(user.id, user.status || "ACTIVE")
                      }
                      title={user.status === "ACTIVE" ? "Block" : "Unblock"}
                      className={`p-1.5 rounded-lg border transition-all ${
                        user.status === "ACTIVE"
                          ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                          : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                      }`}
                    >
                      {user.status === "ACTIVE" ? (
                        <ShieldOff size={16} />
                      ) : (
                        <Shield size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => confirmDeleteUser(user.id)}
                      title="Delete"
                      className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                }
                footerLeft={
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider border border-blue-100">
                    {user.role?.replace("_", " ")}
                  </span>
                }
              />
            ))
          )}
        </div>

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Page {page} of {data.totalPages}
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
                disabled={page >= data.totalPages}
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
