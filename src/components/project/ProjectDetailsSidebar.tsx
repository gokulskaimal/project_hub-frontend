"use client";

import UserAvatar from "@/components/ui/UserAvatar";
import { User } from "@/types/auth";
import { Users } from "lucide-react";

interface ProjectDetailsSidebarProps {
  teamMembers: User[];
}

export default function ProjectDetailsSidebar({
  teamMembers,
}: ProjectDetailsSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <Users className="w-4 h-4 text-blue-600" />
        Team Members
      </h3>
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-default"
          >
            <UserAvatar user={member} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-[10px] font-medium text-gray-400 truncate">
                {member.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
