"use client";

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
import { motion } from "framer-motion";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {label || payload[0].name}
        </p>
        <p className="text-sm font-black text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const AnalyticsBarChart = ({
  data,
  dataKey,
  xKey,
  color = "var(--primary)",
}: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="h-full w-full"
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="var(--border)"
          opacity={0.5}
        />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "var(--muted-foreground)",
            fontSize: 10,
            fontWeight: 900,
          }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{
            fill: "var(--muted-foreground)",
            fontSize: 10,
            fontWeight: 900,
          }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--secondary)", opacity: 0.2 }}
        />
        <Bar
          dataKey={dataKey}
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
          barSize={32}
          isAnimationActive={true}
        />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);

export const StatusDistribution = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-border/50 rounded-3xl">
        No Data Stream
      </div>
    );
  }

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="h-full w-full flex flex-col sm:flex-row items-center gap-6">
      <div className="h-[200px] w-[200px] shrink-0 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
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
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer shadow-xl"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Total
          </span>
          <span className="text-xl font-black text-foreground">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-2 w-full">
        {data.map((item, index) => (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            key={item.name}
            className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-lg"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors line-clamp-1">
                {item.name}
              </span>
            </div>
            <span className="text-[11px] font-black text-foreground">
              {item.value.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
