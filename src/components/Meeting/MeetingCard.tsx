import React, { useState } from "react";
import {
  Video,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  useCompleteMeetingMutation,
  useDeleteMeetingMutation,
} from "@/store/api/projectApiSlice";
import EditMeetingModal from "./EditMeetingModal";
import { notifier } from "@/utils/notifier";

interface MeetingCardProps {
  meeting: {
    title: string;
    type: string;
    roomId: string;
    scheduledAt: string;
    status?: string;
  };
  projectId: string;
  isManager?: boolean;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  projectId,
  isManager,
}) => {
  const [completeMeeting, { isLoading }] = useCompleteMeetingMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this meeting")) {
      try {
        await deleteMeeting(meeting.roomId).unwrap();
        notifier.success("Meeting deleted");
      } catch (err) {
        notifier.error(err, "Failed to delete meeting");
      }
    }
  };

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    await completeMeeting(meeting.roomId);
  };

  return (
    <div className="group p-5 bg-card border border-border/50 rounded-3xl shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
            <Video size={22} />
          </div>
          <div>
            <h4 className="font-black text-foreground tracking-tight">
              {meeting.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase tracking-widest text-primary font-black bg-primary/5 px-2 py-0.5 rounded-full">
                {meeting.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isManager && meeting.status !== "COMPLETED" && (
            <>
              <button
                onClick={handleComplete}
                disabled={isLoading || isDeleting}
                className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all border border-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
                title="Mark as Complete"
              >
                <CheckCircle size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditModalOpen(true);
                }}
                disabled={isLoading || isDeleting}
                className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all border border-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
                title="Edit Meeting"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
                title="Delete Meeting"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {meeting.status === "COMPLETED" ? (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-secondary/50 text-muted-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest cursor-not-allowed border border-border/50">
              Call Ended
            </div>
          ) : (
            <Link
              href={`/meeting/${meeting.roomId}?projectId=${projectId}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Join
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-border/30 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary/60" />
          {format(new Date(meeting.scheduledAt), "MMM dd, yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary/60" />
          {format(new Date(meeting.scheduledAt), "hh:mm a")}
        </div>
      </div>

      <EditMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        meeting={meeting}
      />
    </div>
  );
};

export default MeetingCard;
