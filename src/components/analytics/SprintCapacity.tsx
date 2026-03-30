import React from "react";
import { Sprint, Task } from "@/types/project";
import { getTime } from "date-fns";

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
  const completedSprints = sprints
    .filter((s) => s.status === "COMPLETED")
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    )
    .slice(0, 3);

  let averageCapacity = 0;

  if (completedSprints.length > 0) {
    const totalCompeletePoints = completedSprints.reduce((total, sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);

      const points = sprintTasks
        .filter((t) => t.status === "DONE")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      return total + points;
    }, 0);

    averageCapacity = Math.round(
      totalCompeletePoints / completedSprints.length,
    );
  } else {
    averageCapacity = 0;
  }

  const activeTask = tasks.filter((t) => t.sprintId === activeSprintId);

  const currentLoad = activeTask.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0,
  );

  let statusColor = "bg-green-500";
  let textColor = "text-green-500";

  if (averageCapacity > 0) {
    const percentage = (currentLoad / averageCapacity) * 100;

    if (percentage > 100) {
      statusColor = "bg-red-500";
      textColor = "text-red-500";
    } else if (percentage > 85) {
      statusColor = "bg-orange-500";
      textColor = "text-orange-500";
    }
  }

  const widthPercent =
    averageCapacity > 0
      ? Math.min((currentLoad / averageCapacity) * 100, 100)
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-4 shadow-sm">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-gray-900 uppercase">
            Team Capacity
          </span>
          <span className={`text-xs font-bold ${textColor}`}>
            {currentLoad} / {averageCapacity || "N/A"} pts
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Filled Bar */}
          <div
            className={`h-full ${statusColor} transition-all duration-500`}
            style={{ width: averageCapacity > 0 ? `${widthPercent}%` : "0%" }}
          />
        </div>
      </div>

      {/* Warning Message if Overloaded */}
      {averageCapacity > 0 && currentLoad > averageCapacity && (
        <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
          ⚠️ Overloaded!
        </div>
      )}
    </div>
  );
}
