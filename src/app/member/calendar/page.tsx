"use client";

import React from "react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import {
  useGetMyTasksQuery,
  useGetMyProjectsQuery,
} from "@/store/api/projectApiSlice";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function GlobalCalendarPage() {
  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetMyTasksQuery();

  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetMyProjectsQuery();

  const tasks = React.useMemo(() => tasksData?.items || [], [tasksData]);
  const projects = React.useMemo(
    () => projectsData?.items || [],
    [projectsData],
  );

  const loading = tasksLoading || projectsLoading;

  const handleTaskUpdate = () => {
    refetchTasks();
    refetchProjects();
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Calendar">
      <div className="space-y-8 pb-12">
        {/* Calendar Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
                Calendar
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              My Schedule
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-xl">
              Track deadlines, milestones, and project timelines across your
              entire organization in one unified view.
            </p>
          </div>
        </div>

        <TaskCalendar
          tasks={tasks}
          projects={projects}
          projectId={undefined} // Undefined = Global Mode
          projectMembers={[]} // We don't pass project members here for simplified view
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </DashboardLayout>
  );
}
