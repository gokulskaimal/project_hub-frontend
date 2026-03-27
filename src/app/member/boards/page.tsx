"use client";

import { useState } from "react";
import { useGetMyProjectsQuery } from "@/store/api/projectApiSlice";
import { Project } from "@/types/project";
import { KanbanSquare, ArrowRight, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EntityCard } from "@/components/ui/EntityCard";
import {
  getStatusColor as getStatusBg,
  getPriorityColor as getPriorityBg,
} from "@/utils/projectUtils";

export default function MemberBoardsPage() {
  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useGetMyProjectsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const loading = isLoading || isFetching;

  const getStatusColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ARCHIVED":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "ON_HOLD":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "PLANNING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toUpperCase()) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "LOW":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const filteredProjects = projects.filter(
    (p: Project) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading boards...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Project Boards">
      <div className="space-y-8 pb-12">
        {/* Boards Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest">
                Agile Hub
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Interactive Boards
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xl">
              Jump directly into your active project boards to manage sprints,
              tasks, and team velocity.
            </p>
          </div>
        </div>

        {/* Compact Controls Bar */}
        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1 group">
            <KanbanSquare className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a board..."
              className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs sm:text-sm text-gray-900 font-bold placeholder-gray-400 outline-none focus:bg-white focus:border-blue-100 transition-all"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
            <KanbanSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-1">
              No boards found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {filteredProjects.map((project: Project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={
                  project.description || "Active agile execution board."
                }
                icon={KanbanSquare}
                href={`/member/projects/${project.id}/board`}
                status={project.status}
                statusColor={getStatusBg(project.status)}
                sideBorderColor="bg-blue-500"
                footerLeft={
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.teamMemberIds?.length || 0}</span>
                  </div>
                }
                footerRight={
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Launch <ArrowRight className="w-3 h-3" />
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
