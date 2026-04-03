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

interface BacklogListProps {
  tasks: Task[];
  users: User[];
  onMoveToBoard: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isSidebarOpen?: boolean;
  projectId: string;
}

export default function BacklogList({
  tasks,
  users,
  onMoveToBoard,
  onEditTask,
  onDeleteTask,
  isSidebarOpen = true,
  projectId,
}: BacklogListProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Calendar className="w-6 h-6 text-gray-300" />
        </div>
        <div>
          <p className="text-gray-900 font-black text-sm uppercase tracking-tight">
            Empty Backlog
          </p>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            All caught up! No tasks left in backlog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Backlog ({tasks.length})
          </h3>
          <div className="h-px flex-1 min-w-[50px] bg-gray-100" />
        </div>
      </div>

      <div
        className={`grid gap-5 ${!isSidebarOpen ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}
      >
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              setSelectedTask(task);
              setIsDetailsModalOpen(true);
            }}
            className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 cursor-pointer overflow-hidden"
          >
            {/* Top Indicator */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                task.priority === "CRITICAL"
                  ? "bg-red-500"
                  : task.priority === "HIGH"
                    ? "bg-orange-500"
                    : task.priority === "MEDIUM"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
              }`}
            />

            {/* Header: Type & Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border-2 ${
                    task.priority === "CRITICAL"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : task.priority === "HIGH"
                        ? "bg-orange-50 text-orange-600 border-orange-100"
                        : "bg-gray-50 text-gray-500 border-gray-100"
                  }`}
                >
                  {task.priority}
                </span>
                <span className="text-gray-300 text-[10px] font-bold">|</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {task.type}
                </span>
              </div>

              {/* Action Buttons */}
              {(userRole === "ORG_MANAGER" || userRole === "SUPER_ADMIN") && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveToBoard(task.id);
                    }}
                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Move to Active Board"
                  >
                    <ArrowUpCircle size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Edit Task"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Delete Task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Content: ID & Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <span className="text-[10px] font-mono text-gray-400 select-all">
                  {task.taskKey}
                </span>
              </div>
              <h4 className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                {task.title}
              </h4>
            </div>

            {/* Footer: Points & Assignee */}
            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(task.storyPoints || 0) > 0 ? (
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                    <span className="text-[10px] font-black text-gray-600">
                      {task.storyPoints}
                    </span>
                    <span className="text-[8px] font-black text-gray-400 uppercase">
                      pts
                    </span>
                  </div>
                ) : (
                  <span className="text-[8px] text-gray-300 font-black uppercase tracking-widest">
                    Unestimated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 px-2 py-0.5 rounded-lg">
                    <Calendar size={10} className="text-gray-300" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
                {task.assignedTo && (
                  <div className="ring-2 ring-white rounded-full">
                    <UserAvatar
                      user={users.find((u) => u.id === task.assignedTo)}
                      size="sm"
                      className="w-5 h-5 text-[9px] border border-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>
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
        currentUserId=""
        onTaskUpdated={() => {}}
        projectId={projectId}
      />
    </>
  );
}
