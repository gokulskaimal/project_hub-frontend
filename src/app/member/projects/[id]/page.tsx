"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { Task, Sprint } from "@/types/project";
import { LayoutGrid } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import ProjectChat from "@/components/chat/ProjectChat";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import VelocityChart from "@/components/analytics/VelocityChart";
import SprintCapacity from "@/components/analytics/SprintCapacity";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import ProjectFilters from "@/components/project/ProjectFilters";
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectMembersQuery,
  useGetProjectSprintsQuery,
  useUpdateTaskMutation,
} from "@/store/api/projectApiSlice";

import ProjectDetailsHeader from "@/components/project/ProjectDetailsHeader";
import ProjectDetailsSidebar from "@/components/project/ProjectDetailsSidebar";
import ProjectStatsCards from "@/components/project/ProjectStatsCards";
import { User } from "@/types/auth";

export default function MemberProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS"
  >("TASKS");

  // Get Current User
  const { user } = useSelector((state: RootState) => state.auth);
  const isManager = user?.role === "ORG_MANAGER";

  // RTK Query hooks
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useGetProjectByIdQuery(projectId);

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetProjectTasksQuery(projectId);

  const { data: projectMembers = [], isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId);

  const { data: sprints = [], isLoading: sprintsLoading } =
    useGetProjectSprintsQuery(projectId);

  const [updateTask] = useUpdateTaskMutation();

  // Controls
  const {
    filteredTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assigneeFilter,
    setAssigneeFilter,
    priorityFilter,
    setPriorityFilter,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
  } = useTaskFilters(tasks);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { socket } = useSocket();

  // Check if project exists and redirect if not
  if (projectError) {
    notifier.error(projectError, "Project not found or has been deleted.");
    router.push("/member/dashboard");
  }

  if (!project && !projectLoading) {
    notifier.error(null, "Project not found.");
    router.push("/member/dashboard");
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({
        id: taskId,
        projectId,
        data: { status: newStatus as Task["status"] },
      }).unwrap();
      notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
    } catch (error) {
      notifier.error(error, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  // Project Members
  const teamMembers = projectMembers;

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsCreateTaskModalOpen(true);
  };

  // Total stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === "DONE").length;

  // Secure Sprint Logic for Team Members
  const activeSprint = sprints.find((s: Sprint) => s.status === "ACTIVE");
  const boardTasks = useMemo(
    () =>
      filteredTasks.filter(
        (t: Task) =>
          t.sprintId &&
          activeSprint &&
          String(t.sprintId) === String(activeSprint.id),
      ),
    [filteredTasks, activeSprint],
  );

  // Combined loading state
  const isLoading =
    projectLoading || tasksLoading || membersLoading || sprintsLoading;

  if (isLoading && !project && !tasks.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProjectDetailsHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div
          className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-full lg:w-3/4" : "w-full"} space-y-6`}
        >
          {activeTab === "CHAT" ? (
            <ProjectChat projectId={projectId} />
          ) : activeTab === "CALENDAR" ? (
            <TaskCalendar
              tasks={tasks}
              projectId={projectId}
              projectMembers={projectMembers}
              onTaskUpdate={() => refetchTasks()}
            />
          ) : activeTab === "ANALYTICS" ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Project Analytics
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <SprintCapacity
                    sprints={sprints}
                    tasks={tasks}
                    activeSprintId={activeSprint?.id}
                  />
                </div>
                <div className="mt-6">
                  <VelocityChart sprints={sprints} tasks={tasks} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ProjectStatsCards
                totalTasks={totalTasks}
                completedTasks={completedTasks}
              />

              {/* Controls Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full">
                  <ProjectFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    assigneeFilter={assigneeFilter}
                    setAssigneeFilter={setAssigneeFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    teamMembers={teamMembers}
                  />
                </div>
                {isManager && (
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setIsCreateTaskModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    + Create Task
                  </button>
                )}
              </div>

              {/* Board */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                {!activeSprint ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <LayoutGrid className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No Active Sprint
                    </h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      There is no active sprint for this project right now.
                      Please wait for your manager to start one.
                    </p>
                  </div>
                ) : (
                  <KanbanBoard
                    tasks={boardTasks}
                    users={projectMembers}
                    onStatusChange={handleStatusChange}
                    onEditTask={openEditModal}
                    showProjectBadges={false}
                    projectId={projectId}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {isSidebarOpen && <ProjectDetailsSidebar teamMembers={teamMembers} />}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => refetchTasks()}
        projectId={projectId}
        projectMembers={teamMembers}
        task={editingTask}
      />
    </div>
  );
}
