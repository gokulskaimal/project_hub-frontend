import React from "react";
import { Sprint, Task } from "@/types/project";
import { Zap, AlertTriangle } from "lucide-react";

interface SprintCapacityProps {
  sprints: Sprint[];
  tasks: Task[];
  activeSprintId?: string;
}

export default function SprintCapacity({
  sprints,
  tasks,
  activeSprintId,
}: SprintCapacityProps) {
  // 1. Calculate Average Capacity (Last 3 Sprints)
  const completedSprints = sprints
    .filter((s) => s.status === "COMPLETED")
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    )
    .slice(0, 3);

  let averageCapacity = 0;
  if (completedSprints.length > 0) {
    const totalPoints = completedSprints.reduce((total, sprint) => {
      return (
        total +
        tasks
          .filter((t) => t.sprintId === sprint.id && t.status === "DONE")
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
      );
    }, 0);
    averageCapacity = Math.round(totalPoints / completedSprints.length);
  }

  // 2. Calculate Current Load
  const currentLoad = tasks
    .filter((t) => t.sprintId === activeSprintId)
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  // 3. Styling Logic
  const percentage =
    averageCapacity > 0 ? (currentLoad / averageCapacity) * 100 : 0;
  const isOverloaded = percentage > 100;

  const getStatusConfig = () => {
    if (percentage > 100)
      return { color: "bg-red-500", text: "text-red-600", light: "bg-red-50" };
    if (percentage > 85)
      return {
        color: "bg-amber-500",
        text: "text-amber-600",
        light: "bg-amber-50",
      };
    return {
      color: "bg-emerald-500",
      text: "text-emerald-600",
      light: "bg-emerald-50",
    };
  };

  const config = getStatusConfig();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${config.light}`}>
            <Zap className={`w-4 h-4 ${config.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
              Sprint Capacity
            </h3>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
              Workload vs Historical Average
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black ${config.text} tabular-nums`}>
            {currentLoad}{" "}
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              / {averageCapacity || "??"} pts
            </span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <div
            className={`h-full ${config.color} transition-all duration-1000 ease-out shadow-sm`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Footer Labels */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
            >
              {Math.round(percentage)}% Load
            </span>
          </div>

          {isOverloaded && (
            <div className="flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                Resource Critically High
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
