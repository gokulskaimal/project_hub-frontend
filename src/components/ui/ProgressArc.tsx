"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface ProgressArcProps {
  value: number;
  max: number;
  label?: string;
  size?: number;
  color?: string;
  subtitle?: string;
}

export const ProgressArc: React.FC<ProgressArcProps> = ({
  value,
  max,
  label,
  size = 140,
  color = "#6366F1",
  subtitle,
}) => {
  const percentage = Math.round((value / max) * 100);

  const data = [{ value: value }, { value: max - value }];

  return (
    <div
      className="flex flex-col items-center justify-center relative group"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="75%"
            outerRadius="95%"
            startAngle={225}
            endAngle={-45}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <Cell
              fill={color}
              className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            />
            <Cell fill="var(--secondary)" opacity={0.2} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-2xl font-black text-foreground tracking-tighter leading-none"
        >
          {percentage}%
        </motion.span>
        {label && (
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
            {label}
          </span>
        )}
      </div>

      {/* Tooltip/Hover Effect */}
      <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <div className="bg-foreground text-background px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
          {value} / {max} {subtitle}
        </div>
      </div>
    </div>
  );
};
