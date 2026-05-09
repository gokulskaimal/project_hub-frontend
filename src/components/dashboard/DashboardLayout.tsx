"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  title: string;
  children: ReactNode;
};

/**
 * DashboardLayout (Headless Version)
 * handles the page header and main scrollable content area.
 * The Sidebar is managed by the root layouts (Manager, Member, Admin)
 * to prevent double-sidebar glitches.
 */
export default function DashboardLayout({ title: _title, children }: Props) {
  return (
    <div className="min-h-full flex flex-col relative bg-background">
      {/* 
          DashboardLayout is now headless. 
          Header and Sidebar are managed by the role-specific layouts 
          (Manager, Member, Admin) to prevent double-UI glitches.
      */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
