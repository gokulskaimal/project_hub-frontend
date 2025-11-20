"use client";

import { ReactNode } from "react";
import Image from "next/image";

type Props = {
  title: string;
  children: ReactNode;
  onAvatarClick?: () => void;
  avatarUrl?: string | null;
  avatarInitial?: string;
  onLogout?: () => void;
};

export default function DashboardLayout({ title, children, onAvatarClick, avatarUrl = null, avatarInitial = "U", onLogout }: Props) {
  const sidebarLinks = [
    { name: "Dashboard", active: true },
    // { name: "Projects" },
    // { name: "Kanban Board" },
    // { name: "Calendar" },
    // { name: "Chat" },
    // { name: "Tickets" },
    // { name: "Team" },
    // { name: "Billing" },
    // { name: "Settings", borderTop: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="h-16 px-6 border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">PM</span>
            </div>
            <span className="text-gray-900 font-semibold">ProjectHub</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? "text-blue-700 bg-blue-50 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              } `}
            >
              <span className="w-5 h-5 inline-block bg-gray-100 rounded" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 w-full max-w-xl">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-500 outline-none"
              placeholder="Search projects, tasks, users..."
              aria-label="Global search"
            />
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
              <span className="text-xs text-gray-500">⌘</span>
              <span className="text-xs text-gray-500">K</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-2">
            <button type="button" className="relative p-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-gray-300" aria-label="View notifications">
              <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-5 5-5-5h5V7a3 3 0 116 0v10zM9 12H4l5-5 5 5H9v5a3 3 0 01-6 0v-5z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full grid place-items-center">
                <span className="text-xs text-white font-semibold">2</span>
              </div>
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 text-sm border border-red-200 text-red-700 rounded hover:bg-red-50"
                aria-label="Logout"
                title="Logout"
              >
                Logout
              </button>
            )}
            <button
              onClick={onAvatarClick}
              className="w-8 h-8 bg-gray-100 rounded-full grid place-items-center hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-gray-900">{(avatarInitial || "U").toUpperCase()}</span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{title}</h1>
              <p className="text-gray-600">Manage your workspace</p>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
