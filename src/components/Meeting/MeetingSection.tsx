import React, { useState } from "react";
import { Video, Plus } from "lucide-react";
import { useGetSprintMeetingsQuery } from "@/store/api/projectApiSlice";
import MeetingCard from "./MeetingCard";
import ScheduleMeetingModal from "./ScheduleMeetingModal";
import { Meeting } from "@/types/meeting";

interface MeetingSectionProps {
  sprintId: string;
  projectId: string;
  isManager: boolean;
}

const MeetingSection: React.FC<MeetingSectionProps> = ({
  sprintId,
  projectId,
  isManager,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: meetings = [], isLoading } =
    useGetSprintMeetingsQuery(sprintId);
  const activeMeetings = meetings.filter(
    (m: Meeting) => m.status !== "COMPLETED",
  );

  return (
    <div className="mt-12 mb-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Sprint Video Syncs
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Real-time collaboration for your active cycle
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-lg active:scale-95"
          >
            <Plus size={14} />
            Schedule Sync
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 bg-secondary/20 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : activeMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMeetings.map((meeting: Meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              projectId={projectId}
              isManager={isManager}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 border-2 border-dashed border-border/50 rounded-[40px] bg-secondary/10 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-background rounded-3xl shadow-xl mb-4 text-muted-foreground/30">
            <Video size={32} />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            No meetings scheduled for this sprint
          </p>
        </div>
      )}
      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sprintId={sprintId}
        projectId={projectId}
      />
    </div>
  );
};

export default MeetingSection;
