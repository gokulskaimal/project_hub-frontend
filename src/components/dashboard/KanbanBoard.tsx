"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task, TimeLog } from "@/types/project";
import { User } from "@/types/auth";
import { useToggleTaskTimerMutation } from "@/store/api/projectApiSlice";
import {
  Trash2,
  Flag,
  Calendar as CalendarIcon,
  CornerDownRight,
  Filter,
  Users,
  User as UserIcon,
  Layers,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import TaskDetailsModal from "@/components/modals/TaskDetailsModal";
import TaskTimer from "./TaskTimer";
import { motion } from "framer-motion";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  showProjectBadges?: boolean;
  projectId?: string;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    color: "bg-gray-100/30",
    border: "border-gray-200",
    accent: "bg-gray-400",
    titleColor: "text-gray-900",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "bg-blue-50/20",
    border: "border-blue-100",
    accent: "bg-blue-500",
    titleColor: "text-blue-900",
  },
  {
    id: "REVIEW",
    title: "In Review",
    color: "bg-amber-50/20",
    border: "border-amber-100",
    accent: "bg-amber-500",
    titleColor: "text-amber-900",
  },
  {
    id: "DONE",
    title: "Done",
    color: "bg-emerald-50/20",
    border: "border-emerald-100",
    accent: "bg-emerald-500",
    titleColor: "text-emerald-900",
  },
];

export default function KanbanBoard({
  tasks,
  users,
  onStatusChange,
  onDeleteTask,
  onEditTask,
  showProjectBadges = false,
  projectId: propProjectId,
}: KanbanBoardProps) {
  const [toggleTimer] = useToggleTaskTimerMutation();
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(
    userRole === "TEAM_MEMBER",
  );

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    if (
      destination.droppableId === "DONE" &&
      userRole !== "ORG_MANAGER" &&
      userRole !== "SUPER_ADMIN"
    ) {
      notifier.error(null, MESSAGES.GENERAL.FORBIDDEN);
      return;
    }

    // Optimistic Update
    if (destination.droppableId !== source.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  const getTasksByStatus = (status: string) => {
    let filtered = tasks.filter((task) => task.status === status);
    if (showOnlyMyTasks && user?.id) {
      filtered = filtered.filter((task) => task.assignedTo === user.id);
    }
    return filtered;
  };
  const getUser = (userId?: string) => users.find((u) => u.id === userId);

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "BUG":
        return (
          <span className="text-red-500" title="Bug">
            🐞
          </span>
        );
      case "STORY":
        return (
          <span className="text-blue-500" title="User Story">
            📘
          </span>
        );
      case "EPIC":
        return (
          <span className="text-purple-600" title="Epic">
            🏆
          </span>
        );
      default:
        return (
          <span className="text-gray-500" title="Task">
            📋
          </span>
        );
    }
  };

  const getEpicTitle = (epicId?: string) => {
    if (!epicId) return null;
    return tasks.find((t) => t.id === epicId)?.title;
  };

  const handleToggleTimer = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const activeLog = task.timeLogs?.find(
      (l: TimeLog) => l.userId === user?.id && !l.endTime,
    );
    const isTracking = !!activeLog;

    try {
      const action = isTracking ? "stop" : "start";
      await toggleTimer({
        id: task.id,
        action,
        projectId: task.projectId,
      }).unwrap();
      notifier.success(
        isTracking
          ? MESSAGES.TASKS.TIMER_STOPPED
          : MESSAGES.TASKS.TIMER_STARTED,
      );
    } catch (error) {
      notifier.error(error, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Kanban Controls Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        {userRole === "TEAM_MEMBER" && (
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-md p-1 rounded-xl border border-gray-100 flex gap-1 shadow-sm">
              <button
                onClick={() => setShowOnlyMyTasks(true)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  showOnlyMyTasks
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <UserIcon
                  size={12}
                  className={showOnlyMyTasks ? "animate-pulse" : ""}
                />
                My Tasks
              </button>
              <button
                onClick={() => setShowOnlyMyTasks(false)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  !showOnlyMyTasks
                    ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Users size={12} />
                Full Team
              </button>
            </div>

            {showOnlyMyTasks && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1.5"
              >
                <Filter size={10} />
                Focused View active
              </motion.span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {tasks.length} Sync&apos;d
        </div>
      </div>

      <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-h-[500px] px-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex flex-col h-full min-w-[300px] flex-1 rounded-2xl border ${col.border} ${col.color} p-0 shadow-sm transition-all duration-300`}
          >
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-6 rounded-full ${col.accent}`} />
                <h3
                  className={`font-black text-xs uppercase tracking-widest ${col.titleColor}`}
                >
                  {col.title}
                </h3>
              </div>
              <span className="text-[10px] font-black bg-white text-gray-500 px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
                {getTasksByStatus(col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 px-4 pb-4 space-y-4 transition-colors rounded-b-2xl min-h-[150px] overflow-y-auto ${snapshot.isDraggingOver ? "bg-white/40" : ""}`}
                >
                  {getTasksByStatus(col.id).map((task, index) => {
                    const activeLog = task.timeLogs?.find(
                      (l: TimeLog) => l.userId === user?.id && !l.endTime,
                    );
                    const isTracking = !!activeLog;

                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                            className="group"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedTask(task);
                                setIsDetailsModalOpen(true);
                              }}
                              className={`relative bg-white p-4 rounded-2xl border border-gray-100 cursor-grab active:cursor-grabbing transition-all duration-300 ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500/20 z-50 scale-105" : "shadow-sm hover:shadow-xl hover:border-blue-200"}`}
                            >
                              {/* Priority Indicator Dot */}
                              <div
                                className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                                  task.priority === "CRITICAL"
                                    ? "bg-red-500 animate-pulse"
                                    : task.priority === "HIGH"
                                      ? "bg-orange-500"
                                      : task.priority === "MEDIUM"
                                        ? "bg-blue-500"
                                        : "bg-emerald-500"
                                }`}
                              />
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1 pr-2">
                                  {task.epicId && (
                                    <div className="flex items-center gap-1 w-fit bg-purple-50 border border-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                                      <Layers
                                        size={10}
                                        className="text-purple-400"
                                      />
                                      {getEpicTitle(task.epicId)}
                                    </div>
                                  )}
                                  {task.parentTaskId && (
                                    <div className="flex items-center gap-1 w-fit bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-tight">
                                      <CornerDownRight
                                        size={10}
                                        className="text-slate-400"
                                      />
                                      Sub-task
                                    </div>
                                  )}
                                  <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 flex items-center gap-2">
                                    {getTypeIcon(task.type)}
                                    <span className="text-gray-400 text-xs font-mono">
                                      {task.taskKey}
                                    </span>
                                    {task.title}
                                  </h4>
                                </div>
                                {(userRole === "ORG_MANAGER" ||
                                  userRole === "SUPER_ADMIN") && (
                                  <div className="flex gap-1 items-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditTask(task);
                                      }}
                                      className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                      title="Edit Task Definition"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-pencil"
                                      >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                      </svg>
                                    </button>
                                    {onDeleteTask && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteTask(task.id);
                                        }}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete Task"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2 font-medium">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 mb-4">
                                {showProjectBadges && task.project?.name && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                    {task.project.name}
                                  </span>
                                )}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${task.priority === "CRITICAL" || task.priority === "HIGH" ? "bg-red-50 text-red-600" : task.priority === "MEDIUM" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"}`}
                                >
                                  {task.priority}
                                </span>
                                {(task.storyPoints || 0) > 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold border border-gray-200">
                                    {task.storyPoints}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-3">
                                  <Flag
                                    size={14}
                                    className={`${task.priority === "CRITICAL" ? "text-red-500 fill-red-500" : "text-gray-300"}`}
                                  />
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                      <CalendarIcon size={12} />
                                      <span>
                                        {new Date(
                                          task.dueDate,
                                        ).toLocaleDateString(undefined, {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Timer Component (Memoized) */}
                                  {task.assignedTo === user?.id && (
                                    <TaskTimer
                                      task={task}
                                      userId={user?.id}
                                      onToggle={handleToggleTimer}
                                    />
                                  )}

                                  {task.assignedTo && (
                                    <div className="flex items-center gap-2 group/assignee">
                                      <UserAvatar
                                        user={getUser(task.assignedTo)}
                                        size="sm"
                                        className="w-6 h-6 text-[10px] ring-2 ring-white shadow-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        allTasks={tasks}
        users={users}
        currentUserId={user?.id || ""}
        userRole={user?.role}
        onTaskUpdated={() => {
          // Instead of a full reload we can just signal a re-render.
          // You also typically want to resync the single task but the container will pull via websockets/polling soon
          // For immediate feedback, maybe a toast that WS handles the rest.
        }}
        projectId={propProjectId || ""}
      />
    </DragDropContext>
  );
}
