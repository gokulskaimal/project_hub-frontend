"use client";

import SpilloverWizard from "../modals/SpilloverWizard";
import { useState, useMemo } from "react";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sprint, Task } from "@/types/project";

interface SprintSelectorHeaderProps {
  selectedSprintId: string;
  setSelectedSprintId: (id: string) => void;
  sprints: Sprint[];
  isManager: boolean;
  selectedSprint: Sprint | null;
  onNewSprint: () => void;
  onCompleteSprint: (destination?: string) => void;
  onStartSprint: () => void;
  onEditSprint: () => void;
  onDeleteSprint: (id: string) => void;
  tasks: Task[] | null;
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
  tasks,
}: SprintSelectorHeaderProps) {
  const [isSpilloverOpen, setIsSpilloverOpen] = useState(false);
  const unfinishedTasks = useMemo(() => {
    if (!selectedSprint || !tasks) return [];

    return tasks.filter(
      (t) =>
        t.sprintId == selectedSprint.id &&
        t.status !== "DONE" &&
        t.type !== "EPIC",
    );
  }, [selectedSprint, tasks]);

  const futureSprints = useMemo(() => {
    return sprints.filter(
      (s) => s.status == "PLANNED" && s.id !== selectedSprint?.id,
    );
  }, [sprints, selectedSprint]);

  const handleCompleteClick = () => {
    if (unfinishedTasks.length > 0) {
      setIsSpilloverOpen(true);
    } else {
      onCompleteSprint();
    }
  };

  const handleSpilloverConfirm = async (destination: string) => {
    await onCompleteSprint(destination);
    setIsSpilloverOpen(false);
  };
  return (
    <div className="flex items-center justify-between border-b border-border/30 pb-6 mb-2">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="text-xs font-black border border-border/50 bg-secondary/30 rounded-2xl px-5 py-2.5 outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all text-foreground shadow-xl appearance-none pr-10 cursor-pointer uppercase tracking-widest"
          >
            <option value="ACTIVE" className="bg-card font-black">
              Current Active Cycle
            </option>
            {sprints.map((s) => {
              const startDate = new Date(s.startDate).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric" },
              );
              const endDate = new Date(s.endDate).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric" },
              );
              return (
                <option
                  key={s.id}
                  value={s.id}
                  className="bg-card font-bold uppercase"
                >
                  {s.name} ({startDate} — {endDate}){" "}
                  {s.status === "COMPLETED" ? "✓" : ""}
                </option>
              );
            })}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {isManager && (
          <button
            onClick={onNewSprint}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-lg active:scale-95"
          >
            + Assemble Sprint
          </button>
        )}
      </div>
      {isManager && selectedSprint && (
        <div className="flex items-center gap-6">
          {/* Status Badge */}
          <div
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg flex items-center gap-2.5 ${
              selectedSprint.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : selectedSprint.status === "PLANNED" ||
                    selectedSprint.status === "PLANNING"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : selectedSprint.status === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedSprint.status === "ACTIVE"
                  ? "bg-emerald-500 animate-pulse-glow"
                  : "bg-current opacity-70"
              }`}
            />
            {selectedSprint.status === "COMPLETED"
              ? "COMPLETED"
              : selectedSprint.status === "PLANNED"
                ? "PROPOSED"
                : selectedSprint.status}
          </div>

          <div className="flex items-center gap-4">
            {selectedSprint.status === "ACTIVE" ? (
              <Button
                size="sm"
                onClick={handleCompleteClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
              >
                Complete Sprint
              </Button>
            ) : selectedSprint.status === "PLANNED" ||
              selectedSprint.status === "PLANNING" ? (
              <Button
                size="sm"
                onClick={onStartSprint}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                Activate Sprint
              </Button>
            ) : null}

            <div className="flex items-center gap-3 ml-2 pl-6 border-l border-border/30">
              <button
                onClick={onEditSprint}
                className="active:scale-95 p-2.5 bg-secondary/30 text-muted-foreground border border-border/50 rounded-2xl hover:text-primary hover:border-primary/50 hover:bg-secondary/50 transition-all shadow-xl group"
                title="Modify Logistics"
              >
                <Pencil
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
              </button>
              <button
                onClick={() => onDeleteSprint(selectedSprint.id)}
                className="active:scale-95 p-2.5 bg-secondary/30 text-muted-foreground border border-border/50 rounded-2xl hover:text-destructive hover:border-destructive/50 hover:bg-secondary/50 transition-all shadow-xl group font-black"
                title="Discard Sprint"
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
      <SpilloverWizard
        isOpen={isSpilloverOpen}
        onClose={() => setIsSpilloverOpen(false)}
        stalledCount={unfinishedTasks.length}
        futureSprints={futureSprints}
        onConfirm={handleSpilloverConfirm}
      />
    </div>
  );
}
