import React, { useState, useEffect, memo } from "react";
import { Play, Square } from "lucide-react";
import { Task, TimeLog } from "@/types/project";

interface TaskTimerProps {
  task: Task;
  userId?: string;
  onToggle: (e: React.MouseEvent, task: Task) => void;
}

const formatDuration = (ms: number) => {
  if (!ms) return "00:00:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const TaskTimer = memo(({ task, userId, onToggle }: TaskTimerProps) => {
  const [, setTick] = useState(0);

  const activeLog = task.timeLogs?.find(
    (l: TimeLog) => l.userId === userId && !l.endTime,
  );
  const isTracking = !!activeLog;

  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const getDisplayTime = () => {
    let total = task.totalTimeSpent || 0;
    if (activeLog) {
      const currentSessionDuration =
        new Date().getTime() - new Date(activeLog.startTime).getTime();
      total += currentSessionDuration;
    }
    return formatDuration(total);
  };

  return (
    <button
      onClick={(e) => onToggle(e, task)}
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
      {getDisplayTime()}
    </button>
  );
});

TaskTimer.displayName = "TaskTimer";

export default TaskTimer;
