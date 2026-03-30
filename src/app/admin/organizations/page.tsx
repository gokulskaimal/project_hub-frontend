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
    if (search) {
      result = result.filter(
        (o) =>
          o.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }
    result.sort((a, b) => {
      const valA = (a[sortBy as keyof typeof a] as string)?.toLowerCase() || "";
      const valB = (b[sortBy as keyof typeof b] as string)?.toLowerCase() || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [orgs, search, statusFilter, sortBy, sortOrder]);

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
    <DashboardLayout title="Organization Management">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PremiumStatGrid
          stats={{
            total: reportsData?.organizations?.total || 0,
            active: reportsData?.organizations?.active || 0,
            suspended: reportsData?.organizations?.inactive || 0,
          }}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
            <span
              className="hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Orgs
            </span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-blue-600 truncate max-w-[100px] sm:max-w-none">
              {search
                ? `"${search}"`
                : statusFilter === "ALL"
                  ? "All Entries"
                  : statusFilter}
            </span>
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1 group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs sm:text-sm text-gray-900 font-bold placeholder-gray-400 outline-none focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 transition-all"
            />
          </div>
          <div className="h-6 w-px bg-gray-100 mx-1 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-24 sm:w-32 px-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[10px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white focus:border-blue-100 transition-all appearance-none cursor-pointer"
          >
            <option value="ALL">Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-48 animate-pulse"
              />
            ))
          ) : filteredOrgs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500 font-medium">
                No organizations found.
              </p>
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <EntityCard
                key={org.id}
                id={org.id}
                title={org.name}
                subtitle={org.email || "No email provided"}
                icon={Building2}
                status={org.status}
                statusColor={
                  org.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        confirmToggleStatus(org.id, org.status || "ACTIVE")
                      }
                      title={org.status === "ACTIVE" ? "Suspend" : "Activate"}
                      className={`p-1.5 rounded-lg border transition-all ${
                        org.status === "ACTIVE"
                          ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                          : "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                      }`}
                    >
                      {org.status === "ACTIVE" ? (
                        <ShieldOff size={16} />
                      ) : (
                        <Shield size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => confirmDeleteOrg(org.id)}
                      title="Delete"
                      className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
