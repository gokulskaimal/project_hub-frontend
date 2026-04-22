"use client";

import React from "react";
import Link from "next/link";
import { LogOut, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

interface SidebarLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
  links: SidebarLink[];
  pathname: string;
  handleLogout: () => void;
  role: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleSidebar,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  links,
  pathname,
  handleLogout,
  role,
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] bg-card border-r border-border transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 w-64 max-w-[85vw]
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="h-20 px-6 border-b border-border flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <span className="text-white text-sm font-black">PH</span>
            </div>
            {!isCollapsed && (
              <span className="text-foreground font-black text-xl tracking-tighter whitespace-nowrap animate-in fade-in duration-300">
                ProjectHub
              </span>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-all absolute -right-3 top-10 z-10 shadow-xl"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
          <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide">
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                    ${
                      isActive
                        ? "text-primary backgroundColor: bg-primary/10 font-black shadow-inner ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }
                    ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`shrink-0 transition-transform duration-300 group-hover:scale-110
                      ${isCollapsed ? "w-6 h-6" : "w-5 h-5"}
                      ${isActive ? "text-primary glow-indigo" : "text-muted-foreground"}`}
                  />
                  {!isCollapsed && (
                    <span className="text-[13px] font-bold tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-400">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 pt-4 border-t border-border">
            {!isCollapsed && (
              <div className="px-2">
                <ThemeToggle />
              </div>
            )}

            <button
              onClick={handleLogout}
              title={isCollapsed ? "Logout" : ""}
              className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300 group
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <LogOut
                className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
              />
              {!isCollapsed && (
                <span className="text-[13px] font-black tracking-widest uppercase whitespace-nowrap animate-in fade-in duration-300">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
