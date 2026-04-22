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
    data: tasksData,
    isLoading: tasksLoading,
    refetch,
  } = useGetMyTasksQuery({ page: 1, limit: 1000 }, { skip: !user });

  const tasks = (tasksData?.items || []) as Task[];

  const { data: orgUsers = [], isLoading: usersLoading } =
    useGetOrganizationUsersQuery(undefined, { skip: !user });

  const [updateTask] = useUpdateTaskMutation();

  const loading = tasksLoading || usersLoading;

  const { socket, isConnected } = useSocket();

  // Socket Listeners
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
      <div className="flex items-center justify-center h-full bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-[0_0_20px_rgba(var(--primary),0.2)]"></div>
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] opacity-70">
            Syncing Neural Board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 bg-background">
      {/* Search and Filters Bar */}
      <div className="p-4 md:p-8 pb-4">
        <div className="bg-card p-5 rounded-3xl border border-border/50 shadow-2xl flex flex-col md:flex-row gap-5 items-center justify-between glass-card">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors focus-within:scale-110 duration-300" />
            <input
              type="text"
              placeholder="Query board nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/30 border border-border/10 rounded-2xl group hover:border-primary/20 transition-all">
              <Filter className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <select
                className="bg-transparent text-[10px] font-black text-foreground uppercase tracking-widest outline-none cursor-pointer"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL" className="bg-card">
                  Priority: ALL
                </option>
                <option value="LOW" className="bg-card text-emerald-500">
                  Low
                </option>
                <option value="MEDIUM" className="bg-card text-blue-500">
                  Medium
                </option>
                <option value="HIGH" className="bg-card text-amber-500">
                  High
                </option>
                <option value="CRITICAL" className="bg-card text-destructive">
                  Critical
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/30 border border-border/10 rounded-2xl group hover:border-primary/20 transition-all">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <select
                className="bg-transparent text-[10px] font-black text-foreground uppercase tracking-widest outline-none cursor-pointer max-w-[180px]"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="ALL" className="bg-card">
                  All Projects
                </option>
                {projects.map((p) => (
                  <option
                    key={p.id as string}
                    value={p.id as string}
                    className="bg-card"
                  >
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
