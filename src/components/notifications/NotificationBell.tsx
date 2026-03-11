"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchNotifications,
  markRead,
  markAllRead,
} from "@/features/notification/notification";
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
  const { items, unreadCount, loading } = useSelector(
    (state: RootState) => state.notification,
  );
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadItems = items.filter((n) => !n.isRead);
  const readItems = items.filter((n) => n.isRead);

  const displayedItems = activeTab === "unread" ? unreadItems : readItems;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

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

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
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
      dispatch(markRead(notification.id));
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
        className="relative p-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <div className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-white min-w-[20px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === "unread"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Unread ({unreadItems.length})
              </button>
              <button
                onClick={() => setActiveTab("read")}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === "read"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Read ({readItems.length})
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {displayedItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No {activeTab} notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {displayedItems.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${!notification.isRead ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="mt-1 shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!notification.isRead ? "font-medium text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(notification.id, e)}
                        className="shrink-0 text-gray-400 hover:text-blue-600 p-1 opacity-100 transition-opacity"
                        title="Mark as read"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
