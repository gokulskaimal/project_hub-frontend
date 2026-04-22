"use client";

import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  BarChart3,
  Rows,
  PanelRight,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { motion } from "framer-motion";

interface ProjectDetailsHeaderProps {
  project?: Project;
  activeTab: "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS" | "EPICS";
  setActiveTab: (
    tab: "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS" | "EPICS",
  ) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export default function ProjectDetailsHeader({
  project,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}: ProjectDetailsHeaderProps) {
  const router = useRouter();

  const tabs = [
    { id: "TASKS", icon: Rows, label: "Tasks" },
    { id: "EPICS", icon: Layers, label: "Roadmap" },
    { id: "CHAT", icon: MessageSquare, label: "Chat" },
    { id: "CALENDAR", icon: Calendar, label: "Calendar" },
    { id: "ANALYTICS", icon: BarChart3, label: "Analytics" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-2xl transition-all shadow-xl group active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tighter flex items-center gap-3">
              {project?.name}
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 max-w-2xl line-clamp-1">
              {project?.description ||
                "Strategic project initiatives and roadmap."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-3 rounded-2xl border transition-all shadow-xl active:scale-95 ${
              isSidebarOpen
                ? "bg-primary border-primary/20 text-primary-foreground shadow-primary/20"
                : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
            title={
              isSidebarOpen
                ? "Hide Intelligence Sidebar"
                : "Show Intelligence Sidebar"
            }
          >
            <PanelRight
              size={22}
              className={isSidebarOpen ? "animate-pulse-glow" : ""}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2.5 group ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-t-2xl"
            }`}
          >
            <tab.icon
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}
            />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
