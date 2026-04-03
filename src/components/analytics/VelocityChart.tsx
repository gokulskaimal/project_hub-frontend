import React from "react";
import { Sprint, Task } from "@/types/project";
import { Activity } from "lucide-react";

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

  // 2. Calculate Velocity (Completed Points) for each sprint
  const data = sortedSprints.map((sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);

    // Points completed (Status = DONE)
    const completedPoints = sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const totalPoints = sprintTasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0,
    );

    return {
      id: sprint.id,
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

  // Calculate max value for scaling, ensuring a minimum of 10 to avoid division by zero
  const maxPoints = Math.max(
    ...data.map((d) => Math.max(d.total, d.completed)),
    10,
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Project Velocity
          </h3>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            Story points delivered per sprint
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 rounded-xl">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
            Avg: {avgVelocity} pts
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-3 min-h-[220px] pb-6 px-2">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-xl gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-gray-200" />
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              No Sprints Found
            </span>
          </div>
        ) : (
          data.map((item, index) => {
            const heightPercent = Math.max(
              Math.round((item.completed / maxPoints) * 100),
              4,
            );
            const totalHeightPercent = Math.max(
              Math.round((item.total / maxPoints) * 100),
              4,
            );

            return (
              <div
                key={item.id || index}
                className="flex-1 flex flex-col items-center gap-3 group"
              >
                <div className="w-full relative flex items-end justify-center min-h-[160px]">
                  {/* Background bar (Total Scope) */}
                  <div
                    className="w-10 bg-gray-50 rounded-t-lg absolute bottom-0 transition-all duration-700 group-hover:bg-gray-100"
                    style={{ height: `${totalHeightPercent}%` }}
                  />

                  {/* Foreground bar (Completed) */}
                  <div
                    className={`w-10 rounded-t-lg absolute bottom-0 transition-all duration-1000 z-10 shadow-sm ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-500 group-hover:bg-emerald-600"
                        : "bg-blue-500 group-hover:bg-blue-600"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-20">
                      {item.completed} / {item.total} pts
                    </div>
                  </div>
                </div>

                <div className="text-center overflow-hidden w-full">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-tighter truncate px-1">
                    {item.name}
                  </p>
                  <div
                    className={`mt-1 h-1 w-4 mx-auto rounded-full group-hover:w-8 transition-all duration-300 ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-100 group-hover:bg-emerald-200"
                        : "bg-blue-100 group-hover:bg-blue-200"
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
