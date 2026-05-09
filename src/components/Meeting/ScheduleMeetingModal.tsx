import React, { useState } from "react";
import { X, Video, Calendar, Type } from "lucide-react";
import { useCreateMeetingMutation } from "@/store/api/projectApiSlice";
import { notifier } from "@/utils/notifier";
import { Meeting } from "@/types/meeting";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  projectId: string;
}

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  sprintId,
  projectId,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("STANDUP");
  const [scheduledAt, setScheduledAt] = useState("");
  const [createMeeting, { isLoading }] = useCreateMeetingMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Ensure the date is valid before converting to ISO
    const dateObj = new Date(scheduledAt);
    if (isNaN(dateObj.getTime())) {
      notifier.error(null, "Please select a valid date and time");
      return;
    }
    try {
      await createMeeting({
        sprintId,
        projectId,
        title,
        type: type as Meeting["type"],
        scheduledAt: dateObj.toISOString(),
      }).unwrap();
      notifier.success("Meeting scheduled successfully!");
      onClose();
    } catch (err) {
      notifier.error(err, "Failed to schedule meeting");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Video size={24} />
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                Schedule Meeting
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Meeting Title
              </label>
              <div className="relative">
                <Type
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all font-bold"
                  placeholder="e.g. Daily Sync"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Meeting Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Meeting["type"])}
                className="w-full bg-secondary/30 border border-border/50 rounded-2xl py-3.5 px-4 outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all font-bold appearance-none cursor-pointer"
              >
                <option value="STANDUP">Standup</option>
                <option value="REVIEW">Sprint Review</option>
                <option value="RETROSPECTIVE">Sprint Retrospective</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Date & Time
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  required
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all font-bold"
                />
              </div>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? "Scheduling..." : "Create Meeting"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
