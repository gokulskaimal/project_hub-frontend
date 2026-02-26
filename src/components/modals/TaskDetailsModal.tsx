import { Task, taskService, TaskComment } from "@/services/taskService";
import { User } from "@/services/userService";
import { useState, useEffect } from "react";
import { X, Send, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import UserAvatar from "@/components/ui/UserAvatar";
import api, { API_ROUTES } from "@/utils/api";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  users: User[];
  currentUserId: string;
  onTaskUpdated: () => void;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  task,
  users,
  currentUserId,
  onTaskUpdated,
}: TaskDetailsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState<TaskComment[]>(
    task?.comments || [],
  );

  // Update local comments when task changes
  useEffect(() => {
    if (task?.comments) {
      setLocalComments(task.comments);
    }
  }, [task?.id, task?.comments]);

  if (!isOpen || !task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

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
    if (!file) return;

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Comments
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[150px]">
              {localComments && localComments.length > 0 ? (
                localComments.map((comment: TaskComment, idx: number) => {
                  const author = getUser(comment.userId);
                  return (
                    <div key={comment.id || idx} className="flex gap-3">
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
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">
                  No comments yet.
                </p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 shrink-0">
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
          </div>
        </div>
      </div>
    </div>
  );
}
