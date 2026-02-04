"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task } from "@/services/taskService";
import { User } from "@/services/userService";
import { Calendar, MoreVertical } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[]; // To show assignee avatars
  onStatusChange: (taskId: string, newStatus: string) => void;
  onEditTask: (task: Task) => void; // Optional: to open edit modal
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

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { taskService } from "@/services/taskService";
import toast from "react-hot-toast";
import {
  Play,
  Square,
  Clock,
  Calendar as CalendarIcon,
  Flag,
  MoreHorizontal,
} from "lucide-react";

export default function KanbanBoard({
  tasks,
  users,
  onStatusChange,
  onEditTask,
  showProjectBadges = false,
}: KanbanBoardProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  // Normalize role to lowercase just in case
  const userRole = user?.role; // Already verified as Uppercase 'TEAM MEMBER' in DB usually, but let's stick to strict or loose check

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // ROLE CONSTRAINT CHECK
    if (destination.droppableId === "DONE" && userRole === "TEAM MEMBER") {
      toast.error("Only Managers can move tasks to Done.");
      return;
    }

    // Call the parent function to update API/State
    if (destination.droppableId !== source.droppableId) {
      onStatusChange(draggableId, destination.droppableId);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getUser = (userId?: string) => users.find((u) => u.id === userId);

  const formatDuration = (ms: number) => {
    if (!ms) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle timer");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4 items-start min-h-[500px] px-2">
        {COLUMNS.map((col) => (
          /* Column Container */
          <div
            key={col.id}
            className={`flex flex-col h-full min-w-[280px] flex-1 rounded-xl border-2 ${col.border} ${col.borderStyle} ${col.color} p-0`}
          >
            {/* Column Header */}
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

            {/* Droppable Area */}
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 px-3 pb-3 space-y-3 transition-colors rounded-b-xl min-h-[100px] overflow-y-auto ${
                    snapshot.isDraggingOver ? "bg-white/40" : ""
                  }`}
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
                            onClick={() => onEditTask(task)}
                            className={`
                            bg-white p-4 rounded-xl border border-gray-100
                            group cursor-grab active:cursor-grabbing
                            transition-all duration-200 ease-in-out
                            ${snapshot.isDragging ? "shadow-2xl scale-[1.02] z-50 ring-1 ring-gray-200" : "shadow-sm hover:shadow-md hover:-translate-y-0.5"}
                          `}
                            style={provided.draggableProps.style}
                          >
                            {/* Title & Options */}
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 pr-2">
                                {task.title}
                              </h4>
                              <button className="text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>

                            {/* Description (Optional - truncated) */}
                            {task.description && (
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            {/* Tags: Project & Priority */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {/* Project Tag (Pill) */}
                              {showProjectBadges && task.project?.name && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                  {task.project.name}
                                </span>
                              )}

                              {/* Priority Tag (Pill) */}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                  task.priority === "CRITICAL" ||
                                  task.priority === "HIGH"
                                    ? "bg-red-50 text-red-600"
                                    : task.priority === "MEDIUM"
                                      ? "bg-yellow-50 text-yellow-600"
                                      : "bg-green-50 text-green-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            {/* Footer: Date, Tracking, Avatar */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                              <div className="flex items-center gap-3">
                                {/* Flag Icon */}
                                <Flag
                                  size={14}
                                  className={`${task.priority === "CRITICAL" ? "text-red-500 fill-red-500" : "text-gray-300"}`}
                                />

                                {/* Due Date */}
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

                              {/* Right: Timer & Avatar */}
                              <div className="flex items-center gap-2">
                                {/* Timer */}
                                {task.assignedTo === user?.id && (
                                  <button
                                    onClick={(e) => handleToggleTimer(e, task)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                      isTracking
                                        ? "bg-red-50 text-red-600"
                                        : "bg-gray-50 text-gray-400 hover:text-gray-600"
                                    }`}
                                  >
                                    {isTracking ? (
                                      <Square size={10} fill="currentColor" />
                                    ) : (
                                      <Play size={10} fill="currentColor" />
                                    )}
                                    {formatDuration(task.totalTimeSpent || 0)}
                                  </button>
                                )}

                                {/* Avatar */}
                                {task.assignedTo && (
                                  <UserAvatar
                                    user={getUser(task.assignedTo)}
                                    size="sm"
                                    className="w-6 h-6 text-[10px]"
                                  />
                                )}
                              </div>
                            </div>
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
    </DragDropContext>
  );
}
