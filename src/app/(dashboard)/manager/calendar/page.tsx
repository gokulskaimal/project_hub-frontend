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
    <DashboardLayout title="Operational Schedule">
      <div className="space-y-8 pb-12">
        {/* Real-time Analytics Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              Chronos Analytics
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 opacity-70">
              Temporal distribution of all organizational nodes
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-2xl border border-border/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Live Matrix Sync
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Nodes In Orbit"
            value={stats.total}
            icon={Layout}
            color="blue"
          />
          <StatCard
            label="Priority Triggers"
            value={stats.highPriority}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            label="Upcoming Events"
            value={stats.upcoming}
            icon={Calendar}
            color="orange"
          />
          <StatCard
            label="Resolved Nodes"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {loading ? (
          <div className="flex h-full w-full items-center justify-center min-h-[500px] glass-card rounded-3xl border border-border/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Syncing Temporal Data...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
            <div className="mb-8">
              <h2 className="text-xl font-black text-foreground tracking-tighter uppercase">
                System Timeline
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
                Visualizing all task vectors and mission deadlines across
                organization nodes.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border/30 bg-secondary/10">
              <TaskCalendar
                tasks={tasks}
                projects={projects}
                projectId={undefined} // Undefined = Global Mode
                projectMembers={orgUsers}
                onTaskUpdate={handleTaskUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
