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
import { useGetMyMeetingsQuery } from "@/store/api/projectApiSlice";
import { useRouter } from "next/navigation";
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
  const { data: meetingsData } = useGetMyMeetingsQuery({
    page: 1,
    limit: 100,
    status: "SCHEDULED",
  });
  const router = useRouter();

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

  // Memoize Tasks, Projects, and Meetings by Date for Performance
  const { groupedTasks, groupedProjects, groupedMeetings } =
    React.useMemo(() => {
      const tasksMap: Record<string, Task[]> = {};
      const projectsMap: Record<string, Project[]> = {};
      const meetingsMap: Record<string, any[]> = {};

      tasks.forEach((task) => {
        if (!task.dueDate) return;
        const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd");
        if (!tasksMap[dateKey]) tasksMap[dateKey] = [];
        tasksMap[dateKey].push(task);
      });

      projects.forEach((project) => {
        if (!project.endDate) return;
        const dateKey = format(new Date(project.endDate), "yyyy-MM-dd");
        if (!projectsMap[dateKey]) projectsMap[dateKey] = [];
        projectsMap[dateKey].push(project);
      });

      (meetingsData?.items || []).forEach((meeting: any) => {
        if (!meeting.scheduledAt) return;
        const dateKey = format(new Date(meeting.scheduledAt), "yyyy-MM-dd");
        if (!meetingsMap[dateKey]) meetingsMap[dateKey] = [];
        meetingsMap[dateKey].push(meeting);
      });

      return {
        groupedTasks: tasksMap,
        groupedProjects: projectsMap,
        groupedMeetings: meetingsMap,
      };
    }, [tasks, projects, meetingsData]);

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
      <div className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-md">
        {/* Calendar Header */}
        <div className="p-5 flex items-center justify-between border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2.5 hover:bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2.5 hover:bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all text-muted-foreground hover:text-primary shadow-sm active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 border-b border-border/30 bg-muted/20">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] overflow-hidden"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-card/50">
          {calendarDays.map((day, dayIdx) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const tasksOnDay = groupedTasks[dateKey] || [];
            const projectsOnDay = groupedProjects[dateKey] || [];
            const meetingsOnDay = groupedMeetings[dateKey] || [];

            return (
              <div
                key={day.toString()}
                onClick={handleCellClick}
                className={`
                min-h-[120px] p-2 border-b border-r border-border/30 transition-all duration-300
                ${!isSameMonth(day, monthStart) ? "opacity-30 bg-muted/10 grayscale-[0.5]" : "hover:bg-primary/5"}
                ${isSameDay(day, new Date()) ? "bg-primary/[0.03]" : ""}
              `}
              >
                <div className="flex justify-between items-start mb-3">
                  <span
                    className={`
                    text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 shadow-sm
                    ${
                      isSameDay(day, new Date())
                        ? "bg-primary text-primary-foreground scale-110 shadow-primary/20 rotate-[-4deg]"
                        : !isSameMonth(day, monthStart)
                          ? "text-muted-foreground/50"
                          : "text-foreground/80"
                    }
                  `}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Render Projects End Dates First */}
                  {projectsOnDay.map((project) => (
                    <div
                      key={`proj-${project.id}`}
                      title={`Project Deadline: ${project.name}`}
                      className="text-[9px] font-black p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 truncate select-none shadow-sm flex items-center justify-between uppercase tracking-tighter"
                    >
                      <span className="truncate w-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        {project.name}
                      </span>
                    </div>
                  ))}

                  {/* Render Meetings */}
                  {meetingsOnDay.map((meeting) => (
                    <div
                      key={`meet-${meeting.id}`}
                      title={`Meeting: ${meeting.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/meeting/${meeting.roomId}?projectId=${meeting.projectId}`,
                        );
                      }}
                      className="text-[9px] font-black p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 truncate cursor-pointer select-none transition-all hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-between uppercase tracking-tighter leading-tight"
                    >
                      <span className="truncate w-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {meeting.title}
                      </span>
                    </div>
                  ))}

                  {/* Render Tasks */}
                  {tasksOnDay.map((task) => (
                    <div
                      key={task.id}
                      title={`${task.title} (${task.project?.name || "Unknown Project"})`}
                      onClick={(e) => handleTaskClick(e, task)}
                      className="text-[9px] font-black p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary truncate cursor-pointer select-none transition-all hover:bg-primary/20 hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-between uppercase tracking-tighter leading-tight"
                    >
                      <span className="truncate w-full">{task.title}</span>
                      {!projectId && task.project?.name && (
                        <span className="text-[7px] opacity-60 ml-1.5 truncate max-w-[40px] hidden sm:inline-block border-l border-primary/20 pl-1.5">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
