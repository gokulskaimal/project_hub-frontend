import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import {
  Send,
  Paperclip,
  MoreVertical,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import api, { API_ROUTES } from "@/utils/api";
import UserAvatar from "@/components/ui/UserAvatar";
import Image from "next/image";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  type: "TEXT" | "FILE" | "IMAGE" | "SYSTEM" | "ACTIVITY";
  fileUrl?: string;
}

interface ProjectChatProps {
  projectId: string;
}

export default function ProjectChat({ projectId }: ProjectChatProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = useCallback(
    async (cursor?: string | null) => {
      try {
        const params: Record<string, string | number> = {};
        if (cursor) params.before = cursor;

        if (cursor) setLoadingMore(true);

        const res = await api.get(API_ROUTES.CHAT.PROJECT(projectId), {
          params,
        });
        if (res.data.success) {
          const newMessages = res.data.data.messages || [];
          const newCursor = res.data.data.nextCursor;

          setNextCursor(newCursor);

          if (cursor) {
            // Loading more (older messages)
            setMessages((prev) => [...newMessages, ...prev]);
          } else {
            // Initial load
            setMessages(newMessages);
            setInitialLoaded(true);
            // Scroll to bottom on initial load
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch (err) {
        console.error("Failed to load chat", err);
      } finally {
        setLoadingMore(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    // Reset state on project change
    setMessages([]);
    setNextCursor(null);
    setInitialLoaded(false);
    fetchMessages();
  }, [projectId, fetchMessages]);

  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (prevScrollHeight && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeight;
      if (diff > 0) {
        scrollContainerRef.current.scrollTop = diff;
      }
      setPrevScrollHeight(null);
    }
  }, [messages, prevScrollHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && nextCursor && !loadingMore) {
      setPrevScrollHeight(scrollHeight);
      fetchMessages(nextCursor);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-project", projectId);

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        const messageExists = prev.some((m) => m.id === msg.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, msg];
      });

      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isNearBottom || msg.senderId === user?.id) {
          setTimeout(scrollToBottom, 50);
        }
      }
    };

    const handleUpdate = (updatedMsg: ChatMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)),
      );
    };

    const handleDeleteEvent = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:updated", handleUpdate);
    socket.on("chat:deleted", handleDeleteEvent);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:updated", handleUpdate);
      socket.off("chat:deleted", handleDeleteEvent);
      socket.emit("leave-project", projectId);
    };
  }, [socket, projectId, user?.id]);

  const [isSending, setIsSending] = useState(false);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage;
    setNewMessage("");
    setIsSending(true);

    try {
      const res = await api.post(
        API_ROUTES.CHAT.PROJECT(projectId),
        {
          content: messageContent,
          type: "TEXT",
        },
        { skipGlobalLoader: true },
      );

      if (res.data.success && res.data.data) {
        const newMsg = res.data.data;
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
        // Silent success is usually better for chat, but let's add a small toast if it helps the user feel confident
      }
    } catch (err) {
      console.error("Failed to send", err);
      notifier.error(err, MESSAGES.CHAT.SEND_FAILED);
      // Restore the message so they can try again
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      notifier.error(null, MESSAGES.VALIDATION.FILE_SIZE_ERROR);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await api.post(API_ROUTES.UPLOAD.BASE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        skipGlobalLoader: true,
      });

      if (uploadRes.data.success) {
        const messageRes = await api.post(
          API_ROUTES.CHAT.PROJECT(projectId),
          {
            content: file.name,
            type: "FILE",
            fileUrl: uploadRes.data.data.url,
          },
          { skipGlobalLoader: true },
        );

        if (messageRes.data.success && messageRes.data.data) {
          const newMsg = messageRes.data.data;
          setMessages((prev) => [...prev, newMsg]);
          setTimeout(scrollToBottom, 50);
        }
      }
    } catch (err) {
      console.error("Upload failed", err);
      notifier.error(err, MESSAGES.CHAT.UPLOAD_FAILED);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditClick = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async (messageId: string) => {
    try {
      await api.put(
        API_ROUTES.CHAT.MESSAGE(messageId),
        { content: editContent },
        { skipGlobalLoader: true },
      );
      setEditingId(null);
      notifier.success(MESSAGES.GENERAL.SUCCESS);
    } catch (err) {
      console.error("Failed to edit", err);
      notifier.error(err, MESSAGES.CHAT.EDIT_FAILED);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = await confirmWithAlert(
      MESSAGES.CHAT.DELETE_CONFIRM,
      "This action cannot be undone.",
    );
    if (confirmed) {
      try {
        await api.delete(API_ROUTES.CHAT.MESSAGE(messageId), {
          skipGlobalLoader: true,
        });
        notifier.success(MESSAGES.GENERAL.SUCCESS);
      } catch (err) {
        notifier.error(err, MESSAGES.CHAT.DELETE_FAILED);
      }
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Team Chat</h3>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {loadingMore && (
          <div className="flex justify-center p-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {(messages || []).map((msg, idx) => {
          const isMe = msg.senderId === user?.id;
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (msg.type === "ACTIVITY" || msg.type === "SYSTEM") {
            return (
              <div key={idx} className="flex justify-center my-4 px-12">
                <div className="bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2 group/activity hover:bg-white transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover/activity:scale-125 transition-transform" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {msg.content}
                  </p>
                  <span className="text-[9px] text-gray-300 font-medium ml-1">
                    {time}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-4 group`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`relative px-4 py-2 shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-xl rounded-tr-none"
                      : "bg-gray-100 text-gray-900 rounded-xl rounded-tl-none"
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <UserAvatar
                        user={{
                          name: msg.senderName,
                          avatar: msg.senderAvatar,
                        }}
                        size="sm"
                        className="w-4 h-4 text-[8px]"
                      />
                      <p className="text-[10px] font-bold text-gray-500">
                        {msg.senderName}
                      </p>
                    </div>
                  )}

                  {editingId === msg.id ? (
                    <div className="flex items-center gap-2 text-black">
                      <input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit message..."
                        className="text-black text-sm px-2 py-1 rounded border border-gray-300 outline-none w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="p-1 hover:bg-green-100 rounded-full text-green-600"
                        title="Save edit"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 hover:bg-red-100 rounded-full text-red-600"
                        title="Cancel edit"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (msg.type === "FILE" || msg.type === "IMAGE") &&
                    msg.fileUrl ? (
                    <div className="mt-1">
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {msg.type === "IMAGE" ||
                        msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <Image
                            src={msg.fileUrl}
                            alt="attachment"
                            width={200}
                            height={200}
                            className="max-w-[200px] h-auto rounded-xl border border-gray-200"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                            <Paperclip size={16} />
                            <span className="text-xs underline truncate max-w-[150px]">
                              {msg.content || "Download File"}
                            </span>
                          </div>
                        )}
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm break-words">{msg.content}</p>
                  )}

                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {time}
                  </div>
                </div>

                {isMe && !editingId && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    {new Date().getTime() - new Date(msg.createdAt).getTime() <
                      5 * 60 * 1000 && (
                      <>
                        <button
                          onClick={() => handleEditClick(msg)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500"
                          title="Edit message"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-500"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
          onChange={handleFileSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`p-2 rounded-full transition-colors ${
            isUploading
              ? "text-gray-300"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border-0 rounded-full px-4 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
