"use client";

import { useState, Fragment, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Clock,
  MessageSquare,
  Paperclip,
  Loader2,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  Tag,
  Info,
  History,
  File as FileIcon,
  Download,
  Trash2,
} from "lucide-react";
import {
  useUpdateTaskMutation,
  useToggleTaskTimerMutation,
  useGetTaskHistoryQuery,
  useAddCommentMutation,
  useAddAttachmentMutation,
  useGetTaskByIdQuery,
} from "@/store/api/projectApiSlice";
import { Task, TaskHistory } from "@/types/project";
import { User } from "@/types/auth";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/ui/UserAvatar";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";
import api, { API_ROUTES } from "@/utils/api";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
  allTasks?: Task[];
  users?: User[];
  currentUserId?: string;
  userRole?: string;
  onTaskUpdated?: () => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  projectId,
  users = [],
  onTaskUpdated,
}: TaskDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "history" | "comments"
  >("details");
  const [commentText, setCommentText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateTask, { isLoading: isStatusUpdating }] = useUpdateTaskMutation();
  const [toggleTimer, { isLoading: isTimerLoading }] =
    useToggleTaskTimerMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [addAttachment] = useAddAttachmentMutation();
  const [tick, setTick] = useState(0);

  // Real-time ticker for the timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isRunning = task?.timeLogs?.some((log) => !log.endTime);

    if (isOpen && isRunning) {
      interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, task?.timeLogs]);

  // Always fetch full task details when modal is open to ensure we have latest comments/attachments
  // We must call hooks before any early returns to avoid "Rules of Hooks" violations
  const { data: fullTaskData, isFetching: isTaskFetching } =
    useGetTaskByIdQuery(task?.id || "", { skip: !isOpen || !task?.id });

  const { data: history = [], isLoading: isHistoryLoading } =
    useGetTaskHistoryQuery(task?.id || "", {
      skip: !isOpen || !task?.id || activeTab !== "history",
    });

  // Early return if modal is closed or no task is provided
  // This is placed AFTER hooks to satisfy React rules
  if (!isOpen || !task) return null;

  // Use the fullTaskData if available, otherwise fallback to the task prop (which is now guaranteed to be Task)
  const currentTask = fullTaskData || task;

  const handleStatusChange = async (newStatus: Task["status"]) => {
    try {
      await updateTask({
        id: currentTask.id,
        data: { status: newStatus },
        projectId,
      }).unwrap();
      notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
    } catch (err) {
      notifier.error(err, MESSAGES.TASKS.SAVE_FAILED);
    }
  };

  const handleTimerToggle = async (action: "start" | "stop") => {
    try {
      await toggleTimer({ id: currentTask.id, action, projectId }).unwrap();
      notifier.success(
        action === "start"
          ? MESSAGES.TASKS.TIMER_STARTED
          : MESSAGES.TASKS.TIMER_STOPPED,
      );
    } catch (err) {
      notifier.error(err, MESSAGES.TASKS.TIMER_TOGGLE_FAILED);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment({ taskId: currentTask.id, text: commentText }).unwrap();
      setCommentText("");
      notifier.success(MESSAGES.TASKS.COMMENT_ADDED);
    } catch (err) {
      notifier.error(err, "Failed to add comment");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Upload to server
      // 1. Upload to server - Correct path is just API_ROUTES.UPLOAD.BASE (/api/upload)
      const response = await api.post(API_ROUTES.UPLOAD.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = response.data?.data?.url;
      if (!fileUrl) throw new Error("Upload failed - no URL returned");

      // 2. Add as attachment to task
      await addAttachment({
        taskId: currentTask.id,
        url: fileUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      }).unwrap();

      notifier.success("File uploaded successfully");
    } catch (err) {
      notifier.error(err, "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isTimerRunning = currentTask.timeLogs?.some((log) => !log.endTime);

  // Calculate total time spent including the current active log (if any)
  const timeSpent =
    currentTask.timeLogs?.reduce((acc: number, entry) => {
      if (entry.endTime) {
        return acc + (entry.duration || 0);
      } else {
        // Active log: calculate elapsed time from startTime to now
        const elapsed = Date.now() - new Date(entry.startTime).getTime();
        return acc + Math.max(0, elapsed);
      }
    }, 0) || 0;

  // Formatter for HH:MM:SS
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden modal-surface transition-all sm:my-8 sm:w-full sm:max-w-4xl min-h-[600px] flex flex-col md:flex-row">
                {/* Left Side: Main Content */}
                <div className="flex-1 p-8 sm:p-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black tracking-widest rounded-full uppercase">
                          {currentTask.type}
                        </span>
                        <span
                          className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-full uppercase
                                ${currentTask.priority === "CRITICAL" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"}
                            `}
                        >
                          {currentTask.priority}
                        </span>
                      </div>
                      <Dialog.Title
                        as="h3"
                        className="text-3xl font-black text-foreground leading-tight uppercase tracking-tighter"
                      >
                        {currentTask.title}
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-6 border-b border-border/50 mb-8">
                    {[
                      { id: "details", label: "DETAILS", icon: Info },
                      {
                        id: "comments",
                        label: "COMMENTS",
                        icon: MessageSquare,
                      },
                      { id: "history", label: "HISTORY", icon: History },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative
                            ${activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                          `}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {activeTab === "details" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {isTaskFetching && !fullTaskData && (
                        <div className="flex items-center gap-2 text-primary py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Synching Grid...
                          </span>
                        </div>
                      )}
                      <div className="space-y-3">
                        <h4 className="form-label">Objective Briefing</h4>
                        <p className="text-base text-foreground leading-relaxed font-bold">
                          {currentTask.description ||
                            "No operational data available."}
                        </p>
                      </div>

                      {/* Attachments Placeholder */}
                      <div className="space-y-4">
                        <h4 className="form-label">
                          Evidence Repositories{" "}
                          {currentTask.attachments?.length
                            ? `(${currentTask.attachments.length})`
                            : ""}
                        </h4>

                        {/* Attachment List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(currentTask.attachments || []).map(
                            (attachment, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-secondary/10 rounded-xl border border-border/50 group transition-all hover:bg-secondary/20"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="p-2 bg-card rounded-xl border border-border/50 text-primary">
                                    <FileIcon className="w-4 h-4" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">
                                      {attachment.name || `RESOURCE ${idx + 1}`}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                                      {attachment.size
                                        ? `${(attachment.size / 1024).toFixed(1)} KB`
                                        : "Original file"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                    title="Download"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            ),
                          )}

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                          />

                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-3 p-4 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Paperclip className="w-4 h-4" />
                            )}
                            {isUploading ? "Uploading..." : "Add Attachment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "comments" && (
                    <div className="flex flex-col h-[500px]">
                      {/* Messages List - Scrollable */}
                      <div className="flex-1 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                        {(currentTask.comments || []).length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10 opacity-40">
                            <div className="p-4 bg-secondary/20 rounded-full">
                              <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              SILENCE IN THE ARCHIVES. COMMENCE COMMS...
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {(currentTask.comments || []).map((comment, i) => (
                              <div
                                key={i}
                                className="flex gap-4 group animate-in fade-in slide-in-from-bottom-1 duration-300"
                              >
                                <UserAvatar
                                  user={users.find(
                                    (u) => u.id === comment.userId,
                                  )}
                                  size="sm"
                                />
                                <div className="flex-1 bg-secondary/10 p-4 rounded-[1.5rem] border border-border/30 group-hover:bg-secondary/20 transition-all">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-foreground uppercase tracking-tight">
                                      {users.find(
                                        (u) => u.id === comment.userId,
                                      )
                                        ? `${users.find((u) => u.id === comment.userId)?.firstName} ${users.find((u) => u.id === comment.userId)?.lastName}`
                                        : "TEAM MEMBER"}
                                    </span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                      {formatDistanceToNow(
                                        new Date(comment.createdAt),
                                      )}{" "}
                                      ago
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground font-bold leading-relaxed">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pinned Input Form */}
                      <form
                        onSubmit={handleAddComment}
                        className="relative mt-auto pt-4 bg-card"
                      >
                        <input
                          type="text"
                          className="form-input !pr-20 !py-4 text-xs font-black uppercase tracking-tight"
                          placeholder="SIGNAL COMMODITY..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          disabled={isAddingComment}
                        />
                        <button
                          type="submit"
                          disabled={isAddingComment || !commentText.trim()}
                          className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                          {isAddingComment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Send"
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeTab === "history" && (
                    <div className="space-y-6">
                      {isHistoryLoading ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground text-center py-20 font-black uppercase tracking-widest opacity-40">
                          SYSTEM LOG EMPTY.
                        </p>
                      ) : (
                        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                          {history.map((item, i) => (
                            <div key={i} className="flex gap-6 relative">
                              <div className="w-6 h-6 rounded-full bg-background border-4 border-primary z-10" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                                    {item.action}
                                  </span>
                                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                                    {formatDistanceToNow(
                                      new Date(item.createdAt),
                                    )}{" "}
                                    ago
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium italic">
                                  {item.details || `Performed ${item.action}`}
                                  {item.previousValue && item.newValue && (
                                    <>
                                      {" "}
                                      from{" "}
                                      <span className="text-foreground line-through opacity-30">
                                        {String(item.previousValue)}
                                      </span>{" "}
                                      to{" "}
                                      <span className="text-blue-600 font-bold">
                                        {String(item.newValue)}
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Meta Sidebar */}
                <div className="w-full md:w-80 bg-secondary/5 border-l border-border/50 p-8 sm:p-10 space-y-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="form-label flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Access Grade
                      </h4>
                      <select
                        className="form-select text-[10px] font-black uppercase"
                        value={currentTask.status}
                        onChange={(e) =>
                          handleStatusChange(e.target.value as any)
                        }
                      >
                        <option value="TODO">BACKLOG</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <h4 className="form-label flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        Uptime Tracking
                      </h4>
                      <div className="bg-secondary/10 rounded-2xl p-6 border border-border/50 text-center">
                        <div className="text-3xl font-black text-foreground mb-4 font-mono tracking-tighter">
                          {isTimerRunning
                            ? formatTime(timeSpent)
                            : `${(timeSpent / 3600000).toFixed(1)}h`}
                        </div>
                        <button
                          onClick={() =>
                            handleTimerToggle(isTimerRunning ? "stop" : "start")
                          }
                          disabled={isTimerLoading}
                          className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                                        ${
                                          isTimerRunning
                                            ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                        }
                                    `}
                        >
                          {isTimerLoading
                            ? "..."
                            : isTimerRunning
                              ? "Stop Timer"
                              : "Start Timer"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-secondary/20 rounded-xl border border-border/50 text-primary">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="form-label !mb-0">Operative</p>
                        <p className="text-xs font-black text-foreground uppercase tracking-tight">
                          {currentTask.assignedTo
                            ? users.find((u) => u.id === currentTask.assignedTo)
                              ? `${users.find((u) => u.id === currentTask.assignedTo)?.firstName} ${users.find((u) => u.id === currentTask.assignedTo)?.lastName}`
                              : "ASSIGNED"
                            : "UNASSIGNED"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-secondary/20 rounded-xl border border-border/50 text-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="form-label !mb-0">Deadline</p>
                        <p className="text-xs font-black text-foreground uppercase tracking-tight">
                          {currentTask.dueDate
                            ? new Date(currentTask.dueDate).toLocaleDateString()
                            : "UNSET"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-secondary/20 rounded-xl border border-border/50 text-primary">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="form-label !mb-0">Complexity</p>
                        <p className="text-xs font-black text-foreground uppercase tracking-tight text-gradient">
                          {currentTask.storyPoints || 0} NODE PTS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
