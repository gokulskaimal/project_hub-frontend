"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/project";
import { User } from "@/types/auth";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useUpdateTaskMutation,
  useGetMyTasksQuery,
  useGetOrganizationUsersQuery,
} from "@/store/api/projectApiSlice";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

export default function MemberTasksBoardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch,
  } = useGetMyTasksQuery(undefined, { skip: !user });

  const { data: orgUsers = [], isLoading: usersLoading } =
    useGetOrganizationUsersQuery(undefined, { skip: !user });

  const [updateTask] = useUpdateTaskMutation();

  const loading = tasksLoading || usersLoading;

  const { socket, isConnected } = useSocket();

  // Socket Listeners (Keep existing logic)
  useEffect(() => {
    if (!socket || !isConnected || !user) return;
    const handleRevalidate = () => refetch();
    const handleTaskCreated = (newTask: Task) => {
      if (newTask.assignedTo === user.id) {
        handleRevalidate();
        notifier.success(`New task assigned: ${newTask.title}`);
      }
    };
    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleRevalidate);
    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleRevalidate);
    };
  }, [socket, isConnected, user, refetch]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) throw new Error("Task not found");
      await updateTask({
        id: taskId,
        projectId: taskToUpdate.projectId,
        data: { status: newStatus as Task["status"] },
      }).unwrap();
      notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
    } catch (error) {
      notifier.error(error, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesProject =
      projectFilter === "ALL" || t.projectId === projectFilter;
    return matchesSearch && matchesPriority && matchesProject;
  });

  // Unique projects for filter
  const projects = Array.from(new Set(tasks.map((t) => t.projectId))).map(
    (id) => ({
      id,
      name:
        tasks.find((t) => t.projectId === id)?.project?.name ||
        "Unknown Project",
    }),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent shadow-sm"></div>
          <p className="text-gray-500 font-bold text-sm tracking-tight">
            Loading Board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-gray-50/50">
      {/* Search and Filters Bar */}
      <div className="p-4 md:p-6 pb-2">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">Priority: All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer max-w-[150px]"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden px-4 md:px-6 pb-6">
        <KanbanBoard
          tasks={filteredTasks}
          users={orgUsers}
          onStatusChange={handleStatusChange}
          onEditTask={() => {}}
          showProjectBadges={true}
        />
      </div>
    </div>
  );
}
