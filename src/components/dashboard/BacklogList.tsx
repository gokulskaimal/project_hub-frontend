import React from "react";
import { Task } from "@/services/taskService";
import { ArrowUpCircle, Calendar, Trash2, Pencil } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "@/services/userService";

interface BacklogListProps {
  tasks: Task[];
  users: User[];
  onMoveToBoard: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  isSidebarOpen?: boolean;
}

export default function BacklogList({
  tasks,
  users,
  onMoveToBoard,
  onEditTask,
  onDeleteTask,
  isSidebarOpen = true,
}: BacklogListProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">
          Your backlog is empty. Great job!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${!isSidebarOpen ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
    >
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group h-full"
        >
          {/* Top: Type, Priority, Actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0" title={task.type}>
                {task.type === "BUG" ? (
                  <span className="text-red-500">🐞</span>
                ) : task.type === "STORY" ? (
                  <span className="text-blue-500">📘</span>
                ) : (
                  <span className="text-gray-500">📋</span>
                )}
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  task.priority === "CRITICAL" || task.priority === "HIGH"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {task.priority}
              </span>
            </div>

            {/* Actions (Always visible in Card mode for better UX) */}
            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onMoveToBoard(task.id)}
                className="text-gray-400 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors"
                title="Move to Board"
              >
                <ArrowUpCircle size={14} />
              </button>
              <button
                onClick={() => onEditTask(task)}
                className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Middle: Title */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 md:line-clamp-none min-h-[2.5rem]">
              {task.title}
            </h4>
          </div>

          {/* Bottom: Points, Assignee, Date */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              {(task.storyPoints || 0) > 0 && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                  {task.storyPoints} pts
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.assignedTo && (
                <UserAvatar
                  user={users.find((u) => u.id === task.assignedTo)}
                  size="sm"
                  className="w-5 h-5 text-[9px]"
                />
              )}
              {task.dueDate && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
