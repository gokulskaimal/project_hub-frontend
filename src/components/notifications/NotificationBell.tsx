"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/store/api/userApiSlice";
import { Notification } from "@/types/notification";
import {
  Bell,
  Check,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";

export default function NotificationBell() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { data: items = [], isLoading: loading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const unreadCount = items.filter((n: Notification) => !n.isRead).length;

  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadItems = items.filter((n: Notification) => !n.isRead);
  const readItems = items.filter((n: Notification) => n.isRead);

  const displayedItems = activeTab === "unread" ? unreadItems : readItems;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id).unwrap();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead().unwrap();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle size={16} className="text-green-500" />;
      case "WARNING":
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case "ERROR":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: {
    id: string;
    isRead: boolean;
    link?: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }) => {
    // Mark as read if not already
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${isOpen ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/10 shadow-lg"}`}
        aria-label="Access Intelligence Stream"
      >
        <Bell
          className={`w-5 h-5 ${isOpen ? "animate-none" : "group-hover:animate-bounce"}`}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[9px] font-black leading-none text-white transform bg-destructive rounded-full border-2 border-background shadow-[0_0_10px_rgba(var(--destructive),0.5)] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 md:w-[420px] bg-card rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-border/20 z-50 overflow-hidden transform origin-top-right transition-all animate-in zoom-in-95 duration-300 glass-card">
          <div className="p-6 border-b border-border/10 bg-secondary/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em]">
                Intelligence Feed
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-primary hover:text-primary/80 font-black uppercase tracking-widest transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3" /> Mark All Read
                </button>
              )}
            </div>

            <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border/10 shadow-inner">
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-500 ${
                  activeTab === "unread"
                    ? "bg-primary text-primary-foreground shadow-2xl"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                UNREAD ({unreadItems.length})
              </button>
              <button
                onClick={() => setActiveTab("read")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-500 ${
                  activeTab === "read"
                    ? "bg-primary text-primary-foreground shadow-2xl"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                READ ({readItems.length})
              </button>
            </div>
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {displayedItems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground/30">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-secondary/30 rounded-full border border-border/10">
                    <Bell size={24} className="opacity-20" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  No Intelligence Data Available
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {displayedItems.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-5 hover:bg-secondary/30 transition-all duration-300 flex gap-4 cursor-pointer relative group/item ${!notification.isRead ? "bg-primary/5" : ""}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    )}
                    <div className="mt-1 shrink-0">
                      <div
                        className={`p-2 rounded-xl bg-background shadow-inner border border-border/10 group-hover/item:scale-110 transition-transform`}
                      >
                        {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5">
                      <p
                        className={`text-sm tracking-tight ${!notification.isRead ? "font-black text-foreground" : "font-bold text-muted-foreground/70"}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50 mt-1.5 leading-relaxed line-clamp-2 italic font-medium">
                        {notification.message}
                      </p>
                      <p className="text-[9px] font-black text-border mt-3 uppercase tracking-widest">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(notification.id, e)}
                        className="shrink-0 w-8 h-8 rounded-xl bg-card border border-border/20 text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 flex items-center justify-center self-center shadow-xl opacity-0 group-hover/item:opacity-100"
                        title="Authorize Read State"
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
