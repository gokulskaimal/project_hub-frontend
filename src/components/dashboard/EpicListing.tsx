import React, { useMemo, useState } from "react";
import {
  Layers,
  Target,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Map,
} from "lucide-react";
import EpicGanttChart from "@/components/analytics/EpicGanttChart";
import {
  useGetProjectTasksQuery,
  useDeleteTaskMutation,
} from "@/store/api/projectApiSlice";
import { Task } from "@/types/project";
import { motion, AnimatePresence } from "framer-motion";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";
import { PaginatedResponse } from "@/types/project";

interface EpicListingProps {
  projectId: string;
  onEditEpic: (epic: Task) => void;
  onEditTask: (task: Task) => void; // For nested stories
  onCreateEpic: () => void;
  isReadOnly?: boolean;
}

export default function EpicListing({
  projectId,
  onEditEpic,
  onEditTask,
  onCreateEpic,
  isReadOnly = false,
}: EpicListingProps) {
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"LIST" | "GANTT">("LIST");

  // Fetch only epics
  const { data: rawEpics = [], isLoading } = useGetProjectTasksQuery({
    projectId,
    type: "EPIC",
  });

  // Fetch all tasks for progress calculation and nested listing
  const { data: rawAllTasks = [] } = useGetProjectTasksQuery({ projectId });

  const [deleteTask] = useDeleteTaskMutation();

  const epics = useMemo(() => {
    if (Array.isArray(rawEpics)) return rawEpics;
    return (rawEpics as PaginatedResponse<Task>)?.items || [];
  }, [rawEpics]);

  const allTasks = useMemo(() => {
    const tasks = Array.isArray(rawAllTasks)
      ? rawAllTasks
      : (rawAllTasks as PaginatedResponse<Task>)?.items || [];
    console.log("[EpicListing] All Tasks Count:", tasks.length);
    if (tasks.length > 0) {
      console.log("[EpicListing] First Task EpicId:", tasks[0].epicId);
    }
    return tasks;
  }, [rawAllTasks]);

  const toggleEpic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEpics(newExpanded);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to delete this Epic? This will not delete the linked stories.",
      )
    ) {
      try {
        await deleteTask({ id, projectId }).unwrap();
        notifier.success(MESSAGES.TASKS.DELETE_SUCCESS);
      } catch (err) {
        notifier.error(err, MESSAGES.TASKS.DELETE_FAILED);
      }
    }
  };

  const getEpicData = (epicId: string) => {
    const stories = allTasks.filter((t: Task) => {
      const match = t.epicId?.toString() === epicId.toString();
      if (t.type === "STORY" && t.epicId) {
        console.log(
          `[EpicListing] Checking Task ${t.taskKey}: ${t.epicId} === ${epicId} ? ${match}`,
        );
      }
      return match;
    });
    const total = stories.length;
    const completed = stories.filter((t: Task) => t.status === "DONE").length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, progress, stories };
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-secondary/20 animate-pulse rounded-[2.5rem] border border-border/10"
          />
        ))}
      </div>
    );
  }

  if (epics.length === 0) {
    return (
      <div className="bg-secondary/10 border-2 border-dashed border-border/30 rounded-[3rem] p-24 text-center flex flex-col items-center gap-8 glass-card">
        <div className="p-5 bg-card rounded-2xl shadow-2xl border border-border/50">
          <Layers className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <div className="max-w-md">
          <h3 className="text-foreground font-black text-2xl uppercase tracking-tighter">
            No <span className="text-primary">Strategic</span> Epics
          </h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-3 leading-relaxed opacity-60">
            Epics represent macro-objectives within the project matrix. Initiate
            a directive to begin mapping.
          </p>
        </div>
        {!isReadOnly && (
          <button
            onClick={onCreateEpic}
            className="flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl shadow-primary/20 active:scale-95"
          >
            <Plus size={18} />
            Manifest New Epic
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {epics.length > 0 && (
        <div className="flex justify-end">
          <div className="flex bg-secondary/20 border border-border/10 rounded-2xl p-1.5 shadow-inner shrink-0 glass-card">
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${viewMode === "LIST" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layers className="w-3.5 h-3.5" /> Spectrum
            </button>
            <button
              onClick={() => setViewMode("GANTT")}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${viewMode === "GANTT" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Map className="w-3.5 h-3.5" /> Chronology
            </button>
          </div>
        </div>
      )}

      {viewMode === "GANTT" ? (
        <EpicGanttChart epics={epics} />
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 items-start">
          {epics.map((epic: Task, index: number) => {
            const { total, progress, stories } = getEpicData(epic.id);
            const isExpanded = expandedEpics.has(epic.id);

            return (
              <motion.div
                key={epic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
                className={`group relative bg-card border border-border/50 rounded-[2.5rem] shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden ${isExpanded ? "md:col-span-2 lg:col-span-3 xl:col-span-3 border-primary/20" : ""}`}
              >
                <div
                  className={`p-8 ${isExpanded ? "border-b border-border/30 bg-secondary/10" : ""}`}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                          <Layers size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded uppercase tracking-widest opacity-60">
                              {epic.taskKey}
                            </span>
                            <div className="h-px w-6 bg-border/20" />
                          </div>
                          <h4 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
                            {epic.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!isReadOnly && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEpic(epic);
                              }}
                              className="p-2.5 bg-secondary/50 text-muted-foreground rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(epic.id, e)}
                              className="p-2.5 bg-secondary/50 text-muted-foreground rounded-xl hover:bg-destructive hover:text-white transition-all shadow-xl active:scale-90"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={(e) => toggleEpic(epic.id, e)}
                          className={`p-2.5 rounded-xl transition-all active:scale-90 shadow-xl ${isExpanded ? "bg-primary text-white shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-70">
                          Objective Saturation
                        </span>
                        <span
                          className={`text-xs font-black ${progress === 100 ? "text-emerald-500" : "text-primary"}`}
                        >
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="relative h-3 w-full bg-secondary/30 rounded-full p-0.5 border border-border/10 overflow-hidden shadow-inner">
                        <motion.div
                          layoutId={`progress-${epic.id}`}
                          initial={false}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full rounded-full shadow-lg ${
                            progress === 100
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                              : "bg-gradient-to-r from-primary to-blue-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-primary/50" />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {total} Macro-Directives
                          </span>
                        </div>
                      </div>
                      {progress === 100 && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-sm animate-in fade-in zoom-in duration-500">
                          <CheckCircle2 size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                            Target Achieved
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="bg-card/50"
                    >
                      <div className="p-8 pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">
                              Sub-Directive Spectrum
                            </h5>
                          </div>

                          {stories.length === 0 ? (
                            <div className="text-center py-12 px-6 border-2 border-dashed border-border/20 rounded-[2rem] bg-secondary/10">
                              <AlertCircle className="w-8 h-8 text-muted-foreground/10 mx-auto mb-3" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                                Zero Signals Linked
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                              {stories.map((story: Task) => (
                                <div
                                  key={story.id}
                                  onClick={() => onEditTask(story)}
                                  className="group/story flex items-center justify-between bg-secondary/20 p-5 rounded-2xl border border-border/10 shadow-sm hover:border-primary/30 hover:bg-secondary/40 hover:shadow-xl transition-all duration-300 cursor-pointer"
                                >
                                  <div className="min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse ${
                                          story.status === "DONE"
                                            ? "bg-emerald-500 shadow-emerald-500/50"
                                            : story.status === "IN_PROGRESS"
                                              ? "bg-primary shadow-primary/50"
                                              : "bg-muted-foreground/30 shadow-none"
                                        }`}
                                      />
                                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                                        {story.taskKey}
                                      </span>
                                    </div>
                                    <h6 className="text-sm font-black text-foreground truncate group-hover/story:text-primary transition-colors tracking-tight">
                                      {story.title}
                                    </h6>
                                  </div>
                                  <div
                                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                                      story.status === "DONE"
                                        ? "bg-emerald-500/10 text-emerald-500"
                                        : "bg-secondary/50 text-muted-foreground group-hover/story:bg-primary group-hover/story:text-white"
                                    }`}
                                  >
                                    <ExternalLink size={14} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
