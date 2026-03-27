import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Sprint, Task, Project } from "@/types/project";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { User } from "@/types/auth";
import { getPriorityColor, getStatusColor } from "@/utils/projectUtils";

interface TaskCalendarProps {
  tasks: Task[];
  projects?: Project[];
  projectId?: string; // Optional for Global Calendar
  projectMembers: User[];
  onTaskUpdate?: () => void;
}

export default function TaskCalendar({
  tasks,
  projects = [],
  projectId,
  projectMembers,
  onTaskUpdate,
}: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleModalSuccess = () => {
    if (onTaskUpdate) onTaskUpdate();
    handleModalClose();
  };

  const handleCellClick = () => {
    // If global calendar (no projectId), we can't create a task from here easily
    if (!projectId) {
      // Optional: Show toast or open modal with a project selector (future improvement)
      return;
    }
    // If inside project, could auto-open create modal for that date
    // For now keeping it simple.
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-600 hover:text-gray-900 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-600 hover:text-gray-900 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-white">
          {calendarDays.map((day, dayIdx) => (
            <div
              key={day.toString()}
              onClick={handleCellClick}
              className={`
              min-h-[120px] p-2 border-b border-r border-gray-100 transition-colors
              ${!isSameMonth(day, monthStart) ? "bg-gray-50/50" : ""}
              ${isSameDay(day, new Date()) ? "bg-blue-50/30" : "hover:bg-gray-50"}
            `}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${
                    isSameDay(day, new Date())
                      ? "bg-blue-600 text-white"
                      : !isSameMonth(day, monthStart)
                        ? "text-gray-400"
                        : "text-gray-700"
                  }
                `}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {/* Render Projects End Dates First */}
                {projects
                  .filter((project) => {
                    if (!project.endDate) return false;
                    return isSameDay(new Date(project.endDate), day);
                  })
                  .map((project) => (
                    <div
                      key={`proj-${project.id}`}
                      title={`Project Deadline: ${project.name}`}
                      className={`text-[10px] p-1.5 rounded border truncate select-none shadow-sm flex items-center justify-between ${getStatusColor("PLANNING")}`}
                    >
                      <span className="font-bold truncate w-full flex items-center gap-1">
                        🚀 {project.name}
                      </span>
                    </div>
                  ))}

                {/* Render Tasks */}
                {tasks
                  .filter((task) => {
                    if (!task.dueDate) return false;
                    return isSameDay(new Date(task.dueDate), day);
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      title={`${task.title} (${task.project?.name || "Unknown Project"})`}
                      onClick={(e) => handleTaskClick(e, task)}
                      className={`
                      text-[10px] p-1.5 rounded border truncate cursor-pointer select-none transition-all hover:shadow-sm flex items-center justify-between
                      ${getPriorityColor(task.priority)}
                    `}
                    >
                      <span className="font-semibold truncate w-full">
                        {task.title}
                      </span>
                      {!projectId && task.project?.name && (
                        <span className="text-[8px] opacity-70 ml-1 truncate max-w-[40px] hidden sm:inline-block">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        projectId={selectedTask?.projectId || projectId || ""}
        task={selectedTask}
        projectMembers={projectMembers}
      />
    </>
  );
}
