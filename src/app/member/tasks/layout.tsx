"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutList, KanbanSquare } from "lucide-react";
import Link from "next/link";

export default function MemberTasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "List View", href: `/member/tasks`, icon: LayoutList, exact: true },
    { name: "Board View", href: `/member/tasks/board`, icon: KanbanSquare, exact: false },
  ];

  const isActive = (tab: typeof tabs[0]) => {
     if (tab.exact) return pathname === tab.href;
     return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full space-y-6">
      {/* Shared Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-8 px-8">
          <div className="mb-6 flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        My Tasks
                     </h1>
                     <p className="text-sm text-gray-500 mt-1">Track and update your assigned work across all projects</p>
                </div>
          </div>

          {/* Integration of Jira-style Tabs */}
          <div className="flex items-center gap-1">
                {tabs.map((tab) => {
                    const active = isActive(tab);
                    const Icon = tab.icon;
                    return (
                        <Link 
                            key={tab.name} 
                            href={tab.href}
                            className={`
                                flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                                ${active 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <Icon size={16} />
                            {tab.name}
                        </Link>
                    );
                })}
          </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto px-1 pb-6">
        {children}
      </div>
    </div>
  );
}
