"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useGetManagerProjectsQuery } from "@/store/api/managerApiSlice";
import { Project } from "@/types/project";
import { getStatusColor, getPriorityColor } from "@/utils/projectUtils";
import {
  KanbanSquare,
  ArrowRight,
  LayoutGrid,
  Clock,
  AlertCircle,
  Users,
  Layout,
  Briefcase,
  Rocket,
  ShieldAlert,
  Target,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";

export default function GlobalBoardsPage() {
  const {
    data: projects = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerProjectsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const loading = isLoading || isFetching;

  const filteredProjects = projects.filter(
    (p: Project) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Stats Logic
  const stats = {
    total: projects.length,
    highPriority: projects.filter(
      (p: Project) => p.priority === "HIGH" || p.priority === "CRITICAL",
    ).length,
    totalMembers: projects.reduce(
      (sum: number, p: Project) => sum + (p.teamMemberIds?.length || 0),
      0,
    ),
    avgProgress:
      projects.length > 0
        ? Math.round(
            projects.reduce(
              (sum: number, p: Project) => sum + (p.progress || 0),
              0,
            ) / projects.length,
          )
        : 0,
  };

  return (
    <DashboardLayout title="Your Boards">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-blue-600" />
              Active Project Boards
            </h2>
            <p className="text-sm text-gray-500">
              Select a project to jump directly into its active sprint execution
              board.
            </p>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a board..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Boards"
            value={stats.total}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            label="High Priority"
            value={stats.highPriority}
            icon={ShieldAlert}
            color="red"
          />
          <StatCard
            label="Team Coverage"
            value={stats.totalMembers}
            icon={Users}
            color="purple"
          />
          <StatCard
            label="Avg. Progress"
            value={`${stats.avgProgress}%`}
            icon={Target}
            color="green"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-48 animate-pulse"
              >
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <KanbanSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              No boards found
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              You don&apos;t have any boards matching that search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description || "No description provided."}
                icon={KanbanSquare}
                href={`/manager/projects/${project.id}/board`}
                status={project.status || "PLANNING"}
                statusColor={getStatusColor(project.status)}
                footerLeft={
                  <div className="flex items-center gap-1 text-gray-600 font-medium text-[10px] sm:text-xs">
                    <Users className="w-4 h-4 text-gray-400" />
                    {project.teamMemberIds?.length || 0} Members
                  </div>
                }
                footerRight={
                  <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Go to board <ArrowRight className="w-4 h-4" />
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
