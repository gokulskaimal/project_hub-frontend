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
    <div className="flex flex-col h-[600px] bg-card rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden glass-card">
      <div className="p-6 border-b border-border/20 bg-secondary/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground">
            Project Chat
          </h3>
        </div>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">
          Sync-Live
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        {loadingMore && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
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
              <div key={idx} className="flex justify-center my-6 px-12">
                <div className="bg-secondary/20 border border-border/10 rounded-full px-6 py-2 flex items-center gap-3 group/activity hover:bg-secondary/40 transition-all shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover/activity:scale-125 transition-transform" />
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    {msg.content}
                  </p>
                  <span className="text-[9px] text-border font-black ml-2">
                    {time}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} mb-6 group animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex items-end gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <div className="mb-1 shrink-0">
                    <UserAvatar
                      user={{
                        name: msg.senderName,
                        avatar: msg.senderAvatar,
                      }}
                      size="sm"
                      className="w-8 h-8 ring-2 ring-border/20 shadow-xl"
                    />
                  </div>
                )}

                <div
                  className={`relative px-5 py-3 shadow-2xl transition-all duration-300 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none hover:shadow-primary/20"
                      : "bg-secondary/50 text-foreground rounded-2xl rounded-tl-none border border-border/10 hover:bg-secondary/60"
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">
                        {msg.senderName.split(" ")[0]}
                      </p>
                    </div>
                  )}

                  {editingId === msg.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit logic..."
                        className="bg-card text-foreground text-xs px-4 py-2 rounded-xl border border-primary/30 outline-none w-full min-w-[200px] shadow-inner"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="p-1.5 hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-500 transition-all active:scale-90"
                          title="Authorize Commit"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 hover:bg-destructive hover:text-white rounded-lg text-destructive transition-all active:scale-90"
                          title="Abort Edit"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ) : (msg.type === "FILE" || msg.type === "IMAGE") &&
                    msg.fileUrl ? (
                    <div className="mt-1">
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group/attach"
                      >
                        {msg.type === "IMAGE" ||
                        msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <div className="relative overflow-hidden rounded-[1.5rem] border border-border/20 shadow-2xl">
                            <Image
                              src={msg.fileUrl}
                              alt="attachment"
                              width={300}
                              height={300}
                              className="max-w-[280px] h-auto transition-transform duration-700 group-hover/attach:scale-110"
                            />
                            <div className="absolute inset-0 bg-primary/0 group-hover/attach:bg-primary/10 transition-colors" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 bg-card/20 rounded-[1.5rem] hover:bg-card/40 transition-all border border-white/5 backdrop-blur-md">
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <Paperclip size={18} className="text-primary" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[180px] opacity-80">
                              {msg.content || "DATA_STREAM_FILE"}
                            </span>
                          </div>
                        )}
                      </a>
                    </div>
                  ) : (
                    <p className="text-[13px] font-bold leading-relaxed break-words">
                      {msg.content}
                    </p>
                  )}

                  <div
                    className={`text-[8px] font-black mt-2 flex items-center justify-end gap-1 uppercase tracking-widest opacity-40 ${isMe ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {time}
                  </div>
                </div>

                {isMe && !editingId && (
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col gap-2 self-center mr-2">
                    {new Date().getTime() - new Date(msg.createdAt).getTime() <
                      5 * 60 * 1000 && (
                      <>
                        <button
                          onClick={() => handleEditClick(msg)}
                          className="p-2.5 bg-secondary/30 hover:bg-primary hover:text-white rounded-xl text-muted-foreground transition-all shadow-xl active:scale-90"
                          title="Edit message"
                        >
                          <Edit2 size={12} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-2.5 bg-secondary/30 hover:bg-destructive hover:text-white rounded-xl text-muted-foreground transition-all shadow-xl active:scale-90"
                          title="Purge message"
                        >
                          <Trash2 size={12} strokeWidth={3} />
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
        className="p-5 bg-secondary/20 border-t border-border/20 flex gap-4 items-center"
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
          className={`p-3.5 rounded-2xl transition-all shadow-xl active:scale-90 ${
            isUploading
              ? "text-border"
              : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary border border-border/20"
          }`}
          title="Inject Object"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>
        <div className="relative flex-1 group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Synchronize thought..."
            className="w-full bg-card/50 border border-border/30 rounded-[2rem] px-8 py-3.5 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none text-foreground placeholder:text-muted-foreground/30 font-bold shadow-inner transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="p-3.5 bg-primary text-primary-foreground rounded-[1.5rem] hover:opacity-90 transition-all shadow-2xl shadow-primary/30 disabled:opacity-30 active:scale-90"
          title="Transmit Signal"
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
