import React from "react";
import Link from "next/link";
import { LogOut, ChevronLeft, ChevronRight, X } from "lucide-react";
import { LucideIcon } from "lucide-react";

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
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          ${isCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
              <span className="text-white text-sm font-bold">PH</span>
            </div>
            {!isCollapsed && (
              <span className="text-gray-900 font-bold text-lg tracking-tight whitespace-nowrap animate-in fade-in duration-300">
                ProjectHub
              </span>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all absolute -right-3 top-8 z-10 shadow-sm"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100vh-140px)] scrollbar-hide">
          {links.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.name : ""}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "text-blue-600 bg-blue-50/50 font-semibold shadow-sm ring-1 ring-blue-100/50"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }
                  ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110
                    ${isCollapsed ? "w-6 h-6" : "w-5 h-5"}
                    ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
                {!isCollapsed && (
                  <span className="text-sm tracking-wide whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 group
              ${isCollapsed ? "justify-center" : ""}`}
          >
            <LogOut
              className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${isCollapsed ? "w-6 h-6" : "w-5 h-5"}`}
            />
            {!isCollapsed && (
              <span className="text-sm font-semibold tracking-wide whitespace-nowrap animate-in fade-in duration-300">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
