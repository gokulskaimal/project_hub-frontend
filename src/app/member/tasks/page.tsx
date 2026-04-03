"use client";

import React, { useState } from "react";
import { Task } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { Card } from "@/components/ui/Card";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import {
  useGetMyTasksQuery,
  useUpdateTaskMutation,
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

export default function MemberTasksPage() {
  const { user } = useAuth();
  const {
    data: tasksData,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyTasksQuery({ page: 1, limit: 100 }, { skip: !user });

  const tasks = tasksData?.items || [];

  const { data: orgUsers = [], isLoading: usersLoading } =
    useGetOrganizationUsersQuery(undefined, { skip: !user });

  const [updateTask] = useUpdateTaskMutation();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const loading = isLoading || isFetching || usersLoading;

  const handleStatusChange = async (
    taskId: string,
    newStatus: string,
    projectId: string,
  ) => {
    try {
      await updateTask({
        id: taskId,
        data: { status: newStatus as Task["status"] },
        projectId,
      }).unwrap();
      notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
    } catch (error) {
      notifier.error(error, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  // Stats Logic
  const stats = {
    total: tasks.length,
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
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest">
                Mission Log
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Workspace Tasks
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xl">
              You have{" "}
              <span className="text-white font-bold">
                {stats.total} total assignments
              </span>
              . Currently{" "}
              <span className="text-red-400 font-bold">
                {stats.critical} critical tasks
              </span>{" "}
              need immediate action.
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
              label: "Critical",
              value: stats.critical,
              icon: AlertCircle,
              color: "red",
            },
            {
              label: "Done",
              value: stats.completed,
              icon: CheckCircle2,
              color: "green",
            },
          ]}
        />

        {/* Compact Controls Bar */}
        <div className="flex items-center gap-2 bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[120px] group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
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
              aria-label="Filter tasks by status"
              className="w-20 sm:w-32 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter tasks by priority"
              className="w-20 sm:w-32 px-1 py-1.5 bg-gray-50 border border-transparent rounded-lg text-xs text-gray-700 font-black uppercase tracking-wider outline-none focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Priority</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Med</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">
              No tasks found
            </h3>
            <p className="text-gray-500 text-sm">You&apos;re all caught up!</p>
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
                      className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                }
                footerRight={
                  task.dueDate && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )
                }
              >
                <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">
                  {task.project?.name || "Project"}
                </div>
              </EntityCard>
            ))}
          </div>
        )}
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
