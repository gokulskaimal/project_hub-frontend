"use client";

import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task, taskService } from "@/services/taskService";
import { User } from "@/services/userService";
import {
  Trash2,
  Flag,
  Calendar as CalendarIcon,
  Play,
  Square,
  CornerDownRight,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import toast from "react-hot-toast";
import TaskDetailsModal from "@/components/modals/TaskDetailsModal";
import { motion } from "framer-motion";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  showProjectBadges?: boolean;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    color: "bg-gray-50/50",
    border: "border-gray-200",
    borderStyle: "border-dashed",
    titleColor: "text-gray-700",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "bg-blue-50/50",
    border: "border-blue-200",
    borderStyle: "border-dashed",
    titleColor: "text-blue-700",
  },
  {
    id: "REVIEW",
    title: "Review",
    color: "bg-yellow-50/50",
    border: "border-yellow-200",
    borderStyle: "border-dashed",
    titleColor: "text-yellow-700",
  },
  {
    id: "DONE",
    title: "Done",
    color: "bg-green-50/50",
    border: "border-green-200",
    borderStyle: "border-dashed",
    titleColor: "text-green-700",
  },
];

export default function KanbanBoard({
  tasks,
  users,
  onStatusChange,
  onDeleteTask,
  onEditTask,
  showProjectBadges = false,
}: KanbanBoardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  // Local state to force re-render for timer updates
  const [, setTick] = useState(0);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    // Timer interval to update UI every second for active timers
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    if (destination.droppableId === "DONE" && userRole !== "org-manager") {
      toast.error("Only Managers can move tasks to Done.");
      return;
    }

    // Optimistic Update
    if (destination.droppableId !== source.droppableId) {
      onStatusChange(draggableId, destination.droppableId);

      // Automatic Time Tracking Logic
      const task = tasks.find((t) => t.id === draggableId);
      if (task && task.assignedTo === user?.id) {
        // If moving TO In Progress -> Start Timer
        if (
          destination.droppableId === "IN_PROGRESS" &&
          source.droppableId !== "IN_PROGRESS"
        ) {
          try {
            await taskService.toggleTimer(task.id, "start");
            toast.success("Timer started automatically");
          } catch (error) {
            console.error("Auto-start timer failed", error);
          }
        }
        // If moving FROM In Progress -> Stop Timer
        else if (
          source.droppableId === "IN_PROGRESS" &&
          destination.droppableId !== "IN_PROGRESS"
        ) {
          const activeLog = task.timeLogs?.find(
            (l) => l.userId === user?.id && !l.endTime,
          );
          if (activeLog) {
            try {
              await taskService.toggleTimer(task.id, "stop");
              toast.success("Timer stopped automatically");
            } catch (error) {
              console.error("Auto-stop timer failed", error);
            }
          }
        }
      }
    }
  };

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status && !task.parentTaskId);
  const getUser = (userId?: string) => users.find((u) => u.id === userId);

  const formatDuration = (ms: number) => {
    if (!ms) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper to calculate total time including current active session
  const getDisplayTime = (task: Task) => {
    let total = task.totalTimeSpent || 0;
    const activeLog = task.timeLogs?.find(
      (l) => l.userId === user?.id && !l.endTime,
    );

    if (activeLog) {
      const currentSessionDuration =
        new Date().getTime() - new Date(activeLog.startTime).getTime();
      total += currentSessionDuration;
    }
    return formatDuration(total);
  };

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
      default:
        return (
          <span className="text-gray-500" title="Task">
            📋
          </span>
        );
    }
  };

  const handleToggleTimer = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const activeLog = task.timeLogs?.find(
      (l) => l.userId === user?.id && !l.endTime,
    );
    const isTracking = !!activeLog;

    try {
      const action = isTracking ? "stop" : "start";
      await taskService.toggleTimer(task.id, action);
      toast.success(isTracking ? "Timer Stopped" : "Timer Started");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to toggle timer");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-h-[500px] px-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex flex-col h-full min-w-[280px] flex-1 rounded-xl border-2 ${col.border} ${col.borderStyle} ${col.color} p-0`}
          >
            <div className="flex items-center justify-between p-4 pb-2">
              <h3
                className={`font-bold text-sm bg-transparent ${col.titleColor}`}
              >
                {col.title}
              </h3>
              <span className="text-xs font-semibold bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                {getTasksByStatus(col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 px-3 pb-3 space-y-3 transition-colors rounded-b-xl min-h-[100px] overflow-y-auto ${snapshot.isDraggingOver ? "bg-white/40" : ""}`}
                >
                  {getTasksByStatus(col.id).map((task, index) => {
                    const activeLog = task.timeLogs?.find(
                      (l) => l.userId === user?.id && !l.endTime,
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
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedTask(task);
                                setIsDetailsModalOpen(true);
                              }}
                              className={`bg-white p-4 rounded-xl border border-gray-100 group cursor-grab active:cursor-grabbing transition-shadow duration-200 ease-in-out ${snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-100" : "shadow-sm hover:shadow-md"}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col gap-1 pr-2">
                                  {task.parentTaskId && (
                                    <div className="flex items-center gap-1 w-fit bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-tight">
                                      <CornerDownRight
                                        size={10}
                                        className="text-slate-400"
                                      />
                                      Sub-task
                                    </div>
                                  )}
                                  <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 flex items-center gap-2">
                                    {getTypeIcon(task.type)}
                                    <span className="text-gray-400 text-xs font-mono">
                                      {task.taskKey}
                                    </span>
                                    {task.title}
                                  </h4>
                                </div>
                                {userRole === "org-manager" && (
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
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
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
                                  {/* Timer Button */}
                                  {task.assignedTo === user?.id && (
                                    <button
                                      onClick={(e) =>
                                        handleToggleTimer(e, task)
                                      }
                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                                        isTracking
                                          ? "bg-red-50 text-red-600 border-red-100 animate-pulse"
                                          : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
                                      }`}
                                    >
                                      {isTracking ? (
                                        <Square size={10} fill="currentColor" />
                                      ) : (
                                        <Play size={10} fill="currentColor" />
                                      )}
                                      {getDisplayTime(task)}
                                    </button>
                                  )}

                                  {task.assignedTo && (
                                    <UserAvatar
                                      user={getUser(task.assignedTo)}
                                      size="sm"
                                      className="w-6 h-6 text-[10px]"
                                    />
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
      />
    </DragDropContext>
  );
}
