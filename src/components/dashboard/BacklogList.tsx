"use client";

import React from "react";
import { ArrowUpCircle, Calendar, Trash2, Pencil } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { useState } from "react";
import TaskDetailsModal from "@/components/modals/TaskDetailsModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Task } from "@/types/project";
import { User } from "@/types/auth";
import { motion } from "framer-motion";

interface BacklogListProps {
  tasks: Task[];
  users: User[];
  onMoveToBoard: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isSidebarOpen?: boolean;
  projectId: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  totalCount?: number;
}

export default function BacklogList({
  tasks,
  users,
  onMoveToBoard,
  onEditTask,
  onDeleteTask,
  isSidebarOpen = true,
  projectId,
  hasMore,
  onLoadMore,
  isLoadingMore,
  totalCount,
}: BacklogListProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  if (tasks.length === 0) {
    return (
      <div className="bg-secondary/10 border-2 border-dashed border-border/20 rounded-[2.5rem] p-16 text-center flex flex-col items-center gap-6 glass-card">
        <div className="p-4 bg-card rounded-2xl shadow-2xl border border-border/20 group hover:scale-110 transition-transform duration-500">
          <Calendar className="w-8 h-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-2">
          <p className="text-foreground font-black text-xs uppercase tracking-[0.3em]">
            Zero Vectors Detected
          </p>
          <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.2em] max-w-[200px]">
            Backlog fully synchronized. Archive is clear.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4 w-full">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] shrink-0">
            Sector Backlog ({totalCount ?? tasks.length})
          </h3>
          <div className="h-px w-full bg-gradient-to-r from-border/20 via-border/5 to-transparent" />
        </div>
      </div>

      <div
        className={`grid gap-6 ${!isSidebarOpen ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}
      >
        {tasks
          .filter((t) => t.type !== "EPIC")
          .map((task, index) => (
            <motion.div
              key={`${task.id}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => {
                setSelectedTask(task);
                setIsDetailsModalOpen(true);
              }}
              className="group relative bg-card border border-border/30 rounded-[2rem] p-6 shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 flex flex-col gap-6 cursor-pointer overflow-hidden glass-card"
            >
              {/* Logic Trace Indicator */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 opacity-80 ${
                  task.priority === "CRITICAL"
                    ? "bg-destructive shadow-[0_0_15px_rgba(var(--destructive),0.5)]"
                    : task.priority === "HIGH"
                      ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : task.priority === "MEDIUM"
                        ? "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                        : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                }`}
              />

              {/* Matrix Header: Type & Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${
                      task.priority === "CRITICAL"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : task.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-border/30 text-[10px] font-black">
                    •
                  </span>
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                    {task.type}
                  </span>
                </div>

                {/* Neural Actions */}
                {(userRole === "ORG_MANAGER" || userRole === "SUPER_ADMIN") && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToBoard(task.id);
                      }}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-90 border border-emerald-500/20"
                      title="Initialize Active Stream"
                    >
                      <ArrowUpCircle size={14} strokeWidth={3} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90 border border-primary/20"
                      title="Reconfigure Logic"
                    >
                      <Pencil size={14} strokeWidth={3} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all shadow-xl active:scale-90 border border-destructive/20"
                      title="Purge Object"
                    >
                      <Trash2 size={14} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>

              {/* Core Data: ID & Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse transition-colors" />
                  <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest select-all group-hover:text-primary/50 transition-colors">
                    {task.taskKey}
                  </span>
                </div>
                <h4 className="text-[15px] font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2 px-1">
                  {task.title}
                </h4>
              </div>

              {/* Metrics Footer: Complexity & Operative */}
              <div className="mt-auto pt-5 border-t border-border/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(task.storyPoints || 0) > 0 ? (
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1 rounded-xl border border-border/10 shadow-inner group/pts hover:border-primary/30 transition-colors">
                      <span className="text-[10px] font-black text-foreground group-hover/pts:text-primary transition-colors">
                        {task.storyPoints}
                      </span>
                      <span className="text-[8px] font-black text-muted-foreground uppercase opacity-40">
                        Compute Units
                      </span>
                    </div>
                  ) : (
                    <span className="text-[8px] text-muted-foreground/20 font-black uppercase tracking-widest italic">
                      Unaligned Weight
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-background/40 px-3 py-1 rounded-xl border border-border/5">
                      <Calendar size={11} className="text-primary opacity-50" />
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  {task.assignedTo && (
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                      <UserAvatar
                        user={users.find((u) => u.id === task.assignedTo)}
                        size="sm"
                        className="w-8 h-8 ring-2 ring-background shadow-2xl relative z-10"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      {hasMore && (
        <div className="mt-20 flex flex-col items-center gap-8">
          <div className="h-px w-full max-sm bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="group relative flex items-center gap-4 px-12 py-5 bg-card border border-border/20 rounded-[2rem] transition-all hover:border-primary hover:shadow-[0_20px_50px_-10px_rgba(var(--primary),0.2)] active:scale-95 disabled:opacity-30 overflow-hidden glass-card"
          >
            {isLoadingMore && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <span className="relative text-[10px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-[0.3em] transition-all">
              {isLoadingMore ? "SYNCHRONIZING..." : "ACCESS DEEPER ARCHIVES"}
            </span>
            {isLoadingMore ? (
              <div className="relative w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowUpCircle className="relative w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:rotate-180 transition-all duration-700 ease-out" />
            )}
          </button>
        </div>
      )}

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
        onTaskUpdated={() => {}}
        projectId={projectId}
      />
    </>
  );
}
