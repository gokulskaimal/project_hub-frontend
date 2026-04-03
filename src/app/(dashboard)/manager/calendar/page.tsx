"use client";

import React from "react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import {
  useGetMyTasksQuery,
  useGetOrganizationUsersQuery,
} from "@/store/api/projectApiSlice";
import { useGetManagerProjectsQuery } from "@/store/api/managerApiSlice";
import { StatCard } from "@/components/ui/StatCard";
import { Layout, AlertCircle, Calendar, CheckCircle } from "lucide-react";

export default function ManagerCalendarPage() {
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetMyTasksQuery({ page: 1, limit: 1000 });

  const tasks = React.useMemo(() => tasksData?.items || [], [tasksData]);
  const {
    data: orgUsers = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetOrganizationUsersQuery();
  const {
    data: projectsData = { items: [], total: 0 },
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetManagerProjectsQuery({ page: 1, limit: 1000 });

  const projects = projectsData.items;

  const loading = tasksLoading || usersLoading || projectsLoading;

  const handleTaskUpdate = () => {
    refetchTasks();
    refetchUsers();
    refetchProjects();
  };

  const stats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: tasks.length,
      highPriority: tasks.filter(
        (t) => t.priority === "HIGH" || t.priority === "CRITICAL",
      ).length,
      upcoming: tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today)
        .length,
      completed: tasks.filter((t) => t.status === "DONE").length,
    };
  }, [tasks]);

  return (
    <DashboardLayout title="Organization Calendar">
      <div className="space-y-8">
        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-blue-600" />
            Calendar Analytics
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
            label="Total Tasks"
            value={stats.total}
            icon={Layout}
            color="blue"
          />
          <StatCard
            label="High Priority"
            value={stats.highPriority}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {loading ? (
          <div className="flex h-full w-full items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Global Schedule
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              View all tasks and project deadlines across your organization.
            </p>
            <TaskCalendar
              tasks={tasks}
              projects={projects}
              projectId={undefined} // Undefined = Global Mode
              projectMembers={orgUsers}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
