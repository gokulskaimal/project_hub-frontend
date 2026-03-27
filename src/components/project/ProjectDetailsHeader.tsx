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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project?.name}
            </h1>
            <p className="text-sm text-gray-500">{project?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isSidebarOpen
                ? "bg-blue-50 border-blue-100 text-blue-600"
                : "bg-white border-gray-200 text-gray-400"
            }`}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-gray-100 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-1 text-sm font-bold transition-all relative flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
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
