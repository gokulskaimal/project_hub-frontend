"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "@/types/auth";

interface ProjectDetailsSidebarProps {
  teamMembers: User[];
}

export default function ProjectDetailsSidebar({
  teamMembers,
}: ProjectDetailsSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Team Members
      </h3>
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            <UserAvatar user={member} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-[10px] text-gray-500">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
