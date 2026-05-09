"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Calendar,
  Users,
  ArrowRight,
  Edit2,
  Search,
  Activity,
} from "lucide-react";
import { Project } from "@/types/project";
import { useGetMyProjectsQuery } from "@/store/api/projectApiSlice";
import { getStatusColor, getPriorityColor } from "@/utils/projectUtils";
import { EntityCard } from "@/components/ui/EntityCard";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import { motion } from "framer-motion";
import { Pagination } from "@/components/ui/Pagination";

export default function MemberProjectsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const {
    data: projectsData,
    isLoading,
    isFetching,
  } = useGetMyProjectsQuery({ page, limit: 12 }, { skip: !user });

  const projects = projectsData?.items || [];
  const totalPages = projectsData?.totalPages || 1;
  const totalItems = projectsData?.total || 0;

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
    total: totalItems,
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
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em]">
                Neural Portfolio
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-3">
              Project <span className="text-blue-500">Collection</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
              Managing{" "}
              <span className="text-white font-black">
                {stats.total} total projects
              </span>
              . Currently,{" "}
              <span className="text-emerald-400 font-black">
                {stats.active} systems
              </span>{" "}
              are in active operation status.
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
        <div className="flex items-center gap-3 bg-card p-2 sm:p-3 rounded-2xl shadow-xl border border-border/50 overflow-x-auto no-scrollbar">
          {/* Search */}
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Search project repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-xs sm:text-sm text-foreground font-bold placeholder-muted-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all"
            />
          </div>

          <div className="h-8 w-px bg-border/30 mx-1 shrink-0" />

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter projects by status"
              className="w-24 sm:w-36 px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-[0.1em] outline-none hover:bg-secondary/40 focus:border-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                Status: All
              </option>
              <option value="ACTIVE" className="bg-card">
                Active
              </option>
              <option value="COMPLETED" className="bg-card">
                Done
              </option>
              <option value="PLANNING" className="bg-card">
                Plan
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter projects by priority"
              className="w-24 sm:w-36 px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-[0.1em] outline-none hover:bg-secondary/40 focus:border-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                All Priority
              </option>
              <option value="CRITICAL" className="bg-card">
                Critical
              </option>
              <option value="HIGH" className="bg-card">
                High
              </option>
              <option value="MEDIUM" className="bg-card">
                Medium
              </option>
              <option value="LOW" className="bg-card">
                Low Gear
              </option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "name" | "newest" | "oldest")
              }
              aria-label="Sort projects by"
              className="w-24 sm:w-36 px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-[0.1em] outline-none hover:bg-secondary/40 focus:border-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="newest" className="bg-card">
                Newest First
              </option>
              <option value="oldest" className="bg-card">
                Oldest First
              </option>
              <option value="name" className="bg-card">
                Name (A-Z)
              </option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/30 border-dashed">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">
              Operational Static
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Try adjusting your search or filter spectrum.
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
                  <div className="flex items-center gap-4 text-xs font-black text-muted-foreground">
                    <div className="flex items-center gap-2 group/members">
                      <Users className="w-4 h-4 text-primary/70 group-hover/members:text-primary transition-colors" />
                      <span className="group-hover/members:text-foreground transition-colors">
                        {project.teamMemberIds?.length || 0}
                      </span>
                    </div>
                  </div>
                }
                footerRight={
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest tabular-nums">
                      {project.progress || 0}%
                    </span>
                    <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden border border-border/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                      />
                    </div>
                  </div>
                }
              >
                <div className="mt-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black border border-current/20 uppercase tracking-widest ${getPriorityColor(project.priority)}`}
                  >
                    {project.priority}
                  </span>
                </div>
              </EntityCard>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
