"use client";

import React, { useState } from "react";
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
  isReadOnly?: boolean;
}

const COLUMNS = [
  {
    id: "TODO",
    title: "To Do",
    color: "bg-secondary/10",
    border: "border-border/30",
    accent: "bg-muted-foreground/30",
    titleColor: "text-muted-foreground",
  },
  {
    id: "IN_PROGRESS",
    title: "Working",
    color: "bg-primary/5",
    border: "border-primary/20",
    accent: "bg-primary",
    titleColor: "text-primary",
  },
  {
    id: "REVIEW",
    title: "Review",
    color: "bg-amber-500/5",
    border: "border-amber-500/20",
    accent: "bg-amber-500",
    titleColor: "text-amber-500",
  },
  {
    id: "DONE",
    title: "Finished",
    color: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    accent: "bg-emerald-500",
    titleColor: "text-emerald-500",
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
  isReadOnly = false,
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

  const tasksByStatus = React.useMemo(() => {
    const map: Record<string, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    tasks.forEach((task) => {
      if (task.type === "EPIC") return;
      if (showOnlyMyTasks && user?.id && task.assignedTo !== user.id) return;
      if (map[task.status]) {
        map[task.status].push(task);
      }
    });

    return map;
  }, [tasks, showOnlyMyTasks, user?.id]);
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
      <div className="flex items-center justify-between mb-8 px-2">
        {userRole === "TEAM_MEMBER" && (
          <div className="flex items-center gap-6">
            <div className="bg-card/30 backdrop-blur-xl p-1.5 rounded-2xl border border-border/20 flex gap-1.5 shadow-2xl">
              <button
                onClick={() => setShowOnlyMyTasks(true)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 ${
                  showOnlyMyTasks
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
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
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 ${
                  !showOnlyMyTasks
                    ? "bg-foreground text-background shadow-2xl shadow-foreground/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                }`}
              >
                <Users size={12} />
                All Tasks
              </button>
            </div>

            {showOnlyMyTasks && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 opacity-80"
              >
                <Filter size={12} />
                Filtering my tasks
              </motion.span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          {tasks.length} Tasks Synced
        </div>
      </div>

      <div className="flex flex-col xl:flex-row h-full w-full gap-8 pb-12 items-start xl:min-h-[600px] px-2 overflow-x-auto no-scrollbar">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex flex-col h-full w-full xl:min-w-[320px] xl:max-w-[400px] xl:flex-1 rounded-[2.5rem] border ${col.border} ${col.color} p-0 shadow-2xl transition-all duration-500 glass-card`}
          >
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-1.5 h-6 rounded-full ${col.accent} shadow-2xl`}
                />
                <h3
                  className={`font-black text-[10px] uppercase tracking-[0.2em] ${col.titleColor}`}
                >
                  {col.title}
                </h3>
              </div>
              <span className="text-[10px] font-black bg-card/50 text-foreground px-3 py-1 rounded-xl border border-border/30 shadow-inner">
                {tasksByStatus[col.id].length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 px-5 pb-6 space-y-5 transition-colors rounded-b-[2.5rem] min-h-[200px] overflow-y-auto custom-scrollbar ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                >
                  {tasksByStatus[col.id].map((task, index) => {
                    return (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                        isDragDisabled={isReadOnly}
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
                              whileHover={{ y: -4, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedTask(task);
                                setIsDetailsModalOpen(true);
                              }}
                              className={`relative bg-card p-5 rounded-[2rem] border border-border/40 cursor-grab active:cursor-grabbing transition-all duration-500 ${snapshot.isDragging ? "shadow-[0_0_50px_rgba(0,0,0,0.3)] ring-2 ring-primary/40 z-50 scale-105 rotate-2" : "shadow-xl hover:shadow-2xl hover:border-primary/20"}`}
                            >
                              {/* Priority Indicator Dot */}
                              <div
                                className={`absolute top-5 right-5 w-2 h-2 rounded-full ${
                                  task.priority === "CRITICAL"
                                    ? "bg-destructive animate-pulse shadow-[0_0_8px_rgba(var(--destructive),0.5)]"
                                    : task.priority === "HIGH"
                                      ? "bg-orange-500 shadow-orange-500/50"
                                      : task.priority === "MEDIUM"
                                        ? "bg-primary shadow-primary/50"
                                        : "bg-emerald-500 shadow-emerald-500/50"
                                }`}
                              />
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-2 pr-2">
                                  {task.epicId && (
                                    <div className="flex items-center gap-1.5 w-fit bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] mb-1 shadow-sm">
                                      <Layers
                                        size={10}
                                        className="text-primary/70"
                                      />
                                      {getEpicTitle(task.epicId)}
                                    </div>
                                  )}
                                  {task.parentTaskId && (
                                    <div className="flex items-center gap-1.5 w-fit bg-secondary/30 border border-border/30 text-muted-foreground px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-tight">
                                      <CornerDownRight
                                        size={10}
                                        className="text-muted-foreground/50"
                                      />
                                      SUB-TASK
                                    </div>
                                  )}
                                  <h4 className="text-sm font-black text-foreground leading-tight line-clamp-2 transition-colors group-hover:text-primary">
                                    <div className="flex items-center gap-2 mb-2">
                                      {getTypeIcon(task.type)}
                                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest bg-secondary/20 px-1.5 py-0.5 rounded border border-border/10">
                                        {task.taskKey}
                                      </span>
                                    </div>
                                    {task.title}
                                  </h4>
                                </div>
                                {!isReadOnly &&
                                  (userRole === "ORG_MANAGER" ||
                                    userRole === "SUPER_ADMIN") && (
                                    <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditTask(task);
                                        }}
                                        className="p-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all active:scale-90 shadow-xl"
                                        title="Edit Task"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="3"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
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
                                          className="p-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all active:scale-90 shadow-xl"
                                          title="Delete Task"
                                        >
                                          <Trash2 size={12} strokeWidth={3} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                              </div>

                              {task.description && (
                                <p className="text-[11px] text-muted-foreground/70 mb-4 line-clamp-2 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 mb-5">
                                {showProjectBadges && task.project?.name && (
                                  <span className="text-[9px] px-2.5 py-1 rounded-xl bg-secondary/30 text-muted-foreground font-black uppercase tracking-widest border border-border/10">
                                    {task.project.name}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] px-2.5 py-1 rounded-xl font-black uppercase tracking-widest border ${task.priority === "CRITICAL" || task.priority === "HIGH" ? "bg-destructive/10 text-destructive border-destructive/20" : task.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}
                                >
                                  {task.priority}
                                </span>
                                {(task.storyPoints || 0) > 0 && (
                                  <span className="text-[9px] px-2.5 py-1 rounded-xl bg-secondary/30 text-foreground font-black tracking-widest border border-border/30 shadow-inner">
                                    {task.storyPoints} PTS
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-border/10 mt-auto">
                                <div className="flex items-center gap-4">
                                  <Flag
                                    size={14}
                                    className={`${task.priority === "CRITICAL" ? "text-destructive fill-destructive" : "text-muted-foreground/30"}`}
                                  />
                                  {task.dueDate && (
                                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                      <CalendarIcon
                                        size={12}
                                        className="text-primary/50"
                                      />
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

                                <div className="flex items-center gap-3">
                                  {/* Timer Component (Memoized) */}
                                  {!isReadOnly &&
                                    task.assignedTo === user?.id && (
                                      <TaskTimer
                                        task={task}
                                        userId={user?.id}
                                        onToggle={handleToggleTimer}
                                      />
                                    )}

                                  {task.assignedTo && (
                                    <div className="relative group/assignee">
                                      <UserAvatar
                                        user={getUser(task.assignedTo)}
                                        size="sm"
                                        className="w-7 h-7 text-[10px] ring-2 ring-card shadow-2xl group-hover/assignee:ring-primary transition-all duration-500"
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
