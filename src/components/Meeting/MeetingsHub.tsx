"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useGetMyMeetingsQuery,
  projectApiSlice,
} from "@/store/api/projectApiSlice";
import MeetingCard from "./MeetingCard";
import {
  Video,
  History,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function MeetingHub() {
  const [statusTab, setStatusTab] = useState<"SCHEDULED" | "HISTORY">(
    "SCHEDULED",
  );
  const [page, setPage] = useState(1);
  const limit = 12;
  const { role } = useSelector((state: RootState) => state.auth);
  const isManager = role === "ORG_MANAGER" || role === "SUPER_ADMIN";
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const { data, isLoading } = useGetMyMeetingsQuery({
    page,
    limit,
    status: statusTab,
  });

  useEffect(() => {
    if (!socket) return;

    const handleMeetingChange = () => {
      dispatch(projectApiSlice.util.invalidateTags(["Meetings"]));
    };

    socket.on("meeting:created", handleMeetingChange);
    socket.on("meeting:updated", handleMeetingChange);
    socket.on("meeting:deleted", handleMeetingChange);
    socket.on("meeting:completed", handleMeetingChange);

    return () => {
      socket.off("meeting:created", handleMeetingChange);
      socket.off("meeting:updated", handleMeetingChange);
      socket.off("meeting:deleted", handleMeetingChange);
      socket.off("meeting:completed", handleMeetingChange);
    };
  }, [socket, dispatch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Video className="w-8 h-8 text-primary" />
            Meetings Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all your project syncs and team calls.
          </p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-px">
        <button
          onClick={() => {
            setStatusTab("SCHEDULED");
            setPage(1);
          }}
          className={`pb-3 px-4 flex items-center gap-2 text-sm font-bold transition-all relative ${statusTab === "SCHEDULED" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <CalendarIcon className="w-4 h-4" /> Upcoming
          {statusTab === "SCHEDULED" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => {
            setStatusTab("HISTORY");
            setPage(1);
          }}
          className={`pb-3 px-4 flex items-center gap-2 text-sm font-bold transition-all relative ${statusTab === "HISTORY" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <History className="w-4 h-4" /> Past Calls
          {statusTab === "HISTORY" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>
      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border/50">
          <Video className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold">
            No {statusTab.toLowerCase()} meetings found
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.items?.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              projectId={meeting.projectId}
              isManager={isManager}
            />
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 bg-card border border-border rounded-xl hover:bg-secondary disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="p-2 bg-card border border-border rounded-xl hover:bg-secondary disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
