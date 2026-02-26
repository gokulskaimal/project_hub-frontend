"use client";

import React, { useEffect, useState } from "react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import { taskService, Task } from "@/services/taskService";
import { projectService, Project } from "@/services/projectService";
import { toast } from "react-hot-toast";

export default function GlobalCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [myTasks, myProjects] = await Promise.all([
        taskService.getMyTasks(),
        projectService.getMyProjects(),
      ]);
      setTasks(myTasks);
      setProjects(myProjects);
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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
        <p className="text-sm text-gray-500">
          View your deadlines and active projects.
        </p>
      </div>

      <TaskCalendar
        tasks={tasks}
        projects={projects}
        projectId={undefined} // Undefined = Global Mode
        projectMembers={[]} // We don't pass project members here for simplified view
        onTaskUpdate={fetchAllData}
      />
    </div>
  );
}
