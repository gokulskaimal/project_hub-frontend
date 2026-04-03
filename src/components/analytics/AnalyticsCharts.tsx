import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
];

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

/**
 * A consistent, premium bar chart for various metrics (Revenue, Performance, etc.)
 */
export const AnalyticsBarChart: React.FC<{
  data: ChartData[];
  color?: string;
  label?: string;
}> = ({ data, color = "#3b82f6", label }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-gray-50 rounded-xl">
        No Data Available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f1f5f9"
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[6, 6, 0, 0]}
          barSize={data.length > 5 ? 24 : 32}
          name={label}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * A consistent, premium pie chart for status distributions
 */
export const StatusDistribution: React.FC<{ data: ChartData[] }> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-gray-50 rounded-xl">
        No Data Available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={70}
          outerRadius={90}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
          animationBegin={0}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            padding: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
