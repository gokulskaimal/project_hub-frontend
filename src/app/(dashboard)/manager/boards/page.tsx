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
  Search,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";

export default function GlobalBoardsPage() {
  const {
    data: projectsData = { items: [], total: 0 },
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerProjectsQuery({ page: 1, limit: 1000 });
  const [searchQuery, setSearchQuery] = useState("");

  const loading = isLoading || isFetching;

  const projects = projectsData.items;

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
    <DashboardLayout title="Board Command Center">
      <div className="space-y-10 sm:space-y-12 pb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card p-6 rounded-3xl border border-border/50 shadow-2xl">
          <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter uppercase">
              <div className="p-2 bg-primary/10 rounded-lg">
                <KanbanSquare className="w-6 h-6 text-primary" />
              </div>
              Project Boards
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-70">
              Select a project node to initialize the tactical execution board.
            </p>
          </div>
          <div className="w-full md:w-80 group relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tactical boards..."
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              System Performance
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 opacity-70">
              Live operational metrics across active partitions
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Matrix Sync
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Partitions"
            value={stats.total}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            label="Critical Nodes"
            value={stats.highPriority}
            icon={ShieldAlert}
            color="red"
          />
          <StatCard
            label="Operator Count"
            value={stats.totalMembers}
            icon={Users}
            color="purple"
          />
          <StatCard
            label="Mean Completion"
            value={`${stats.avgProgress}%`}
            icon={Target}
            color="green"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card/50 p-8 rounded-[2.5rem] border border-border/50 shadow-2xl h-56 animate-pulse"
              >
                <div className="h-6 bg-secondary/50 rounded-full w-3/4 mb-6"></div>
                <div className="h-4 bg-secondary/50 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
              <KanbanSquare className="w-12 h-12 text-primary opacity-40" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
              Null Board Matrix
            </h3>
            <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto leading-relaxed">
              No tactical boards match your current search parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project: Project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={
                  project.description || "Inert node without description."
                }
                icon={KanbanSquare}
                href={`/manager/projects/${project.id}/board`}
                status={project.status || "PLANNING"}
                statusColor={getStatusColor(project.status)}
                footerLeft={
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-secondary rounded-lg border border-border/50">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {project.members?.length || 0} OPERATORS
                    </span>
                  </div>
                }
                footerRight={
                  <span className="text-primary text-[10px] font-black tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform uppercase">
                    Access Board <ArrowRight className="w-4 h-4" />
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
