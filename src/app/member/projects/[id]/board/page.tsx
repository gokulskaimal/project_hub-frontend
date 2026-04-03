"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectSprintsQuery,
  useGetProjectMembersQuery,
  useUpdateTaskMutation,
} from "@/store/api/projectApiSlice";
import { Task, Sprint } from "@/types/project";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { LayoutGrid } from "lucide-react";

export default function MemberProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    data: project,
    isLoading: projectLoading,
    isFetching: projectFetching,
  } = useGetProjectByIdQuery(projectId);

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    refetch: refetchTasks,
  } = useGetProjectTasksQuery(projectId);

  const {
    data: projectMembers = [],
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetProjectMembersQuery(projectId);

  const {
    data: sprints = [],
    isLoading: sprintsLoading,
    isFetching: sprintsFetching,
  } = useGetProjectSprintsQuery(projectId);

  const [updateTask] = useUpdateTaskMutation();

  const loading =
    projectLoading ||
    tasksLoading ||
    usersLoading ||
    sprintsLoading ||
    projectFetching ||
    tasksFetching ||
    usersFetching ||
    sprintsFetching;

  const { socket, isConnected } = useSocket();

  // Socket Listeners for Real-time Updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleDataChanged = () => {
      refetchTasks();
    };

    socket.on("task:created", handleDataChanged);
    socket.on("task:updated", handleDataChanged);

    return () => {
      socket.off("task:created", handleDataChanged);
      socket.off("task:updated", handleDataChanged);
    };
  }, [socket, isConnected, refetchTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeSprint = sprints.find((s: Sprint) => s.status === "ACTIVE");
  const boardTasks = tasks.filter(
    (t: Task) =>
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
              users={projectMembers}
              onStatusChange={handleStatusChange}
              onEditTask={() => {}}
              showProjectBadges={false}
              projectId={projectId}
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
