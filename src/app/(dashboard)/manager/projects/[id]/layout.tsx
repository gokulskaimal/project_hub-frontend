"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import { useGetProjectByIdQuery } from "@/store/api/projectApiSlice";
import {
  ArrowLeft,
  LayoutList,
  KanbanSquare,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = params.id as string;

  const { data: project } = useGetProjectByIdQuery(projectId);

  const tabs = [
    {
      name: "Overview",
      href: `/manager/projects/${projectId}`,
      icon: LayoutList,
      exact: true,
    },
    {
      name: "Board",
      href: `/manager/projects/${projectId}/board`,
      icon: KanbanSquare,
      exact: false,
    },
    // Future tabs:
    // { name: "Team", href: `/manager/projects/${projectId}/team`, icon: Users },
    // { name: "Settings", href: `/manager/projects/${projectId}/settings`, icon: Settings },
  ];

  const isActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full space-y-6">
      {/* Shared Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 pt-6 px-6">
        <div className="mb-4">
          <button
            onClick={() => router.push("/manager/projects")}
            className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {project ? project.name : "Loading..."}
                {project && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                      project.status === "ACTIVE"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-gray-50 text-gray-500 border-gray-100"
                    }`}
                  >
                    {project.status}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {project?.description}
              </p>
            </div>
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
                                ${
                                  active
                                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
      <div className="flex-1 overflow-auto px-1 pb-6">{children}</div>
    </div>
  );
}
