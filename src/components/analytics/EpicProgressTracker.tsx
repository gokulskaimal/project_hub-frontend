"use client";

import { useMemo } from "react";
import { Layers, Target, CheckCircle2, Clock } from "lucide-react";
import { useGetEpicAnalyticsQuery } from "@/store/api/projectApiSlice";

interface EpicProgressTrackerProps {
  projectId: string;
}

export default function EpicProgressTracker({
  projectId,
}: EpicProgressTrackerProps) {
  const { data: epics = [], isLoading } = useGetEpicAnalyticsQuery(projectId);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
        <div className="h-6 w-48 bg-gray-100 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-12 bg-gray-50 rounded" />
          <div className="h-12 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (epics.length === 0) {
    return null; // Don't show if no epics exist
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          Epic Progress
        </h3>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
          {epics.length} Active Epics
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {epics.map((epic) => (
          <div
            key={epic.id}
            className="group p-4 bg-gray-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-purple-100 rounded-xl transition-all duration-300"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {epic.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium line-clamp-1">
                    {epic.description || "No description provided"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-black ${epic.progress === 100 ? "text-green-600" : "text-purple-600"}`}
                  >
                    {Math.round(epic.progress)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${
                    epic.progress === 100 ? "bg-green-500" : "bg-purple-500"
                  }`}
                  style={{ width: `${epic.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <Target size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-600">
                      {epic.totalStories} Stories
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span className="text-[10px] font-bold text-gray-600">
                      {epic.completedStories} Done
                    </span>
                  </div>
                </div>
                {epic.status === "DONE" && (
                  <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tighter">
                    <CheckCircle2 size={10} />
                    Verified Done
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
