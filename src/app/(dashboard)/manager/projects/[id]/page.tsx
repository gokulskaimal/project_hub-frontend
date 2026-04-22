"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import { extractErrorMessage } from "@/utils/api";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  Search,
  LayoutGrid,
  Layout,
  Clock,
  AlertCircle,
  MessageSquare,
  Rows,
  Layers,
  Play,
  PenLine,
  PanelRight,
  Plus,
  BarChart3,
} from "lucide-react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import BacklogList from "@/components/dashboard/BacklogList";
import { Task, Sprint } from "@/types/project";
import { User } from "@/types/auth";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import CreateSprintModal from "@/components/modals/CreateSprintModal";
import ProjectChat from "@/components/chat/ProjectChat";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import VelocityChart from "@/components/analytics/VelocityChart";
import MemberContributionChart from "@/components/analytics/MemberContributionChart";
import ProjectBurnUpChart from "@/components/analytics/ProjectBurnUpChart";
import SprintCapacity from "@/components/analytics/SprintCapacity";
import EpicListing from "@/components/dashboard/EpicListing";
import EpicProgressTracker from "@/components/analytics/EpicProgressTracker";
import SprintBurndownChart from "@/components/analytics/SprintBurndownChart";
import SprintMetricsGrid from "@/components/analytics/SprintMetricsGrid";
import StartSprintModal from "@/components/modals/StartSprintModal";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import ProjectFilters from "@/components/project/ProjectFilters";
import { USER_ROLES } from "@/utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectMembersQuery,
  useGetProjectSprintsQuery,
  useGetProjectVelocityQuery,
  useDeleteTaskMutation,
  useDeleteSprintMutation,
  useUpdateSprintMutation,
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from "@/store/api/projectApiSlice";

import ProjectDetailsHeader from "@/components/project/ProjectDetailsHeader";
import ProjectDetailsSidebar from "@/components/project/ProjectDetailsSidebar";
import ProjectStatsCards from "@/components/project/ProjectStatsCards";
import SprintSelectorHeader from "@/components/project/SprintSelectorHeader";
import AddProjectMemberModal from "@/components/modals/AddProjectMemberModal";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Auth State
  const role = useSelector((state: RootState) => state.auth.role);
  const isManager =
    role === USER_ROLES.ORG_MANAGER ||
    role === USER_ROLES.SUPER_ADMIN ||
    role === "ADMIN";

  // RTK Query Hooks
  const { data: project, isLoading: projectLoading } =
    useGetProjectByIdQuery(projectId);
  const {
    data: rawTasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetProjectTasksQuery({ projectId });

  const tasks = useMemo(() => {
    if (Array.isArray(rawTasks)) return rawTasks;
    return rawTasks?.items || [];
  }, [rawTasks]);
  const {
    data: sprints = [],
    isLoading: sprintsLoading,
    refetch: refetchSprints,
  } = useGetProjectSprintsQuery(projectId);
  const { data: projectMembers = [], isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId);
  const { data: velocityData } = useGetProjectVelocityQuery({
    projectId,
    days: 7,
  });
  const projectVelocity = velocityData?.totalPoints ?? null;

  // Mutations
  const [deleteTask] = useDeleteTaskMutation();
  const [deleteSprint] = useDeleteSprintMutation();
  const [updateSprint] = useUpdateSprintMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [createTask] = useCreateTaskMutation();

  const [activeTab, setActiveTab] = useState<
    "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS" | "EPICS"
  >("TASKS");

  // Filter & Search State via Custom Hook
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isStartSprintOpen, setIsStartSprintOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  // UI State: Sidebar Toggle (Professional Style)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sprint State
  const [selectedSprintId, setSelectedSprintId] = useState<string>("ACTIVE");

  // Backlog Pagination State
  const [backlogPage, setBacklogPage] = useState(1);
  const [allBacklogTasks, setAllBacklogTasks] = useState<Task[]>([]);

  // Fetch paginated backlog specifically
  const { data: backlogData, isFetching: backlogLoading } =
    useGetProjectTasksQuery({
      projectId,
      page: backlogPage,
      limit: 12,
      isInBacklog: true,
    });

  // Accumulate backlog tasks
  useEffect(() => {
    if (backlogData && "items" in backlogData) {
      if (backlogPage === 1) {
        setAllBacklogTasks(backlogData.items);
      } else {
        setAllBacklogTasks((prev) => {
          const newItems = backlogData.items.filter(
            (nt: Task) => !prev.find((pt) => pt.id === nt.id),
          );
          return [...prev, ...newItems];
        });
      }
    } else if (Array.isArray(backlogData) && backlogPage === 1) {
      setAllBacklogTasks(backlogData);
    }
  }, [backlogData, backlogPage]);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: Task) => t.status === "DONE").length;
  const highPriorityTasks = tasks.filter(
    (t: Task) => t.priority === "HIGH" || t.priority === "CRITICAL",
  ).length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTasks = tasks.filter(
    (t: Task) =>
      t.dueDate && new Date(t.dueDate) >= today && t.status !== "DONE",
  ).length;

  // Get Team Members
  const teamMembers = projectMembers;

  // Determine Active Sprint & Selected Sprint
  const activeSprint = sprints.find((s: Sprint) => s.status === "ACTIVE");
  const selectedSprint =
    selectedSprintId === "ACTIVE"
      ? activeSprint
      : sprints.find((s: Sprint) => s.id === selectedSprintId);

  // Split into Active Board vs Backlog
  const backlogTasks = useMemo(
    () => filteredTasks.filter((t: Task) => !t.sprintId && t.type !== "EPIC"),
    [filteredTasks],
  );
  const boardTasks = useMemo(
    () =>
      filteredTasks.filter(
        (t: Task) =>
          t.sprintId &&
          t.type !== "EPIC" &&
          selectedSprint &&
          String(t.sprintId) === String(selectedSprint.id),
      ),
    [filteredTasks, selectedSprint],
  );

  // Socket Listeners
  const { socket, isConnected, syncTimestamp } = useSocket();

  // Reconnection Sync
  useEffect(() => {
    if (syncTimestamp > 0) {
      refetchTasks();
      refetchSprints();
    }
  }, [syncTimestamp, refetchTasks, refetchSprints]);
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskCreated = (newTask: Task) => {
      if (String(newTask.projectId) === String(projectId)) {
        refetchTasks();
        notifier.success(`New task: ${newTask.title}`);
      }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      if (String(updatedTask.projectId) === String(projectId)) {
        refetchTasks();
        notifier.success(MESSAGES.GENERAL.SUCCESS);
      }
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [socket, isConnected, projectId, refetchTasks]);

  const loading =
    projectLoading || tasksLoading || membersLoading || sprintsLoading;

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openEditSprintModal = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };

  const handleModalSuccess = (type?: Task["type"]) => {
    refetchTasks();
    if (type === "EPIC") {
      setActiveTab("EPICS");
    }
  };
  const handleSprintSuccess = () => {
    refetchSprints();
    refetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = await confirmWithAlert(
      "Are you sure?",
      "You won't be able to revert this!",
    );
    if (confirmed) {
      try {
        await deleteTask({ id: taskId, projectId }).unwrap();
        notifier.success(MESSAGES.TASKS.DELETE_SUCCESS);
      } catch (err) {
        notifier.error(err, MESSAGES.TASKS.DELETE_FAILED);
      }
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    const confirmed = await confirmWithAlert(
      "Are you sure?",
      "All tasks in this sprint will move back to the backlog.",
    );
    if (confirmed) {
      try {
        await deleteSprint({ id: sprintId, projectId }).unwrap();
        notifier.success(MESSAGES.SPRINTS.DELETE_SUCCESS);
        setSelectedSprintId("ACTIVE");
      } catch (err) {
        notifier.error(err, MESSAGES.SPRINTS.DELETE_FAILED);
      }
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    const confirmed = await confirmWithAlert(
      "Complete Sprint?",
      `Are you sure you want to complete ${activeSprint.name}? All unfinished tasks will move to backlog.`,
    );
    if (confirmed) {
      try {
        await updateSprint({
          id: activeSprint.id,
          projectId,
          data: { status: "COMPLETED" },
        }).unwrap();
        notifier.success(MESSAGES.SPRINTS.COMPLETE_SUCCESS);
      } catch (err) {
        notifier.error(err, MESSAGES.SPRINTS.UPDATE_FAILED);
      }
    }
  };

  const handleMoveToSprint = async (taskId: string) => {
    if (!selectedSprint) {
      notifier.error(null, MESSAGES.VALIDATION.SELECT_PROJECT);
      return;
    }
    try {
      await updateTask({
        id: taskId,
        projectId,
        data: { sprintId: selectedSprint.id, status: "TODO" },
      }).unwrap();
      notifier.success(MESSAGES.SPRINTS.MOVED_TO_SPRINT(selectedSprint.name));
    } catch (err) {
      notifier.error(err, MESSAGES.TASKS.UPDATE_SUCCESS);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask({
        id: taskId,
        projectId,
        data: { status: newStatus as Task["status"] },
      }).unwrap();
      notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
    } catch (err) {
      notifier.error(err, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  const handleConfirmStartSprint = async (data: {
    goal: string;
    startDate: string;
    endDate: string;
  }) => {
    if (!selectedSprint) return;
    try {
      await updateSprint({
        id: selectedSprint.id,
        projectId,
        data: {
          ...data,
          status: "ACTIVE",
        },
      }).unwrap();
      notifier.success(MESSAGES.SPRINTS.START_SUCCESS);
      setIsStartSprintOpen(false);
      refetchSprints();
    } catch (err) {
      notifier.error(err, MESSAGES.SPRINTS.UPDATE_FAILED);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProjectDetailsHeader
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out">
          {activeTab === "CHAT" ? (
            <ProjectChat projectId={projectId} />
          ) : activeTab === "EPICS" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-primary" />
                  Epic Management
                </h2>
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 h-10 px-6 flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus size={16} />
                  Assemble New Epic
                </Button>
              </div>
              <EpicListing
                projectId={projectId}
                onEditEpic={openEditModal}
                onEditTask={openEditModal}
                onCreateEpic={openCreateModal}
              />
            </div>
          ) : activeTab === "CALENDAR" ? (
            <TaskCalendar
              tasks={tasks}
              projectId={projectId}
              projectMembers={projectMembers}
              onTaskUpdate={refetchTasks}
            />
          ) : activeTab === "ANALYTICS" ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Project Health Card */}
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-emerald-500/10 rounded-xl relative">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-xl animate-pulse-glow opacity-40"></div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground tracking-tight">
                        Project Health: On Track
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 whitespace-nowrap">
                        Tied to Average Velocity: {projectVelocity || 0} pts/wk
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-xs w-full relative z-10">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Global Progress
                      </span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {project?.progress || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${project?.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sprint Wise Metrics */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Selected Sprint Scorecard
                  </h4>
                  <SprintMetricsGrid
                    selectedSprintId={selectedSprintId}
                    sprints={sprints}
                    tasks={tasks}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProjectBurnUpChart project={project!} tasks={tasks} />
                  <MemberContributionChart
                    tasks={tasks}
                    sprints={sprints}
                    selectedSprintId={selectedSprintId}
                  />

                  <VelocityChart sprints={sprints} tasks={tasks} />
                  <SprintCapacity
                    sprints={sprints}
                    tasks={tasks}
                    activeSprintId={selectedSprintId}
                  />

                  <div className="lg:col-span-2">
                    <SprintBurndownChart
                      sprint={
                        activeSprint ||
                        sprints.find((s) => s.id === selectedSprintId)!
                      }
                      tasks={tasks}
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <EpicProgressTracker projectId={projectId} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="space-y-6">
              {/* Real-time Analytics Header */}
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black text-foreground tracking-tighter flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Layout className="w-5 h-5 text-primary" />
                  </div>
                  System Intelligence
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Syncing Live
                  </span>
                </div>
              </div>

              <ProjectStatsCards
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                highPriorityTasks={highPriorityTasks}
                upcomingTasks={upcomingTasks}
              />

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
                <div className="flex gap-3">
                  {isManager && (
                    <>
                      <Button
                        onClick={openCreateModal}
                        className="bg-primary hover:bg-primary/90 h-10 px-6 flex items-center gap-2 shadow-lg shadow-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <Plus size={16} />
                        Add Task
                      </Button>
                      <Button
                        onClick={() => setIsSprintModalOpen(true)}
                        className="bg-secondary text-foreground hover:bg-secondary/80 h-10 px-6 flex items-center gap-2 border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <Plus size={16} />
                        New Sprint
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6">
                <SprintSelectorHeader
                  selectedSprintId={selectedSprintId}
                  setSelectedSprintId={setSelectedSprintId}
                  sprints={sprints}
                  isManager={isManager}
                  selectedSprint={selectedSprint || null}
                  onNewSprint={() => {
                    setEditingSprint(null);
                    setIsSprintModalOpen(true);
                  }}
                  onEditSprint={() =>
                    selectedSprint && openEditSprintModal(selectedSprint)
                  }
                  onCompleteSprint={handleCompleteSprint}
                  onStartSprint={() => setIsStartSprintOpen(true)}
                  onDeleteSprint={handleDeleteSprint}
                />

                {selectedSprint && (
                  <>
                    <SprintCapacity
                      sprints={sprints}
                      tasks={tasks}
                      activeSprintId={selectedSprint.id}
                    />
                    <KanbanBoard
                      tasks={boardTasks}
                      users={projectMembers}
                      onStatusChange={handleStatusChange}
                      onDeleteTask={handleDeleteTask}
                      onEditTask={openEditModal}
                      showProjectBadges={false}
                      projectId={projectId}
                      isReadOnly={selectedSprint?.status === "COMPLETED"}
                    />
                  </>
                )}

                {(!selectedSprint || selectedSprint.status !== "COMPLETED") && (
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Layers size={18} className="text-muted-foreground" />
                        Backlog
                        <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded text-[10px]">
                          {backlogTasks.length}
                        </span>
                      </h3>
                      {isManager && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(null);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 text-xs"
                        >
                          + Add Item
                        </Button>
                      )}
                    </div>
                    <BacklogList
                      tasks={allBacklogTasks}
                      users={projectMembers}
                      onMoveToBoard={handleMoveToSprint}
                      onEditTask={openEditModal}
                      onDeleteTask={handleDeleteTask}
                      isSidebarOpen={isSidebarOpen}
                      projectId={projectId}
                      hasMore={
                        backlogData && "page" in backlogData
                          ? backlogData.page < backlogData.totalPages
                          : false
                      }
                      onLoadMore={() => setBacklogPage((prev) => prev + 1)}
                      isLoadingMore={backlogLoading}
                      totalCount={
                        backlogData && "total" in backlogData
                          ? (backlogData as any).total
                          : backlogTasks.length
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isSidebarOpen && (
          <div className="w-full lg:w-[320px] shrink-0 sticky top-6 animate-in slide-in-from-right duration-500">
            <ProjectDetailsSidebar
              teamMembers={teamMembers}
              isManager={isManager}
              onAddMembers={() => setIsManageMembersOpen(true)}
            />
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        task={editingTask}
        projectMembers={teamMembers}
        onSuccess={handleModalSuccess}
      />
      <CreateSprintModal
        isOpen={isSprintModalOpen}
        onClose={() => {
          setIsSprintModalOpen(false);
          setEditingSprint(null);
        }}
        projectId={projectId}
        sprint={editingSprint}
        onSuccess={handleSprintSuccess}
      />
      <StartSprintModal
        isOpen={isStartSprintOpen}
        onClose={() => setIsStartSprintOpen(false)}
        onConfirm={handleConfirmStartSprint}
        sprintName={selectedSprint?.name || ""}
        taskCount={boardTasks.length}
      />
      {project && (
        <AddProjectMemberModal
          isOpen={isManageMembersOpen}
          onClose={() => setIsManageMembersOpen(false)}
          project={project}
          onSuccess={() => {
            // Tag invalidation in managerApiSlice handles the refetch
          }}
        />
      )}
    </div>
  );
}
