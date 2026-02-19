"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  Search,
  LayoutGrid,
  Clock,
  AlertCircle,
  MessageSquare,
  Rows,
  Layers,
  Play,
  PenLine,
  PanelRight,
  Plus,
} from "lucide-react";
import TaskCalendar from "@/components/dashboard/TaskCalendar";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import BacklogList from "@/components/dashboard/BacklogList";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import CreateSprintModal from "@/components/modals/CreateSprintModal";
import { PRIORITY_LEVELS, PROJECT_STATUS } from "@/utils/constants";
import ProjectChat from "@/components/chat/ProjectChat";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { projectService, Project } from "@/services/projectService";
import { sprintService, Sprint } from "@/services/sprintService";
import { Button } from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import VelocityChart from "@/components/analytics/VelocityChart";
import SprintCapacity from "@/components/analytics/SprintCapacity";
import EditSprintModal from "@/components/modals/EditSprintModal";
import { BarChart3 } from "lucide-react";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Auth State
  const role = useSelector((state: RootState) => state.auth.role);
  const isManager = role === "org-manager";

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS"
  >("TASKS");

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // UI State: Sidebar Toggle (Professional Style)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sprint State
  const [selectedSprintId, setSelectedSprintId] = useState<string>("ACTIVE");

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;

  // Get Team Members
  const teamMembers = orgUsers.filter((user) =>
    project?.teamMemberIds?.includes(user.id),
  );

  // Determine filtered tasks
  const filteredTasks = tasks.filter((task) => {
    if (!task) return false;
    const title = task.title || "";
    const desc = task.description || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    // Assignee Filter Logic
    let matchesAssignee = true;
    if (assigneeFilter !== "ALL") {
      if (assigneeFilter === "UNASSIGNED") {
        matchesAssignee = !task.assignedTo;
      } else {
        matchesAssignee = task.assignedTo === assigneeFilter;
      }
    }

    return matchesSearch && matchesStatus && matchesAssignee;
  });

  // Determine Active Sprint & Selected Sprint
  const activeSprint = sprints.find((s) => s.status === "ACTIVE");
  const selectedSprint =
    selectedSprintId === "ACTIVE"
      ? activeSprint
      : sprints.find((s) => s.id === selectedSprintId);

  // Split into Active Board vs Backlog
  // Backlog: Tasks with NO sprintId
  const backlogTasks = filteredTasks.filter((t) => !t.sprintId);

  // Board Tasks: Tasks belonging to the SELECTED sprint
  const boardTasks = filteredTasks.filter(
    (t) =>
      t.sprintId &&
      selectedSprint &&
      String(t.sprintId) === String(selectedSprint.id),
  );

  // [Real-time] Socket Listeners
  const { socket, isConnected } = useSocket();
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskCreated = (newTask: Task) => {
      // Normalize IDs for comparison
      if (String(newTask.projectId) === String(projectId)) {
        setTasks((prev) => {
          if (prev.find((t) => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
        toast.success(`New task: ${newTask.title}`);
      }
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      // Normalize IDs for comparison
      if (String(updatedTask.projectId) === String(projectId)) {
        console.log("DEBUG: Socket task:updated received:", updatedTask);
        if (!updatedTask.sprintId)
          console.warn(
            "DEBUG: WARNING - Socket task update MISSING sprintId!",
            updatedTask,
          );

        setTasks((prev) => {
          const exists = prev.find((t) => t.id === updatedTask.id);
          if (!exists) {
            return [updatedTask, ...prev];
          }
          // CHECK IF WE NEED TO MERGE
          // If updatedTask is missing props that 't' has, we should merge.
          // For now, let's just log and swap.
          return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        });
        toast.success("Task updated");
      }
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [socket, isConnected, projectId]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch Project Details, Tasks, and Users
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
    } catch (error: any) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh tasks
    taskService.getProjetTasks(projectId).then(setTasks);
  };

  const handleSprintSuccess = () => {
    // Refresh sprints and tasks
    Promise.all([
      sprintService.getProjectSprints(projectId),
      taskService.getProjetTasks(projectId),
    ]).then(([fetchedSprints, fetchedTasks]) => {
      setSprints(fetchedSprints);
      setTasks(fetchedTasks);
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await taskService.deleteTask(taskId);
        toast.success("Task deleted");
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (error: any) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleStartSprint = async () => {
    if (!selectedSprint) return;

    // Check if there is already an ACTIVE sprint
    if (activeSprint) {
      toast.error("There is already an active sprint. Complete it first.");
      return;
    }

    const result = await Swal.fire({
      title: "Start Sprint?",
      text: `Are you sure you want to start ${selectedSprint.name}?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Start Sprint",
      confirmButtonColor: "#2563EB",
    });

    if (result.isConfirmed) {
      try {
        await sprintService.updateSprint(selectedSprint.id, {
          status: "ACTIVE",
        });
        toast.success("Sprint Started!");
        handleSprintSuccess();
      } catch (error) {
        toast.error("Failed to start sprint");
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: newStatus as any } : t,
        ),
      );
      await taskService.updateTask(taskId, { status: newStatus as any });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      // Refresh to revert
      taskService.getProjetTasks(projectId).then(setTasks);
    }
  };

  const handleMoveToSprint = async (taskId: string) => {
    // We want to move the task to the CURRENTLY VIEWED sprint (Active or Planned)
    // First, check if a valid sprint is selected.
    if (!selectedSprint) {
      toast.error("Please select a valid sprint to move the task to.");
      return;
    }

    // Safety Check: Prevent moving to "Active View" if no sprint is active
    if (selectedSprintId === "ACTIVE" && !activeSprint) {
      toast.error(
        "No active sprint running. Please select a specific sprint or start one.",
      );
      return;
    }

    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, sprintId: selectedSprint.id, status: "TODO" }
            : t,
        ),
      );

      await taskService.updateTask(taskId, {
        sprintId: selectedSprint.id,
        status: "TODO",
      } as any);
      toast.success(`Moved to ${selectedSprint.name}`);
    } catch (error) {
      toast.error("Failed to move task");
      taskService.getProjetTasks(projectId).then(setTasks);
    }
  };

  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    const result = await Swal.fire({
      title: "Complete Sprint?",
      text: `Are you sure you want to complete ${activeSprint.name}? All unresolved tasks will be moved to Backlog.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Complete Sprint",
      confirmButtonColor: "#10B981",
    });

    if (result.isConfirmed) {
      try {
        await sprintService.updateSprint(activeSprint.id, {
          status: "COMPLETED",
        });
        toast.success("Sprint Completed!");
        handleSprintSuccess(); // Refresh data
      } catch (error) {
        toast.error("Failed to complete sprint");
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "Unassigned";
    const user = orgUsers.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("TASKS")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "TASKS"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Rows className="w-4 h-4" />
            List
          </div>
        </button>
        <button
          onClick={() => setActiveTab("CHAT")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "CHAT"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </div>
        </button>
        <button
          onClick={() => setActiveTab("CALENDAR")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "CALENDAR"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </div>
        </button>
        <button
          onClick={() => setActiveTab("ANALYTICS")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "ANALYTICS"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </div>
        </button>

        {/* Toggle Panel Button (Aligned Right in Tabs) */}
        <div className="ml-auto pb-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-md transition-colors flex items-center gap-2 text-xs font-medium border ${isSidebarOpen ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"}`}
            title={isSidebarOpen ? "Maximize Board" : "Show Details"}
          >
            <PanelRight className="w-4 h-4" />
            {isSidebarOpen ? "Hide Panel" : "Show Details"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Main Content: Tasks or Chat (Flexible Width) */}
        <div
          className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-full lg:w-[73%]" : "w-full lg:w-full"} space-y-6`}
        >
          {activeTab === "CHAT" ? (
            <ProjectChat projectId={projectId} />
          ) : activeTab === "CALENDAR" ? (
            <TaskCalendar
              tasks={tasks}
              projectId={projectId}
              projectMembers={orgUsers}
              onTaskUpdate={() =>
                taskService.getProjetTasks(projectId).then(setTasks)
              }
            />
          ) : activeTab === "ANALYTICS" ? (
            <div className="space-y-6">
              <VelocityChart sprints={sprints} tasks={tasks} />

              {/* Placeholder for future analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm opacity-60">
                  <h3 className="font-bold text-gray-700 mb-2">
                    Completion Rate
                  </h3>
                  <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Total Tasks
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {totalTasks}
                    </h3>
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Pending
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-orange-600">
                      {
                        tasks.filter(
                          (t) =>
                            t.status === "TODO" || t.status === "IN_PROGRESS",
                        ).length
                      }
                    </h3>
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Critical
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-red-600">
                      {
                        tasks.filter(
                          (t) =>
                            t.priority === "CRITICAL" && t.status !== "DONE",
                        ).length
                      }
                    </h3>
                    <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Completed
                  </p>
                  <div className="flex items-end justify-between mt-2">
                    <h3 className="text-2xl font-bold text-green-600">
                      {completedTasks}
                    </h3>
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <Button
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-gray-900 flex items-center gap-2 shadow-sm order-first md:order-last"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                  </Button>

                  {isManager && (
                    <Button
                      onClick={() => setIsSprintModalOpen(true)}
                      className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 flex items-center gap-2 shadow-sm order-first md:order-last"
                    >
                      <Plus className="w-4 h-4 text-gray-900 " />
                      <span className="text-gray-900">Create Sprint</span>
                    </Button>
                  )}

                  {/* Assignee Filter */}
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors max-w-[150px]"
                  >
                    <option value="ALL">All Assignees</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {teamMembers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <option value="ALL">All Status</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Done</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              {/* Empty State */}
              {filteredTasks.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                    📋
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    No tasks found
                  </h3>
                  <p className="text-gray-500 mt-1 text-sm">
                    No tasks match your current filters or search.
                  </p>
                  {(searchQuery ||
                    statusFilter !== "ALL" ||
                    assigneeFilter !== "ALL") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("ALL");
                        setAssigneeFilter("ALL");
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium underline underline-offset-2"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* SPRINT CONTROLS */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">
                        Sprint View:
                      </label>
                      <select
                        value={selectedSprintId}
                        onChange={(e) => setSelectedSprintId(e.target.value)}
                        className="border-gray-900 rounded-md text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-10"
                      >
                        <option value="ACTIVE">Current Active Sprint</option>
                        {sprints.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    {isManager && selectedSprint && (
                      <div className="flex items-center gap-2">
                        {/* EDIT BUTTON */}
                        <Button
                          onClick={() => setIsEditSprintModalOpen(true)}
                          variant="outline"
                          className="text-xs px-3 py-1.5 h-8 gap-2 border-gray-300 text-gray-700"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                          Start/Edit
                        </Button>

                        {/* START BUTTON (Only for Planned) */}
                        {selectedSprint.status === "PLANNED" && (
                          <Button
                            onClick={handleStartSprint}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 h-8 gap-2"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Start
                          </Button>
                        )}

                        {/* COMPLETE BUTTON (Only for Active) */}
                        {selectedSprint.status === "ACTIVE" && (
                          <Button
                            onClick={handleCompleteSprint}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 h-8 gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Active Board Section */}
                  {(boardTasks.length > 0 || selectedSprint) && (
                    <div className="w-full min-h-[600px] flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <Rows className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-800">
                          {selectedSprint
                            ? selectedSprint.name
                            : "No Sprint Selected"}
                        </h2>
                        {selectedSprint && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                              selectedSprint.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : selectedSprint.status === "COMPLETED"
                                  ? "bg-gray-100 text-gray-700 border-gray-200"
                                  : "bg-blue-100 text-blue-700 border-blue-200"
                            }`}
                          >
                            {selectedSprint.status}
                          </span>
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {boardTasks.length}
                        </span>
                      </div>
                      {selectedSprint && (
                        <SprintCapacity
                          sprints={sprints}
                          tasks={tasks}
                          activeSprintId={selectedSprint.id}
                        />
                      )}
                      <KanbanBoard
                        tasks={boardTasks}
                        users={orgUsers}
                        onStatusChange={handleStatusChange}
                        onDeleteTask={handleDeleteTask}
                        onEditTask={openEditModal}
                        showProjectBadges={false}
                      />
                    </div>
                  )}

                  {/* Backlog Section */}
                  <div className="pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-gray-500" />
                        <h2 className="text-lg font-bold text-gray-800">
                          Backlog
                        </h2>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          {backlogTasks.length}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openCreateModal}
                      >
                        + Add Item
                      </Button>
                    </div>
                    <BacklogList
                      tasks={backlogTasks}
                      users={orgUsers}
                      onMoveToBoard={handleMoveToSprint}
                      onEditTask={openEditModal}
                      onDeleteTask={handleDeleteTask}
                      isSidebarOpen={isSidebarOpen}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Panel: Team & Details (Collapsible) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? "w-full lg:w-[27%] opacity-100" : "w-0 opacity-0 lg:hidden"} space-y-6`}
        >
          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Team Members
              </h3>
            </div>

            <div className="space-y-3">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserAvatar
                      user={member}
                      size="sm"
                      className="w-8 h-8 text-xs"
                    />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm italic">
                  No team members assigned yet.
                </div>
              )}
            </div>
          </div>

          {/* Project Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Project Info
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {project?.startDate
                    ? formatDate(project.startDate)
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {project?.endDate ? formatDate(project.endDate) : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <span
                  className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                    project?.priority === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : project?.priority === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : project?.priority === "MEDIUM"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {project?.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        projectId={projectId}
        task={editingTask}
        projectMembers={orgUsers.filter((u) =>
          project?.teamMemberIds?.includes(u.id),
        )}
      />

      <CreateSprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSuccess={handleSprintSuccess}
        projectId={projectId}
      />

      <EditSprintModal
        isOpen={isEditSprintModalOpen}
        onClose={() => setIsEditSprintModalOpen(false)}
        onSuccess={handleSprintSuccess}
        sprint={selectedSprint || null}
      />
    </div>
  );
}
