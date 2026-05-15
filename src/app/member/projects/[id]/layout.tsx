"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import { useGetProjectByIdQuery } from "@/store/api/projectApiSlice";
import { ArrowLeft, LayoutList, KanbanSquare } from "lucide-react";
import Link from "next/link";

export default function MemberProjectLayout({
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
      href: `/member/projects/${projectId}`,
      icon: LayoutList,
      exact: true,
    },
    {
      name: "Board",
      href: `/member/projects/${projectId}/board`,
      icon: KanbanSquare,
      exact: false,
    },
  ];

  const isActive = (tab: (typeof tabs)[0]) => {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full space-y-6">
      {/* Shared Header */}
      <div className="bg-card/30 backdrop-blur-xl border-b border-border/20 sticky top-0 z-20 pt-8 px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/member/projects")}
            className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all mb-4 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-1" />{" "}
            BACK TO PROJECTS
          </button>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tighter">
                {project ? project.name : "LOADING..."}
                {project && (
                  <span
                    className={`text-[9px] px-3 py-1 rounded-xl border font-black uppercase tracking-[0.2em] shadow-2xl ${
                      project.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-secondary/30 text-muted-foreground border-border/20"
                    }`}
                  >
                    {project.status === "ACTIVE" ? "Active" : project.status}
                  </span>
                )}
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground/70 max-w-2xl leading-relaxed italic border-l-2 border-primary/20 pl-4">
                {project?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4">
          {tabs.map((tab) => {
            const active = isActive(tab);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                                flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all duration-300
                                ${
                                  active
                                    ? "border-primary text-primary bg-primary/5 shadow-[0_4px_20px_-4px_rgba(var(--primary),0.3)]"
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
      <div className="flex-1 overflow-auto px-8 pb-12 custom-scrollbar">
        {children}
      </div>
    </div>
  );
}
