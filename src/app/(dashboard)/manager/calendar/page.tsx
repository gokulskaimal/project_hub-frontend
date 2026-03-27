"use client";

import React from "react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import {
  useGetMyTasksQuery,
  useGetOrganizationUsersQuery,
} from "@/store/api/projectApiSlice";
import { useGetManagerProjectsQuery } from "@/store/api/managerApiSlice";

export default function ManagerCalendarPage() {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetMyTasksQuery();
  const {
    data: orgUsers = [],
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useGetOrganizationUsersQuery();
  const {
    data: projects = [],
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetManagerProjectsQuery();

  const loading = tasksLoading || usersLoading || projectsLoading;

  const handleTaskUpdate = () => {
    refetchTasks();
    refetchUsers();
    refetchProjects();
  };

  return (
    <DashboardLayout title="Organization Calendar">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
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
        </div>
      )}
    </DashboardLayout>
  );
}
