"use client";

import { usePathname } from "next/navigation";
import { LayoutList, KanbanSquare } from "lucide-react";
import Link from "next/link";

export default function MemberTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "List View", href: `/member/tasks`, icon: LayoutList, exact: true },
    {
      name: "Board View",
      href: `/member/tasks/board`,
      icon: KanbanSquare,
      exact: false,
    },
  ];

  const isActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full space-y-8">
      {/* Shared Header */}
      <div className="bg-card/30 backdrop-blur-xl border-b border-border/20 sticky top-0 z-20 pt-10 px-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4">
              MY TASKS
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.5)]" />
            </h1>
            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">
              Personal Task Dashboard • Managed
            </p>
          </div>
        </div>

        {/* Integration of Jira-style Tabs */}
        {/* Premium Navigation Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                                flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all duration-300
                                ${
                                  active
                                    ? "border-primary text-primary bg-primary/5 shadow-[0_4px_25px_-5px_rgba(var(--primary),0.3)]"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                                }
                            `}
              >
                <Icon size={14} className={active ? "animate-pulse" : ""} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto px-10 pb-16 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
