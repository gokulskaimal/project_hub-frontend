"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";
import {
  useDeleteManagerProjectMutation,
  useGetManagerProjectsQuery,
  useUpdateManagerProjectMutation,
} from "@/store/api/managerApiSlice";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MoreHorizontal,
  ArrowRight,
  Trash2,
  Edit2,
  X,
  Layout,
  CheckCircle2,
} from "lucide-react";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import { Project } from "@/types/project";
import { extractErrorMessage } from "@/utils/api";
import { getStatusColor, getPriorityColor } from "@/utils/projectUtils";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: projectsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerProjectsQuery({
    page,
    limit: 12,
    search: searchQuery,
    status: statusFilter,
    priority: priorityFilter,
  });

  const [updateProject] = useUpdateManagerProjectMutation();

  const handleMarkAsComplete = async (
    projectId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await updateProject({
        id: projectId,
        data: { status: "COMPLETED" },
      }).unwrap();

      notifier.success(MESSAGES.PROJECTS.COMPLETE_SUCCESS);
      setActiveActionId(null);
    } catch (err) {
      notifier.error(
        extractErrorMessage(err),
        MESSAGES.PROJECTS.COMPLETE_FAILED,
      );
    }
  };

  const projects = projectsData?.items || [];
  const [deleteProject] = useDeleteManagerProjectMutation();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter]);

  // Actions
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close menu
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirmWithAlert(
      "Are you sure you want to delete this project?",
      "This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      await deleteProject(id).unwrap();
      notifier.success(MESSAGES.PROJECTS.DELETE_SUCCESS);
    } catch (error) {
      notifier.error(
        extractErrorMessage(error),
        MESSAGES.PROJECTS.DELETE_FAILED,
      );
    }
    setActiveActionId(null);
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsEditModalOpen(true);
    setActiveActionId(null);
  };

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveActionId(activeActionId === id ? null : id);
  };

  // Stats Logic - Note: These now reflect the current page or specific counts
  const stats = {
    total: projectsData?.total || 0,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    planning: projects.filter((p) => p.status === "PLANNING").length,
  };

  return (
    <DashboardLayout title="Projects">
      {/* Header Actions - Moved New Project here */}
      <div className="flex justify-end mt-4 mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>
      <div className="space-y-8">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-foreground tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            Real-time Portfolio Analytics
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Live Feed
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Projects"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={Calendar}
            color="green"
          />
          <StatCard
            label="Planning"
            value={stats.planning}
            icon={Edit2}
            color="purple"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={ArrowRight}
            color="blue"
          />
        </div>

        {/* Controls - Admin Style */}
        <div className="bg-card p-4 rounded-2xl shadow-xl border border-border/50 mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project name or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl focus:bg-secondary/50 focus:border-primary/20 transition-all outline-none text-foreground font-bold placeholder-muted-foreground text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter projects by status"
                title="Filter projects by status"
                className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-foreground text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-secondary/50 focus:border-primary/20 transition-all"
              >
                <option value="ALL" className="bg-card">
                  Status: All
                </option>
                <option value="ACTIVE" className="bg-card">
                  Active
                </option>
                <option value="PLANNING" className="bg-card">
                  Planning
                </option>
                <option value="COMPLETED" className="bg-card">
                  Completed
                </option>
                <option value="ON_HOLD" className="bg-card">
                  On Hold
                </option>
              </select>
              <Filter className="w-3 h-3 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter projects by priority"
                title="Filter projects by priority"
                className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-foreground text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-secondary/50 focus:border-primary/20 transition-all"
              >
                <option value="ALL" className="bg-card">
                  Priority: All
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
                  Low
                </option>
              </select>
              <Filter className="w-3 h-3 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {(statusFilter !== "ALL" ||
              priorityFilter !== "ALL" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setPriorityFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all flex items-center gap-2"
                title="Clear Filters"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="bg-card/50 p-6 rounded-2xl border border-border/30 shadow-sm h-64 animate-pulse"
              >
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                <div className="h-20 bg-muted/50 rounded mb-4"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/30 border-dashed">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
              <Filter className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">
              No results match your search
            </h3>
            <p className="text-muted-foreground text-sm font-medium mb-8 max-w-xs mx-auto">
              We couldn&apos;t find any projects meeting those criteria. Try
              clarifying your terms.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
            >
              Start New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <EntityCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description || "No description provided."}
                icon={Calendar}
                href={`/manager/projects/${project.id}`}
                status={project.status || "PLANNING"}
                statusColor={getStatusColor(project.status)}
                footerLeft={
                  <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/50 rounded-lg group-hover:bg-secondary transition-colors">
                      <Users className="w-3 h-3 text-primary/70" />
                      <span>{project.teamMemberIds?.length || 0}</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-lg border leading-none ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority || "Medium"}
                    </div>
                  </div>
                }
                footerRight={
                  <div className="flex flex-col items-end gap-2 -mt-1 min-w-[100px]">
                    <span className="text-[10px] font-black text-foreground uppercase tracking-wider leading-none">
                      {project.progress || 0}% Done
                    </span>
                    <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden border border-border/10 shadow-inner">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                }
                actions={
                  <div className="relative">
                    <button
                      onClick={(e) => toggleActionMenu(project.id, e)}
                      className="p-2 bg-secondary/50 border border-border/30 rounded-xl text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95"
                      aria-label={`Actions for ${project.name}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeActionId === project.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl shadow-2xl border border-border/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 slide-in-from-top-2"
                      >
                        {project.status !== "COMPLETED" && (
                          <button
                            onClick={(e) => handleMarkAsComplete(project.id, e)}
                            className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 flex items-center gap-3 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Close Project
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEdit(project, e)}
                          className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-3 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modify Settings
                        </button>
                        <div className="mx-4 my-1 h-px bg-border/30" />
                        <button
                          onClick={(e) => handleDelete(project.id, e)}
                          className="w-full text-left px-4 py-2.5 text-xs font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 flex items-center gap-3 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Prune Project
                        </button>
                      </div>
                    )}
                  </div>
                }
              ></EntityCard>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={projectsData?.totalPages || 1}
          totalItems={projectsData?.total || 0}
          onPageChange={setPage}
        />
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={refetch}
        project={selectedProject}
      />
    </DashboardLayout>
  );
}
