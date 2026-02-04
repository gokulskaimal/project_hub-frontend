"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
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
  List,
  Plus,
  Clock,
  AlertCircle,
} from "lucide-react";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { PRIORITY_LEVELS, PROJECT_STATUS } from "@/utils/constants";
import ProjectChat from "@/components/chat/ProjectChat";
import { MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "@/context/SocketContext";
import { projectService, Project } from "@/services/projectService";
import UserAvatar from "@/components/ui/UserAvatar";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // Auth State
  const role = useSelector((state: RootState) => state.auth.role);
  const isManager = role === "org-manager";

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"LIST" | "BOARD">("LIST");
  const [activeTab, setActiveTab] = useState<"TASKS" | "CHAT">("TASKS");

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

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

  useEffect(() => {
    loadData();
  }, [projectId]);

  // [Real-time] Socket Listeners
  const { socket, isConnected } = useSocket();
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTaskCreated = (newTask: Task) => {
      if (String(newTask.projectId) === String(projectId)) {
        setTasks((prev) => [newTask, ...prev]);
        toast.success(`New task: ${newTask.title}`);
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

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Project Details, Tasks, and Users
      const [fetchedProject, fetchedTasks, fetchedUsers] = await Promise.all([
        projectService.getProject(projectId), // Assuming this exists or create it
        taskService.getProjetTasks(projectId),
        userService.getOrganizationUsers(),
      ]);
      setProject(fetchedProject);
      setTasks(fetchedTasks);
      setOrgUsers(fetchedUsers);
    } catch (error: any) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {project?.name || "Loading Project..."}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                project?.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : project?.status === "ON_HOLD"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {project?.status?.replace("_", " ") || "ACTIVE"}
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-2xl ml-9">
            {project?.description}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-9 md:ml-0">
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

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
            <LayoutGrid className="w-4 h-4" />
            Tasks
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content: Tasks or Chat */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "CHAT" ? (
            <ProjectChat projectId={projectId} />
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

              {/* Tasks Grid */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTasks.map((task) => {
                    const isDone = task.status === "DONE";
                    const isReview = task.status === "REVIEW";

                    // Lock Logic
                    const isLocked = isDone || (!isManager && isReview);
                    const canEdit = !isLocked;

                    return (
                      <div
                        key={task.id}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                      >
                        <div className="p-5 flex flex-col h-full">
                          {/* Header: Priority */}
                          <div className="flex justify-between items-start mb-3">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase ${
                                task.priority === "HIGH" ||
                                task.priority === "CRITICAL"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : task.priority === "MEDIUM"
                                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                                    : "bg-green-50 text-green-600 border border-green-100"
                              }`}
                            >
                              {task.priority}
                            </span>
                            {/* Manager Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                              {canEdit && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openEditModal(task)}
                                  className="h-7 w-7 p-0 rounded-md border-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                                >
                                  <Pencil size={12} />
                                </Button>
                              )}
                              {isManager && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-7 w-7 p-0 rounded-md border-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors pr-8">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                            {task.description || "No description provided."}
                          </p>

                          {/* Assignee & Date */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 mb-4">
                            <div className="flex items-center gap-2">
                              {task.assignedTo ? (
                                <>
                                  <UserAvatar
                                    user={orgUsers.find(
                                      (u) => u.id === task.assignedTo,
                                    )}
                                    size="sm"
                                    className="w-6 h-6 text-[10px]"
                                  />
                                  <span className="text-xs text-gray-600 truncate max-w-[80px]">
                                    {getUserName(task.assignedTo).split(" ")[0]}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </div>
                            {task.dueDate && (
                              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>

                          {/* Footer: Status Action */}
                          <div className="relative">
                            <div
                              className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${
                                task.status === "DONE"
                                  ? "bg-green-500"
                                  : task.status === "IN_PROGRESS"
                                    ? "bg-blue-500"
                                    : task.status === "REVIEW"
                                      ? "bg-purple-500"
                                      : "bg-gray-400"
                              }`}
                            ></div>
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(task.id, e.target.value)
                              }
                              disabled={isLocked}
                              className={`w-full appearance-none pl-4 pr-8 py-2.5 rounded-lg text-sm font-semibold outline-none border transition-all hover:bg-opacity-80 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                                task.status === "DONE"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : task.status === "IN_PROGRESS"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : task.status === "REVIEW"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-gray-50 text-gray-700 border-gray-200"
                              } ${isLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              {(isManager || task.status === "DONE") && (
                                <option value="DONE">Done</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Panel: Team & Details */}
        <div className="space-y-6">
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
    </div>
  );
}
