import { Task, taskService, TaskComment } from "@/services/taskService";
import { User } from "@/services/userService";
import { useState, useEffect } from "react";
import { X, Send, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import UserAvatar from "@/components/ui/UserAvatar";
import api, { API_ROUTES } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  allTasks: Task[]; // [NEW] Pass all tasks mapping names
  users: User[];
  currentUserId: string;
  userRole?: string;
  onTaskUpdated: () => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  allTasks, // Destructured
  users,
  currentUserId,
  userRole,
  onTaskUpdated,
}: TaskDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState<TaskComment[]>(
    task?.comments || [],
  );

  // NEW: Tab State and History Logs
  const [activeTab, setActiveTab] = useState<"comments" | "history" | "linked">(
    "comments",
  );
  const [historyLogs, setHistoryLogs] = useState<
    Array<{
      id?: string;
      userId: string;
      action: string;
      details?: string;
      createdAt: string;
      previousValue?: string;
      newValue?: string;
      fields?: Array<{ field: string; old: string; new: string }>;
    }>
  >([]);

  // New State for Task Mapping UI
  const [selectedParentId, setSelectedParentId] = useState(
    task?.parentTaskId || "",
  );
  const [dependencyType, setDependencyType] = useState<
    "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO"
  >("RELATES_TO");
  const [selectedDepTaskId, setSelectedDepTaskId] = useState("");

  // Update local comments when task changes
  useEffect(() => {
    if (task?.comments) {
      setLocalComments(task.comments);
    }
  }, [task?.id, task?.comments]);

  // Fetch History Logs when tab switches
  useEffect(() => {
    const fetchHistory = async () => {
      if (activeTab === "history" && task?.id) {
        try {
          const logs = await taskService.getTaskHistory(task.id);
          setHistoryLogs(logs);
        } catch (error) {
          console.error("Failed to fetch task history:", error);
        }
      }
    };
    fetchHistory();
  }, [activeTab, task?.id]);

  // if (!isOpen || !task) return null; // Removed early return for AnimatePresence

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentText.trim()) return;

    const commentContent = commentText;
    setCommentText("");
    setLoading(true);

    try {
      const updatedTask = await taskService.addComment(task.id, commentContent);

      // Add comment immediately to local state (optimistic update)
      // The API returns the full updated task, so extract just the new comments
      if (updatedTask && updatedTask.comments) {
        setLocalComments(updatedTask.comments);
      }

      // Refetch to sync with server
      onTaskUpdated();
      toast.success("Comment added");
    } catch (err) {
      // Restore comment text on error
      setCommentText(commentContent);
      console.error("Failed to add comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!task || !file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("File too large (max 5MB)");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(API_ROUTES.UPLOAD.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        skipGlobalLoader: true,
      });

      if (res.data.success && res.data.data.url) {
        await taskService.addAttachment(task.id, res.data.data.url);
        toast.success("Attachment added");
        onTaskUpdated();
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };

  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <AnimatePresence>
      {isOpen && task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
              <h2 className="text-xl text-gray-900 font-bold flex items-center gap-2">
                <span className="text-gray-900 font-mono text-sm">
                  {task.taskKey}
                </span>
                {task.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Close modal"
                aria-label="Close task details"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Attachments
                  </h3>
                  <label className="cursor-pointer flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-gray-700">
                    <Paperclip className="w-4 h-4" /> Add
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                  </label>
                </div>
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {task.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-gray-50 truncate text-blue-600"
                      >
                        <Paperclip className="w-4 h-4 shrink-0" />
                        <span className="truncate">Attachment {i + 1}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No attachments.</p>
                )}
              </div>

              <div className="flex-1 flex flex-col border-t pt-4">
                <div className="flex gap-4 border-b mb-4">
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-2 text-sm font-semibold transition-colors ${
                      activeTab === "comments"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 text-sm font-semibold transition-colors ${
                      activeTab === "history"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Activity History
                  </button>
                  <button
                    onClick={() => setActiveTab("linked")}
                    className={`pb-2 text-sm font-semibold transition-colors ${
                      activeTab === "linked"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Linked Tasks
                  </button>
                </div>

                {activeTab === "comments" ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[150px]">
                      {localComments && localComments.length > 0 ? (
                        localComments.map(
                          (comment: TaskComment, idx: number) => {
                            const author = getUser(comment.userId);
                            return (
                              <div
                                key={comment.id || idx}
                                className="flex gap-3"
                              >
                                <UserAvatar
                                  user={author}
                                  size="sm"
                                  className="w-8 h-8 shrink-0"
                                />
                                <div className="bg-gray-50 p-3 rounded-lg flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-xs text-gray-800">
                                      {author
                                        ? `${author.firstName} ${author.lastName}`
                                        : "User"}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      {new Date(
                                        comment.createdAt,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            );
                          },
                        )
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-4">
                          No comments yet.
                        </p>
                      )}
                    </div>

                    <form
                      onSubmit={handleAddComment}
                      className="flex gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        aria-label="Comment input"
                        className="flex-1 text-gray-900 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !commentText.trim()}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        title="Post comment"
                        aria-label="Post comment"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                ) : activeTab === "history" ? (
                  <div className="flex-1 overflow-y-auto space-y-4 min-h-[150px]">
                    {historyLogs.length > 0 ? (
                      historyLogs.map(
                        (
                          log: {
                            id?: string;
                            userId: string;
                            action: string;
                            details?: string;
                            createdAt: string;
                            previousValue?: string;
                            newValue?: string;
                            fields?: Array<{
                              field: string;
                              old: string;
                              new: string;
                            }>;
                          },
                          idx: number,
                        ) => {
                          const author = getUser(log.userId);
                          return (
                            <div
                              key={log.id || idx}
                              className="flex gap-3 items-start"
                            >
                              <UserAvatar
                                user={author}
                                size="sm"
                                className="w-6 h-6 shrink-0 mt-1"
                              />
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                  <span className="font-semibold">
                                    {author
                                      ? `${author.firstName} ${author.lastName}`
                                      : "User"}
                                  </span>{" "}
                                  {log.action === "STATUS_CHANGED" && (
                                    <span>
                                      changed status from{" "}
                                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                                        {log.previousValue}
                                      </span>{" "}
                                      to{" "}
                                      <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                                        {log.newValue}
                                      </span>
                                    </span>
                                  )}
                                  {log.action === "ASSIGNEE_CHANGED" && (
                                    <span>
                                      changed assignee to{" "}
                                      <span className="font-semibold">
                                        {log.newValue !== "Unassigned"
                                          ? getUser(log.newValue as string)
                                              ?.firstName || log.newValue
                                          : "Unassigned"}
                                      </span>
                                    </span>
                                  )}
                                  {log.action === "SPRINT_CHANGED" && (
                                    <span>updated sprint assignment</span>
                                  )}
                                </p>
                                <span className="text-[10px] text-gray-500">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        },
                      )
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4">
                        No activity recorded yet.
                      </p>
                    )}
                  </div>
                ) : activeTab === "linked" ? (
                  <div className="flex-1 overflow-y-auto space-y-6 min-h-[150px] p-1">
                    {/* 1. Parent/Sub-task Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Sub-tasks
                        </h4>
                      </div>
                      <div className="space-y-2 mb-4">
                        {allTasks.filter((t) => t.parentTaskId === task.id)
                          .length > 0 ? (
                          allTasks
                            .filter((t) => t.parentTaskId === task.id)
                            .map((sub) => (
                              <div
                                key={sub.id}
                                className="p-2 border rounded-lg flex items-center justify-between bg-white shadow-sm border-gray-200"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border shadow-sm">
                                    {sub.taskKey}
                                  </span>
                                  <span className="text-sm font-medium text-gray-800">
                                    {sub.title}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sub.status === "DONE"
                                      ? "bg-green-100 text-green-700"
                                      : sub.status === "IN_PROGRESS"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </div>
                            ))
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-xs bg-gray-50 rounded-lg border border-dashed">
                            No subtasks mapped to this task.
                          </div>
                        )}
                      </div>

                      {userRole === "org-manager" && (
                        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                          <select
                            className="flex-1 text-sm border p-1 rounded font-medium text-gray-700"
                            value={selectedParentId}
                            onChange={(e) =>
                              setSelectedParentId(e.target.value)
                            }
                          >
                            <option value="">No Parent (Standalone)</option>
                            {allTasks
                              .filter((t) => t.id !== task.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.taskKey}: {t.title}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={async () => {
                              setLoading(true);
                              await taskService.updateTask(task.id, {
                                parentTaskId: selectedParentId || undefined,
                              });
                              setLoading(false);
                              onTaskUpdated();
                              toast.success("Parent updated");
                            }}
                            className="bg-blue-600 text-white text-xs px-2 py-1.5 rounded font-medium shadow-sm active:scale-95 transition-transform"
                          >
                            Set Parent
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 2. Dependencies Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Dependencies
                      </h4>
                      <ul className="space-y-2 mb-3">
                        {task.dependencies && task.dependencies.length > 0 ? (
                          task.dependencies.map((dep, i) => {
                            const linked = allTasks.find(
                              (t) => t.id === dep.taskId,
                            );
                            return (
                              <li
                                key={i}
                                className="flex gap-2 items-center text-sm p-1.5 px-3 bg-gray-100 rounded border border-gray-300 shadow-sm"
                              >
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${dep.type === "BLOCKS" ? "bg-red-200 text-red-900 border border-red-300" : "bg-blue-200 text-blue-900 border border-blue-300"}`}
                                >
                                  {dep.type}
                                </span>
                                <span className="font-semibold text-gray-900 truncate tracking-tight">
                                  {linked
                                    ? `${linked.taskKey}: ${linked.title}`
                                    : "Unknown Task"}
                                </span>
                              </li>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-600 font-medium italic">
                            No dependencies linked.
                          </p>
                        )}
                      </ul>

                      {userRole === "org-manager" && (
                        <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                          <select
                            className="text-sm border p-1 rounded w-32 font-medium text-gray-700"
                            value={dependencyType}
                            onChange={(e) =>
                              setDependencyType(
                                e.target.value as
                                  | "BLOCKS"
                                  | "IS_BLOCKED_BY"
                                  | "RELATES_TO",
                              )
                            }
                          >
                            <option value="RELATES_TO">Relates</option>
                            <option value="BLOCKS">Blocks</option>
                            <option value="IS_BLOCKED_BY">Blocked By</option>
                          </select>
                          <select
                            className="flex-1 text-sm border p-1 rounded font-medium text-gray-700"
                            value={selectedDepTaskId}
                            onChange={(e) =>
                              setSelectedDepTaskId(e.target.value)
                            }
                          >
                            <option value="">Select task...</option>
                            {allTasks
                              .filter((t) => t.id !== task.id)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.taskKey}: {t.title}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={async () => {
                              if (!selectedDepTaskId) return;
                              setLoading(true);
                              const updatedDeps = [
                                ...(task.dependencies || []),
                                {
                                  taskId: selectedDepTaskId,
                                  type: dependencyType,
                                },
                              ];
                              await taskService.updateTask(task.id, {
                                dependencies: updatedDeps,
                              });
                              setLoading(false);
                              onTaskUpdated();
                              toast.success("Dependency added");
                            }}
                            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium shadow-sm active:scale-95 transition-transform"
                          >
                            Link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
