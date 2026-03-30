"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  ArrowRight,
  MoreHorizontal,
  Edit2,
  Search,
  ChevronRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Project } from "@/types/project";
import { useGetMyProjectsQuery } from "@/store/api/projectApiSlice";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
} from "@/utils/projectUtils";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";

export default function MemberProjectsPage() {
  const { user } = useAuth();
  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useGetMyProjectsQuery(undefined, { skip: !user });

  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">(
    "newest",
  );

  const loading = isLoading || isFetching;

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p: Project) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesPriority =
        priorityFilter === "ALL" || p.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a: Project, b: Project) => {
      if (sortOrder === "newest")
        return (
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      if (sortOrder === "oldest")
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  // Stats Logic
  const stats = {
    total: projects.length,
    active: projects.filter((p: Project) => p.status === "ACTIVE").length,
    completed: projects.filter((p: Project) => p.status === "COMPLETED").length,
    planning: projects.filter((p: Project) => p.status === "PLANNING").length,
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="My Projects">
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Collection Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-8 sm:px-10 sm:py-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                Portfolio
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Project Collection
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xl">
              Managing{" "}
              <span className="text-white font-bold">
                {stats.total} total projects
              </span>{" "}
              including{" "}
              <span className="text-green-400 font-bold">
                {stats.active} currently active
              </span>{" "}
              initiatives.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <PremiumStatGrid
          items={[
            {
              label: "Total",
              value: stats.total,
              icon: Activity,
              color: "blue",
            },
            {
              label: "Active",
              value: stats.active,
              icon: Calendar,
              color: "green",
            },
            {
              label: "Planning",
              value: stats.planning,
              icon: Edit2,
              color: "purple",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: ArrowRight,
              color: "blue",
            },
          ]}
        />

        {/* Compact Controls Bar */}
        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          {/* Search */}
          <div className="relative flex-1 min-w-[120px] group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs sm:text-sm text-gray-900 font-bold placeholder-gray-400 outline-none focus:bg-white focus:border-blue-100 transition-all"
            />
          </div>

          <div className="h-6 w-px bg-gray-100 mx-0.5 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-16 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[9px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Done</option>
              <option value="PLANNING">Plan</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-16 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[9px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Med</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "name" | "newest" | "oldest")
              }
              className="w-16 sm:w-28 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-[9px] sm:text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="newest">New</option>
              <option value="oldest">Old</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">
              No projects found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {filteredProjects.map((project: Project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description || "No description provided."}
                icon={Calendar}
                href={`/member/projects/${project.id}`}
                status={project.status}
                statusColor={getStatusColor(project.status)}
                sideBorderColor={
                  project.status === "ACTIVE"
                    ? "bg-green-500"
                    : project.status === "ON_HOLD"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }
                footerLeft={
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.teamMemberIds?.length || 0}</span>
                    </div>
                  </div>
                }
                footerRight={
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {project.progress || 0}%
                    </span>
                    <div className="w-16 sm:w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                }
              >
                <div className="mt-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black border uppercase tracking-wider ${getPriorityColor(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </div>
              </EntityCard>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
