"use client";

import { useState, useEffect, useMemo } from "react";
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
import SprintBurndownChart from "@/components/analytics/SprintBurndownChart";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import ProjectFilters from "@/components/project/ProjectFilters";
import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetProjectMembersQuery,
  useGetProjectSprintsQuery,
  useGetProjectVelocityQuery,
  useUpdateTaskMutation,
} from "@/store/api/projectApiSlice";

import MemberContributionChart from "@/components/analytics/MemberContributionChart";
import ProjectBurnUpChart from "@/components/analytics/ProjectBurnUpChart";
import { motion, AnimatePresence } from "framer-motion";

import ProjectDetailsHeader from "@/components/project/ProjectDetailsHeader";
import ProjectDetailsSidebar from "@/components/project/ProjectDetailsSidebar";
import ProjectStatsCards from "@/components/project/ProjectStatsCards";
import BacklogList from "@/components/dashboard/BacklogList";
import EpicListing from "@/components/dashboard/EpicListing";
import SprintSelectorHeader from "@/components/project/SprintSelectorHeader";
import { User } from "@/types/auth";
import AddProjectMemberModal from "@/components/modals/AddProjectMemberModal";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  BarChart,
  Target,
} from "lucide-react";
import EpicProgressTracker from "@/components/analytics/EpicProgressTracker";
import SprintMetricsGrid from "@/components/analytics/SprintMetricsGrid";

export default function MemberProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS" | "EPICS"
  >("TASKS");

  // Get Current User
  const { user } = useSelector((state: RootState) => state.auth);
  const isManager =
    user?.role === "ORG_MANAGER" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN";

  // RTK Query hooks
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useGetProjectByIdQuery(projectId);

  const {
    data: rawTasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetProjectTasksQuery({ projectId });

  const tasks = useMemo(() => {
    if (Array.isArray(rawTasks)) return rawTasks;
    return rawTasks?.items || [];
  }, [rawTasks]);

  const { data: projectMembers = [], isLoading: membersLoading } =
    useGetProjectMembersQuery(projectId);

  const {
    data: sprints = [],
    isLoading: sprintsLoading,
    refetch: refetchSprints,
  } = useGetProjectSprintsQuery(projectId);

  const { data: velocityData } = useGetProjectVelocityQuery({
    projectId,
    days: 7,
  });
  const projectVelocity = velocityData?.totalPoints || 0;

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
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

  // Sprint Selector & Backlog Pagination State
  const [selectedSprintId, setSelectedSprintId] = useState<string>("ACTIVE");
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

  const { socket, syncTimestamp } = useSocket();

  // Real-time Sprint Updates
  useEffect(() => {
    if (!socket) return;

    const handleSprintUpdate = () => {
      refetchSprints();
      refetchTasks();
    };

    socket.on("sprint:created", handleSprintUpdate);
    socket.on("sprint:active", handleSprintUpdate);
    socket.on("sprint:completed", handleSprintUpdate);
    socket.on("sprint:deleted", handleSprintUpdate);

    return () => {
      socket.off("sprint:created", handleSprintUpdate);
      socket.off("sprint:active", handleSprintUpdate);
      socket.off("sprint:completed", handleSprintUpdate);
      socket.off("sprint:deleted", handleSprintUpdate);
    };
  }, [socket, refetchSprints, refetchTasks]);

  // Reconnection Sync
  useEffect(() => {
    if (syncTimestamp > 0) {
      refetchTasks();
      refetchSprints();
    }
  }, [syncTimestamp, refetchTasks, refetchSprints]);

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

  const highPriorityTasks = tasks.filter(
    (t: Task) =>
      (t.priority === "HIGH" || t.priority === "CRITICAL") &&
      t.status !== "DONE",
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTasks = tasks.filter(
    (t: Task) =>
      t.dueDate && new Date(t.dueDate) >= today && t.status !== "DONE",
  ).length;

  // Secure Sprint Logic for Team Members
  const activeSprint = sprints.find((s: Sprint) => s.status === "ACTIVE");
  const selectedSprint =
    selectedSprintId === "ACTIVE"
      ? activeSprint
      : sprints.find((s: Sprint) => s.id === selectedSprintId);

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

  const backlogTasks = useMemo(
    () => filteredTasks.filter((t: Task) => !t.sprintId && t.type !== "EPIC"),
    [filteredTasks],
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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 min-w-0 transition-all duration-500 ease-in-out space-y-6">
          {activeTab === "CHAT" ? (
            <ProjectChat projectId={projectId} />
          ) : activeTab === "EPICS" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-6 h-6 text-purple-600" />
                  Project Roadmap
                </h2>
              </div>
              <EpicListing
                projectId={projectId}
                onEditEpic={() => {}}
                onEditTask={openEditModal}
                onCreateEpic={() => {}}
                isReadOnly={true}
              />
            </div>
          ) : activeTab === "CALENDAR" ? (
            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-2xl">
              <TaskCalendar
                tasks={tasks}
                projectId={projectId}
                projectMembers={projectMembers}
                onTaskUpdate={() => refetchTasks()}
              />
            </div>
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
                <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />

                  <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl relative border border-emerald-500/20">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-pulse blur-xl" />
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground tracking-tight">
                        Project Health: Nominal
                      </h3>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1.5 opacity-70">
                        Average Velocity:{" "}
                        <span className="text-emerald-500">
                          {projectVelocity || 0} PTS/WK
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 max-w-sm w-full relative z-10">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Global Progress
                      </span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] tabular-nums">
                        {project?.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project?.progress || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sprint Wise Metrics */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 opacity-70">
                    Internal Metric Spectrum
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
              <ProjectStatsCards
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                highPriorityTasks={highPriorityTasks}
                upcomingTasks={upcomingTasks}
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

              {/* Board Area */}
              <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border/50 shadow-2xl space-y-8">
                <SprintSelectorHeader
                  selectedSprintId={selectedSprintId}
                  setSelectedSprintId={setSelectedSprintId}
                  sprints={sprints}
                  isManager={false}
                  selectedSprint={selectedSprint || null}
                  onNewSprint={() => {}}
                  onCompleteSprint={() => {}}
                  onStartSprint={() => {}}
                  onEditSprint={() => {}}
                  onDeleteSprint={() => {}}
                />

                {!selectedSprint ? (
                  <div className="flex flex-col items-center justify-center p-16 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                      <LayoutGrid className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-2 tracking-tight">
                      No Operational Sprint
                    </h3>
                    <p className="text-muted-foreground text-center max-w-sm text-sm font-medium leading-relaxed">
                      All systems are currently idle. Select a historical node
                      or wait for mission command to initiate the next cycle.
                    </p>
                  </div>
                ) : (
                  <>
                    <SprintCapacity
                      sprints={sprints}
                      tasks={tasks} // normalized tasks
                      activeSprintId={selectedSprint.id}
                    />
                    <KanbanBoard
                      tasks={boardTasks}
                      users={projectMembers}
                      onStatusChange={handleStatusChange}
                      onEditTask={openEditModal}
                      showProjectBadges={false}
                      projectId={projectId}
                      isReadOnly={selectedSprint?.status === "COMPLETED"}
                    />
                  </>
                )}

                {(!selectedSprint || selectedSprint.status !== "COMPLETED") && (
                  <div className="pt-8 border-t border-border/30">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-black text-foreground flex items-center gap-3 uppercase tracking-tighter">
                        <Layers size={20} className="text-primary/70" />
                        Mission Backlog
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black border border-primary/20 tracking-widest">
                          {backlogTasks.length} NODES
                        </span>
                      </h3>
                    </div>
                    <BacklogList
                      tasks={allBacklogTasks}
                      users={projectMembers}
                      onMoveToBoard={() => {}} // Members cannot move to board
                      onEditTask={openEditModal}
                      onDeleteTask={() => {}} // Members cannot delete
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

        {/* Sidebar */}
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
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={(type) => {
          refetchTasks();
          if (type === "EPIC") {
            setActiveTab("EPICS");
          }
        }}
        projectId={projectId}
        projectMembers={teamMembers}
        task={editingTask}
      />
      {project && (
        <AddProjectMemberModal
          isOpen={isManageMembersOpen}
          onClose={() => setIsManageMembersOpen(false)}
          project={project}
          onSuccess={() => {
            // Tag invalidation handles the refetch
          }}
        />
      )}
    </div>
  );
}
