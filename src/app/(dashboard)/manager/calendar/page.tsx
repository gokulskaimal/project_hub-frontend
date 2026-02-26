"use client";

import React, { useEffect, useState } from "react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import { projectService, Project } from "@/services/projectService";
import { toast } from "react-hot-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function ManagerCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [myTasks, users, allProjects] = await Promise.all([
        taskService.getMyTasks(),
        userService.getOrganizationUsers(),
        projectService.getProjects(), // Managers fetch all org projects
      ]);

      setTasks(myTasks);
      setOrgUsers(users);
      setProjects(allProjects);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
              onTaskUpdate={fetchAllData}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
