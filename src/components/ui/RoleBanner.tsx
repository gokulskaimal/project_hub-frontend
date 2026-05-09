"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface RoleBannerProps {
  roleName: string;
  badgeText: string;
  welcomeMessage: React.ReactNode;
  description: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({
  roleName: _roleName,
  badgeText,
  welcomeMessage,
  description,
  gradientFrom = "#6366F1", // Indigo
  gradientTo = "#8B5CF6", // Violet
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl">
      {/* Background Decorative Gradients */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] opacity-20 rounded-full"
        style={{
          background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 blur-[120px] opacity-10 rounded-full"
        style={{
          background: `linear-gradient(to top left, ${gradientTo}, ${gradientFrom})`,
        }}
      />

      <div className="relative z-10 px-8 py-12 sm:px-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">
            {badgeText}
          </span>
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-[1.1]">
          {welcomeMessage}
        </h1>

        <div className="text-muted-foreground text-sm sm:text-lg font-medium max-w-2xl leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
