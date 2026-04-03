import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Task, Sprint } from "@/types/project";

interface Props {
  sprint: Sprint;
  tasks: Task[];
}

export default function SprintBurndownChart({ sprint, tasks }: Props) {
  const data = useMemo(() => {
    // Only count story points for tasks assigned to this exact sprint
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const totalPoints = sprintTasks.reduce(
      (acc, t) => acc + (t.storyPoints || 0),
      0,
    );

    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);

    // Normalize start date to beginning of day for comparison
    const startOfSprint = new Date(start);
    startOfSprint.setHours(0, 0, 0, 0);

    // Initial value is total points MINUS anything already done BEFORE the sprint officially started
    const pointsDoneBeforeStart = sprintTasks
      .filter(
        (t) =>
          t.status === "DONE" &&
          t.completedAt &&
          new Date(t.completedAt) < startOfSprint,
      )
      .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    let remainingActual = totalPoints - pointsDoneBeforeStart;
    const chartData = [];

    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)),
    );

    for (let i = 0; i <= days; i++) {
      const currentDay = new Date(startOfSprint);
      currentDay.setDate(currentDay.getDate() + i);

      const idealRemaining = Math.max(
        0,
        totalPoints - (totalPoints / days) * i,
      );

      const completedToday = sprintTasks
        .filter(
          (t) =>
            t.status === "DONE" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() ===
              currentDay.toDateString(),
        )
        .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

      remainingActual -= completedToday;

      chartData.push({
        day:
          days <= 7
            ? currentDay.toLocaleDateString([], { weekday: "short" })
            : `D${i}`,
        Ideal: Number(idealRemaining.toFixed(1)),
        Actual: currentDay <= new Date() ? Math.max(0, remainingActual) : null,
      });
    }
    return chartData;
  }, [sprint, tasks]);

  if (!sprint) return null;

  if (tasks.filter((t) => t.sprintId === sprint.id).length === 0) {
    return (
      <div className="h-[400px] w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <LineChart className="w-8 h-8 text-blue-500 opacity-50" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Sprint Data</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-1">
          Add some estimated tasks to this sprint to see the burndown analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        Sprint Burndown ({sprint.name})
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#374151" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
          <Line
            type="monotone"
            dataKey="Ideal"
            stroke="#9ca3af"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Actual"
            stroke="#2563eb"
            strokeWidth={3}
            activeDot={{
              r: 6,
              fill: "#2563eb",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
