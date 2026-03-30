"use client";

import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  BarChart3,
  Rows,
  PanelRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";

interface ProjectDetailsHeaderProps {
  project?: Project;
  activeTab: "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS";
  setActiveTab: (tab: "TASKS" | "CHAT" | "CALENDAR" | "ANALYTICS") => void;
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
            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {project?.name}
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {project?.description || "No project description provided."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-3 rounded-xl border transition-all shadow-sm ${
              isSidebarOpen
                ? "bg-blue-600 border-blue-600 text-white shadow-blue-100"
                : "bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-50"
            }`}
            title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 rounded-t-xl"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
