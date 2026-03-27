"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";
import {
  useDeleteManagerProjectMutation,
  useGetManagerProjectsQuery,
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
} from "lucide-react";
import Link from "next/link";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import { Project } from "@/types/project";
import { extractErrorMessage } from "@/utils/api";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
} from "@/utils/projectUtils";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";

export default function ProjectsPage() {
  const [isModaOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: projects = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetManagerProjectsQuery();
  const [deleteProject] = useDeleteManagerProjectMutation();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || p.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats Logic
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
    planning: projects.filter((p) => p.status === "PLANNING").length,
  };

  return (
    <DashboardLayout title="Projects">
      {/* Header Actions - Moved New Project here */}
      <div className="flex justify-end mt-4 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
      <div className="space-y-8">
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder-gray-500 transition-all text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter projects by status"
                title="Filter projects by status"
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter projects by priority"
                title="Filter projects by priority"
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="ALL">All Priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
                title="Clear Filters"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 animate-pulse"
              >
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
                <div className="h-20 bg-gray-50 rounded mb-4"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No projects found
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Try adjusting your filters or create a new project
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
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
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.teamMemberIds?.length || 0}</span>
                    </div>
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority || "Medium"}
                    </div>
                  </div>
                }
                footerRight={
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {project.progress || 0}% Complete
                    </span>
                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                }
                className="relative"
              >
                {/* Floating Action Menu Overlay - Only visible if activeActionId matches */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => toggleActionMenu(project.id, e)}
                    className="p-1.5 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {activeActionId === project.id && (
                    <div
                      ref={actionMenuRef}
                      className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[30] animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        onClick={(e) => handleEdit(project, e)}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </EntityCard>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModaOpen}
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
