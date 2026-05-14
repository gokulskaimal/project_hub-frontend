"use client";

import React, { useState } from "react";
import { Task } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";

import {
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckSquare,
} from "lucide-react";
import {
  useGetMyTasksQuery,
  useGetOrganizationUsersQuery,
} from "@/store/api/projectApiSlice";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
} from "@/utils/projectUtils";
import TaskDetailsModal from "@/components/modals/TaskDetailsModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";

export default function MemberTasksPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const {
    data: tasksData,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyTasksQuery({ page, limit: 12 }, { skip: !user });

  const tasks = tasksData?.items || [];
  const totalPages = tasksData?.totalPages || 1;
  const totalItems = tasksData?.total || 0;

  const { data: orgUsers = [], isLoading: usersLoading } =
    useGetOrganizationUsersQuery(undefined, { skip: !user });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loading = isLoading || isFetching || usersLoading;

  // Stats Logic
  const stats = {
    total: totalItems,
    pending: tasks.filter(
      (t: Task) => t.status === "TODO" || t.status === "IN_PROGRESS",
    ).length,
    completed: tasks.filter((t: Task) => t.status === "DONE").length,
    critical: tasks.filter(
      (t: Task) => t.priority === "CRITICAL" && t.status !== "DONE",
    ).length,
  };

  // Filter Logic
  const filteredTasks = tasks.filter((t: Task) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description &&
        t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="My Tasks">
      <div className="space-y-8 pb-12">
        {/* Task Overview Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-12 text-white shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                My Tasks
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-3">
              Task <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-xl leading-relaxed">
              Monitoring{" "}
              <span className="text-white font-black">
                {stats.total} total tasks
              </span>
              . Currently,{" "}
              <span className="text-rose-500 font-black">
                {stats.critical} important tasks
              </span>{" "}
              need your attention.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <PremiumStatGrid
          items={[
            {
              label: "Assigned",
              value: stats.total,
              icon: CheckSquare,
              color: "blue",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: Clock,
              color: "orange",
            },
            {
              label: "Urgent",
              value: stats.critical,
              icon: AlertCircle,
              color: "red",
            },
            {
              label: "Completed",
              value: stats.completed,
              icon: CheckCircle2,
              color: "green",
            },
          ]}
        />

        {/* Compact Controls Bar */}
        <div className="flex items-center gap-3 bg-card p-2 sm:p-3 rounded-2xl shadow-xl border border-border/50 overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
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
              aria-label="Filter tasks by status"
              className="w-24 sm:w-36 px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-[0.1em] outline-none hover:bg-secondary/40 focus:border-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                Status: All
              </option>
              <option value="TODO" className="bg-card">
                To Do
              </option>
              <option value="IN_PROGRESS" className="bg-card">
                In Progress
              </option>
              <option value="REVIEW" className="bg-card">
                Testing
              </option>
              <option value="DONE" className="bg-card">
                Completed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter tasks by priority"
              className="w-24 sm:w-36 px-4 py-2.5 bg-secondary/30 border border-transparent rounded-xl text-[10px] sm:text-xs text-foreground font-black uppercase tracking-[0.1em] outline-none hover:bg-secondary/40 focus:border-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-card">
                All Priority
              </option>
              <option value="CRITICAL" className="bg-card">
                Urgent
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
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border/30 border-dashed">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">
              No Tasks Found
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              No tasks found with these filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
            {filteredTasks.map((task: Task) => (
              <EntityCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description || "No description."}
                icon={CheckSquare}
                status={task.status}
                statusColor={getStatusColor(task.status)}
                sideBorderColor={
                  task.status === "DONE"
                    ? "bg-green-500"
                    : task.status === "IN_PROGRESS"
                      ? "bg-blue-500"
                      : task.status === "REVIEW"
                        ? "bg-purple-500"
                        : "bg-gray-400"
                }
                onClick={() => {
                  setSelectedTask(task);
                  setIsModalOpen(true);
                }}
                footerLeft={
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                }
                footerRight={
                  task.dueDate && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                      <Calendar className="w-3 h-3 text-primary/70" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )
                }
              >
                <div className="mt-3 text-[10px] font-black text-primary uppercase tracking-[0.15em] truncate group-hover:translate-x-1 transition-transform">
                  {task.project?.name || "General"}
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

      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        allTasks={tasks}
        users={orgUsers}
        currentUserId={user?.id || ""}
        userRole={user?.role}
        onTaskUpdated={() => refetch()}
        projectId={selectedTask?.projectId || ""}
      />
    </DashboardLayout>
  );
}
