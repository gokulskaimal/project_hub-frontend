"use client";

import React, { ReactNode } from "react";
import SocketNotification from "../notifications/SocketNotification";

type Props = {
  title: string;
  children: ReactNode;
  // Deprecated props kept optional to prevent breakage during transition if needed, 
  // but they won't be used.
  onAvatarClick?: () => void;
  avatarUrl?: string | null;
  avatarInitial?: string;
  onLogout?: () => void;
};

export default function DashboardLayout({ title, children }: Props) {
  return (
    <div className="flex flex-col h-full">
      <SocketNotification />
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
            <p className="text-gray-600">Manage your workspace</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
    </div>
  );
}