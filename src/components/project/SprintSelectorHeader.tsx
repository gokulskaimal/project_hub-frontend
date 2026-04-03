"use client";

import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sprint } from "@/types/project";

interface SprintSelectorHeaderProps {
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;
  sprints: Sprint[];
  isManager: boolean;
  selectedSprint: Sprint | null;
  onNewSprint: () => void;
  onCompleteSprint: () => void;
  onStartSprint: () => void;
  onEditSprint: () => void;
  onDeleteSprint: (id: string) => void;
}

export default function SprintSelectorHeader({
  selectedSprintId,
  setSelectedSprintId,
  sprints,
  isManager,
  selectedSprint,
  onNewSprint,
  onCompleteSprint,
  onStartSprint,
  onEditSprint,
  onDeleteSprint,
}: SprintSelectorHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div className="flex items-center gap-4">
        <select
          value={selectedSprintId}
          onChange={(e) => setSelectedSprintId(e.target.value)}
          className="text-sm font-black border-2 border-gray-100 bg-gray-50/50 rounded-xl px-4 py-2 outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 shadow-sm"
        >
          <option value="ACTIVE" className="text-gray-900 font-bold bg-white">
            Current Active Sprint
          </option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id} className="text-gray-900 bg-white">
              {s.name} — {s.status}
            </option>
          ))}
        </select>
        {isManager && (
          <button
            onClick={onNewSprint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
          >
            + New Sprint
          </button>
        )}
      </div>
      {isManager && selectedSprint && (
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm flex items-center gap-2 ${
              selectedSprint.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : selectedSprint.status === "PLANNED"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : selectedSprint.status === "COMPLETED"
                    ? "bg-gray-100 text-gray-500 border-gray-200"
                    : "bg-orange-50 text-orange-600 border-orange-100"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedSprint.status === "ACTIVE"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-current"
              }`}
            />
            {selectedSprint.status}
          </div>

          <div className="flex items-center gap-2">
            {selectedSprint.status === "ACTIVE" ? (
              <Button
                size="sm"
                onClick={onCompleteSprint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
              >
                Complete Sprint
              </Button>
            ) : selectedSprint.status === "PLANNED" ||
              selectedSprint.status === "PLANNING" ? (
              <Button
                size="sm"
                onClick={onStartSprint}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                Start Sprint
              </Button>
            ) : null}

            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
              <button
                onClick={onEditSprint}
                className="active:scale-95 p-2 bg-white text-gray-400 border border-gray-200 rounded-xl hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm group"
                title="Edit Sprint Definition"
              >
                <Pencil
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
              </button>
              <button
                onClick={() => onDeleteSprint(selectedSprint.id)}
                className="active:scale-95 p-2 bg-white text-gray-400 border border-gray-200 rounded-xl hover:text-red-600 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                title="Delete Sprint"
              >
                <Trash2
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
