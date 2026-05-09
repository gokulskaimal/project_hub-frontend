"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectMembersQuery,
  useGetProjectSprintsQuery,
  useUpdateTaskMutation,
} from "@/store/api/projectApiSlice";
import { useUpdateManagerProjectMutation } from "@/store/api/managerApiSlice";
import { Sprint, Task } from "@/types/project";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { LayoutGrid, CheckCircle2, AlertCircle, Play } from "lucide-react";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { StatCard } from "@/components/ui/StatCard";
import MeetingSection from "@/components/Meeting/MeetingSection";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    data: project,
    isLoading: projectLoading,
    isFetching: projectFetching,
  } = useGetProjectByIdQuery(projectId);

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    refetch: refetchTasks,
  } = useGetProjectTasksQuery({ projectId });

  const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.items || [];

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
  const [updateManagerProject] = useUpdateManagerProjectMutation();

  const handleCompleteProject = async () => {
    if (confirm("Are you sure you want to mark this project as complete?")) {
      try {
        await updateManagerProject({
          id: projectId,
          data: { status: "COMPLETED" },
        }).unwrap();
        notifier.success(MESSAGES.PROJECTS.COMPLETE_SUCCESS);
      } catch (err) {
        notifier.error(err, MESSAGES.PROJECTS.COMPLETE_FAILED);
      }
    }
  };

  const loading =
    projectLoading ||
    tasksLoading ||
    usersLoading ||
    sprintsLoading ||
    projectFetching ||
    tasksFetching ||
    usersFetching ||
    sprintsFetching;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      notifier.success(MESSAGES.GENERAL.SUCCESS);
    } catch (err) {
      notifier.error(err, "Failed to update status");
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refetchTasks();
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

  // Header Stats
  const sprintTasksCount = boardTasks.length;
  const completedCount = boardTasks.filter(
    (t: Task) => t.status === "DONE",
  ).length;
  const inProgressCount = boardTasks.filter(
    (t: Task) => t.status === "IN_PROGRESS",
  ).length;
  const highPriorityCount = boardTasks.filter(
    (t: Task) => t.priority === "HIGH" || t.priority === "CRITICAL",
  ).length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Kanban Board Area */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        {activeSprint ? (
          <div className="h-full flex flex-col">
            <div className="mb-8 space-y-6">
              {/* Real-time Analytics Header */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <LayoutGrid className="w-8 h-8 text-blue-600" />
                    Real-time Analytics
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-full">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">
                        Live Sync
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {activeSprint.name} - Active Board
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCompleteProject}
                    disabled={project?.status === "COMPLETED"}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {project?.status === "COMPLETED"
                      ? "Project Completed"
                      : "Mark as Complete"}
                  </button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  label="Sprint Tasks"
                  value={sprintTasksCount}
                  icon={LayoutGrid}
                  color="blue"
                />
                <StatCard
                  label="Completed"
                  value={completedCount}
                  icon={CheckCircle2}
                  color="green"
                />
                <StatCard
                  label="In Progress"
                  value={inProgressCount}
                  icon={Play}
                  color="orange"
                />
                <StatCard
                  label="High Priority"
                  value={highPriorityCount}
                  icon={AlertCircle}
                  color="red"
                />
              </div>
            </div>
            <MeetingSection
              sprintId={activeSprint.id}
              projectId={projectId}
              isManager={true}
            />
            <KanbanBoard
              tasks={boardTasks}
              users={projectMembers}
              onStatusChange={handleStatusChange}
              onEditTask={openEditModal}
              showProjectBadges={false}
              projectId={projectId}
              isReadOnly={activeSprint.status === "COMPLETED"}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No Active Sprint
              </h3>
              <p className="text-gray-500 mt-1 max-w-sm">
                There is no active sprint right now. Go to the Overview tab to
                plan and start a new sprint.
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        projectId={projectId}
        task={editingTask}
        projectMembers={projectMembers}
      />
    </div>
  );
}
