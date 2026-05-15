"use client";

import { useState } from "react";
import { useGetMyProjectsQuery } from "@/store/api/projectApiSlice";
import { Project } from "@/types/project";
import { KanbanSquare, ArrowRight, Users, LayoutDashboard } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { EntityCard } from "@/components/ui/EntityCard";
import { getStatusColor as getStatusBg } from "@/utils/projectUtils";

export default function MemberBoardsPage() {
  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useGetMyProjectsQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const loading = isLoading || isFetching;

  const projectList = Array.isArray(projects)
    ? projects
    : projects?.items || [];

  const filteredProjects = projectList.filter(
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
      <div className="space-y-10 sm:space-y-12 pb-12">
        {/* Boards Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-card px-8 py-12 sm:px-12 sm:py-16 border border-border/50 shadow-2xl group">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-primary/10 blur-[100px] group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                Board Management
              </span>
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-4 uppercase">
              Project <span className="text-primary">Boards</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium max-w-xl leading-relaxed">
              Launch directly into active project sections to coordinate
              sprints, tasks, and project velocity.
            </p>
          </div>
        </div>

        {/* Compact Controls Bar */}
        <div className="bg-card p-4 rounded-3xl border border-border/50 shadow-2xl flex flex-col md:flex-row gap-5 items-center">
          <div className="relative flex-1 group w-full">
            <KanbanSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-32 bg-card/30 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
              <KanbanSquare className="w-12 h-12 text-primary opacity-40 mx-auto" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
              No Boards Found
            </h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              No boards found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project: Project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description || "Awaiting project data..."}
                icon={KanbanSquare}
                href={`/member/projects/${project.id}/board`}
                status={project.status}
                statusColor={getStatusBg(project.status)}
                footerLeft={
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-secondary rounded-lg border border-border/50">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      {project.members?.length || 0} Members
                    </span>
                  </div>
                }
                footerRight={
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    View Board <ArrowRight className="w-3.5 h-3.5" />
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
