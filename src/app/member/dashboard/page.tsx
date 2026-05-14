"use client";

import React, { useEffect, useMemo } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckSquare,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Project } from "@/types/project";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import {
  useGetMyProjectsQuery,
  useGetMyTasksQuery,
} from "@/store/api/projectApiSlice";
import { useGetMemberAnalyticsQuery } from "@/store/api/userApiSlice";
import { getPriorityColor, getStatusColor } from "@/utils/projectUtils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import {
  AnalyticsFilter,
  TimeFrame,
} from "@/components/analytics/AnalyticsFilter";
import {
  AnalyticsBarChart,
  StatusDistribution,
} from "@/components/analytics/AnalyticsCharts";
import { mapRevenueData, mapStatusDistribution } from "@/utils/analyticsUtils";
import { RoleBanner } from "@/components/ui/RoleBanner";
import { ProgressArc } from "@/components/ui/ProgressArc";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = React.useState<TimeFrame>("YEAR");
  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProjects,
  } = useGetMyProjectsQuery({ page: 1, limit: 100 }, { skip: !user });

  const projects = projectsData?.items || [];

  const { data: tasksData, isLoading: tasksLoading } = useGetMyTasksQuery(
    { page: 1, limit: 100 },
    { skip: !user },
  );

  const tasks = useMemo(() => tasksData?.items || [], [tasksData?.items]);

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetMemberAnalyticsQuery(timeframe, { skip: !user });

  // Real-time Updates
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleProjectAssigned = (newProject: Project) => {
      notifier.success(MESSAGES.PROJECTS.ASSIGNED_SUCCESS(newProject.name));
      refetchProjects();
    };

    const handleProjectUpdated = () => {
      refetchProjects();
    };

    socket.on("project:assigned", handleProjectAssigned);
    socket.on("project:updated", handleProjectUpdated);

    return () => {
      socket.off("project:assigned", handleProjectAssigned);
      socket.off("project:updated", handleProjectUpdated);
    };
  }, [socket, isConnected, refetchProjects]);

  const velocityPoints = mapRevenueData(analyticsData?.velocity);
  const taskStats = mapStatusDistribution(analyticsData?.tasks);

  const activeTasksList = useMemo(() => {
    return tasks.filter((t) => t.status !== "DONE");
  }, [tasks]);

  const loading = projectsLoading || tasksLoading || analyticsLoading;

  if (loading) {
    return (
      <DashboardLayout title="My Dashboard">
        <div className="p-6 space-y-10">
          <div className="h-48 bg-secondary/30 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-secondary/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const pendingTasks = tasks.filter(
    (t) =>
      t.status === "TODO" ||
      t.status === "IN_PROGRESS" ||
      t.status === "REVIEW",
  ).length;
  const criticalTasks = tasks.filter(
    (t) => t.priority === "CRITICAL" && t.status !== "DONE",
  ).length;

  return (
    <DashboardLayout title="My Dashboard">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10 pb-12"
      >
        {/* Premium Welcome Banner */}
        <motion.div variants={item}>
          <RoleBanner
            roleName="Member"
            badgeText="Tasks"
            welcomeMessage={
              <>
                Welcome,{" "}
                <span className="text-white">
                  {user?.firstName || "Member"}
                </span>
              </>
            }
            description={
              <>
                You have{" "}
                <span className="text-white border-b border-white/30 pb-0.5">
                  {pendingTasks} tasks to do
                </span>{" "}
                and{" "}
                <span className="text-white/90">
                  {criticalTasks} urgent tasks
                </span>{" "}
                that need your help today.
              </>
            }
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item}>
          <PremiumStatGrid
            items={[
              {
                label: "Projects",
                value: projects.length,
                icon: Briefcase,
                color: "blue",
              },
              {
                label: "Pending",
                value: pendingTasks,
                icon: Clock,
                color: "orange",
              },
              {
                label: "Urgent",
                value: criticalTasks,
                icon: AlertCircle,
                color: "red",
              },
              {
                label: "Completed",
                value: completedTasks,
                icon: CheckCircle2,
                color: "emerald",
              },
            ]}
          />
        </motion.div>

        {/* Performance & Analytics */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Stats
            </h2>
            <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                    My Progress
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                    Tasks completed
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    Online
                  </span>
                </div>
              </div>
              <div className="h-[320px]">
                {analyticsError ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Stats Not Available
                    </p>
                  </div>
                ) : (
                  <AnalyticsBarChart
                    data={velocityPoints}
                    dataKey="value"
                    xKey="name"
                    color="var(--primary)"
                  />
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/50 flex flex-col">
              <div className="mb-8">
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">
                  Task Status
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  Task Status
                </p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="h-[280px] w-full">
                  <StatusDistribution data={taskStats} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Tasks */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
                Active Tasks
              </h2>
              <Link
                href="/member/tasks"
                className="group flex items-center gap-2 transition-all"
              >
                <span className="text-[10px] font-black text-muted-foreground group-hover:text-primary uppercase tracking-widest transition-colors">
                  View All
                </span>
                <div className="w-6 h-6 rounded-full bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </div>

            <div className="glass-card rounded-3xl border border-border/50 overflow-hidden shadow-sm">
              {activeTasksList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] p-12 text-center">
                  <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    You&apos;re all done!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {activeTasksList.slice(0, 5).map((task) => (
                    <Link
                      key={task.id}
                      href={`/member/projects/${task.projectId}`}
                      className="block p-5 hover:bg-secondary/20 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-1.5 h-8 rounded-full shrink-0 ${getPriorityColor(task.priority)} shadow-[0_0_10px_currentcolor] opacity-60`}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] uppercase font-black text-muted-foreground tracking-widest truncate max-w-[120px]">
                                {task.project?.name || "Global"}
                              </span>
                              {task.dueDate && (
                                <>
                                  <span className="text-border">/</span>
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-widest ${
                                      new Date(task.dueDate) < new Date()
                                        ? "text-rose-500"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    Due on{" "}
                                    {new Date(task.dueDate).toLocaleDateString(
                                      [],
                                      { month: "short", day: "numeric" },
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest shrink-0 transition-all group-hover:scale-105 ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats / Projects Preview */}
          <motion.div variants={item} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                My Projects
              </h2>
              <Link
                href="/member/projects"
                className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-3xl border border-border/50">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                    No projects found <br /> in your account.
                  </p>
                </div>
              ) : (
                projects.slice(0, 4).map((project: Project, pIdx: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + pIdx * 0.1 }}
                    className="p-5 glass-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all group cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/member/projects/${project.id}`)
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-black text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
                          {project.name}
                        </h4>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                          {project.status}
                        </p>
                      </div>
                      <div className="w-12 h-12 shrink-0">
                        <ProgressArc
                          value={Number(project.progress) || 0}
                          max={100}
                          size={48}
                          color="var(--primary)"
                        />
                      </div>
                    </div>
                    <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
