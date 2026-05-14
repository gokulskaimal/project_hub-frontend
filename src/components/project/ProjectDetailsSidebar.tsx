"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "@/types/auth";
import { UserPlus, Users } from "lucide-react";

interface ProjectDetailsSidebarProps {
  teamMembers: User[];
  isManager?: boolean;
  onAddMembers?: () => void;
}

export default function ProjectDetailsSidebar({
  teamMembers,
  isManager,
  onAddMembers,
}: ProjectDetailsSidebarProps) {
  return (
    <div className="w-full bg-card/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-60">
          <Users className="w-3.5 h-3.5 text-primary" />
          Team Members
        </h3>
        {isManager && (
          <button
            onClick={onAddMembers}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all group active:scale-90"
            title="Add Members"
          >
            <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="group flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl transition-all cursor-default border border-transparent hover:border-white/5"
          >
            <div className="shrink-0">
              <UserAvatar user={member} size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-tighter opacity-50 mt-0.5">
                {member.email}
              </p>
            </div>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              No members yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
