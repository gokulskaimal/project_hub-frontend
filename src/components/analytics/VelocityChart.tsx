import React from "react";
import { Sprint, Task } from "@/types/project";

interface VelocityChartProps {
  sprints: Sprint[];
  tasks: Task[];
}

export default function VelocityChart({ sprints, tasks }: VelocityChartProps) {
  // 1. Filter only Completed Sprints & Active Sprint
  // We want to show the last 5 sprints + current
  const sortedSprints = [...sprints]
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(-5); // Take last 5

  if (sortedSprints.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
        <p className="text-gray-500 text-sm">No sprint data available yet.</p>
      </div>
    );
  }

  // 2. Calculate Velocity (Completed Points) for each sprint
  const data = sortedSprints.map((sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);

    // Points committed (Status != BACKLOG at start... approx using all tasks in sprint)
    // Points completed (Status = DONE)
    const completedPoints = sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const totalPoints = sprintTasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0,
    );

    return {
      name: sprint.name,
      completed: completedPoints,
      total: totalPoints,
      status: sprint.status,
    };
  });

  // Calculate Average Velocity (only from COMPLETED sprints)
  const completedSprints = data.filter((d) => d.status === "COMPLETED");
  const avgVelocity =
    completedSprints.length > 0
      ? Math.round(
          completedSprints.reduce((sum, d) => sum + d.completed, 0) /
            completedSprints.length,
        )
      : 0;

  const maxPoints = Math.max(...data.map((d) => d.total), 10); // Scale max

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Velocity Chart</h3>
          <p className="text-xs text-gray-500">
            Story points completed per sprint
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase font-medium">
            Average Velocity
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {avgVelocity}{" "}
            <span className="text-sm text-gray-400 font-normal">pts</span>
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 h-48 pt-4 pb-2">
        {data.map((item, index) => {
          const heightPercent = Math.max(
            Math.round((item.completed / maxPoints) * 100),
            5,
          ); // Min 5% height

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-end flex-1 h-full group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                {item.completed} / {item.total} pts
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${
                  item.status === "ACTIVE" ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ height: `${heightPercent}%` }}
              ></div>

              {/* Label */}
              <p
                className="mt-2 text-[10px] text-gray-500 font-medium truncate w-full text-center"
                title={item.name}
              >
                {item.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
