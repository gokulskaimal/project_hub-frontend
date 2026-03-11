"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import { projectService, Project } from "@/services/projectService";
import { sprintService, Sprint } from "@/services/sprintService";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { LayoutGrid } from "lucide-react";

export default function MemberProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket, isConnected } = useSocket();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedProject, fetchedTasks, fetchedUsers, fetchedSprints] =
        await Promise.all([
          projectService.getProject(projectId),
          taskService.getProjetTasks(projectId),
          userService.getOrganizationUsers(),
          sprintService.getProjectSprints(projectId),
        ]);
      setProject(fetchedProject);
      setTasks(fetchedTasks);
      setOrgUsers(fetchedUsers);
      setSprints(fetchedSprints);
    } catch (error) {
      toast.error("Failed to load board data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Socket Listeners for Real-time Updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskCreated = (newTask: Task) => {
      if (String(newTask.projectId) === String(projectId)) {
        setTasks((prev) => [newTask, ...prev]);
        toast.success(`New task added: ${newTask.taskKey}`);
      }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      if (String(updatedTask.projectId) === String(projectId)) {
        setTasks((prev) => {
          const exists = prev.find((t) => t.id === updatedTask.id);
          if (!exists) {
            return [updatedTask, ...prev];
          }
          return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        });
      }
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [socket, isConnected, projectId]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus as Task["status"] } : t,
        ),
      );
      await taskService.updateTask(taskId, {
        status: newStatus as Task["status"],
      });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      taskService.getProjetTasks(projectId).then(setTasks);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const boardTasks = tasks.filter(
    (t) =>
      t.sprintId &&
      activeSprint &&
      String(t.sprintId) === String(activeSprint.id),
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        {activeSprint ? (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {activeSprint.name}
              </h2>
              <p className="text-sm text-gray-500">Active Sprint</p>
            </div>
            <KanbanBoard
              tasks={boardTasks}
              users={orgUsers}
              onStatusChange={handleStatusChange}
              onEditTask={() => {}}
              showProjectBadges={false}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-4 h-full">
            <LayoutGrid className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No Active Sprint
            </h3>
            <p className="text-gray-500 text-center max-w-sm mb-6">
              There is no active sprint for this project right now. Tasks can
              only be pulled from the backlog during an active sprint. Please
              wait for your manager to start one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
