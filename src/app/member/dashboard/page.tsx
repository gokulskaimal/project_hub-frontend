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
import { Project, Task } from "@/types/project";
import { User } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import {
  useGetMyProjectsQuery,
  useGetMyTasksQuery,
  useGetMyVelocityQuery,
} from "@/store/api/projectApiSlice";
import { useGetMemberAnalyticsQuery } from "@/store/api/userApiSlice";
import { getPriorityColor, getStatusColor } from "@/utils/projectUtils";
import { StatCard } from "@/components/ui/StatCard";
import { EntityCard } from "@/components/ui/EntityCard";
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

  const tasks = tasksData?.items || [];

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetMemberAnalyticsQuery(timeframe, { skip: !user });

  // Real-time Updates
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // 1. New Project Assignment
    const handleProjectAssigned = (newProject: Project) => {
      notifier.success(MESSAGES.PROJECTS.ASSIGNED_SUCCESS(newProject.name));
      refetchProjects();
    };

    // 2. Project Updates (Status/Progress)
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
  const taskStats = mapStatusDistribution(analyticsData?.taskDistribution);

  const loading = projectsLoading || tasksLoading || analyticsLoading;

  if (loading) {
    return (
      <DashboardLayout title="Member Hub">
        <div className="p-6 space-y-10">
          <div className="h-48 bg-gray-50 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const pendingTasks = tasks.filter(
    (t: any) => t.status === "TODO" || t.status === "IN_PROGRESS",
  ).length;
  const criticalTasks = tasks.filter(
    (t: any) => t.priority === "CRITICAL" && t.status !== "DONE",
  ).length;
  return (
    <DashboardLayout title="Member Hub">
      <div className="space-y-8 pb-12">
        {/* Premium Welcome Banner */}
        <RoleBanner
          roleName="Member"
          badgeText="Mission Control"
          welcomeMessage={
            <>
              Welcome,{" "}
              <span className="text-blue-400">
                {user?.firstName || "Member"}
              </span>
            </>
          }
          description={
            <>
              You have{" "}
              <span className="text-white font-bold">
                {pendingTasks} pending tasks
              </span>{" "}
              and{" "}
              <span className="text-white font-bold">
                {criticalTasks} critical issues
              </span>{" "}
              requiring your attention today.
            </>
          }
        />

        {/* Stats Grid */}
        <PremiumStatGrid
          items={[
            {
              label: "Projects",
              value: projects.length,
              icon: Briefcase,
              color: "purple",
            },
            {
              label: "Pending",
              value: pendingTasks,
              icon: Clock,
              color: "orange",
            },
            {
              label: "Critical",
              value: criticalTasks,
              icon: AlertCircle,
              color: "red",
            },
            {
              label: "Done",
              value: completedTasks,
              icon: CheckCircle2,
              color: "green",
            },
          ]}
        />

        {/* Performance & Analytics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Performance Insight
            </h2>
            <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Velocity Trajectory
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    Points delivered across {timeframe.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Active Tracking
                  </span>
                </div>
              </div>
              <div className="h-[300px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl border border-dashed border-gray-100">
                    <TrendingUp className="w-8 h-8 text-blue-200" />
                  </div>
                ) : analyticsError ? (
                  <div className="h-full flex items-center justify-center p-12 text-center border-2 border-dashed border-red-50 rounded-xl">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
                      Analytics Unavailable
                    </p>
                  </div>
                ) : (
                  <AnalyticsBarChart
                    data={velocityPoints}
                    color="#3b82f6"
                    label="Points"
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Task Ecosystem
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  Distribution by lifecycle stage
                </p>
              </div>
              <div className="h-[250px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl border border-dashed border-gray-100">
                    <CheckSquare className="w-8 h-8 text-blue-200" />
                  </div>
                ) : (
                  <StatusDistribution data={taskStats} />
                )}
              </div>
              <div className="mt-6 space-y-2">
                {taskStats.map((item: { name: string; value: number }) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest"
                  >
                    <span className="text-gray-400">{item.name}</span>
                    <span className="text-gray-900">{item.value} Tasks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Recent Tasks
              </h2>
              <Link
                href="/member/tasks"
                className="text-[10px] sm:text-sm font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[250px] sm:min-h-[300px]">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 sm:p-12 text-center">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <CheckSquare className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Clear for now
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tasks.slice(0, 5).map((task: any) => (
                    <Link
                      key={task.id}
                      href={`/member/projects/${task.projectId}`}
                      className="block p-3 sm:p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                          <div
                            className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${getPriorityColor(task.priority)}`}
                          />
                          <div className="min-w-0">
                            <h4 className="text-[13px] sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] uppercase font-black text-gray-400 tracking-wider truncate max-w-[100px] sm:max-w-none">
                                {task.project?.name || "Project"}
                              </span>
                              {task.dueDate && (
                                <>
                                  <span className="text-gray-200">/</span>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      new Date(task.dueDate) < new Date()
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                  >
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
                          className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black border uppercase tracking-widest whitespace-nowrap shrink-0 ${getStatusColor(task.status)}`}
                        >
                          {task.status === "IN_PROGRESS"
                            ? "Progress"
                            : task.status.charAt(0) +
                              task.status.slice(1).toLowerCase().split("_")[0]}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats / Projects Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
              <Link
                href="/member/projects"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
              {projects.slice(0, 4).map((project: any) => (
                <EntityCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  description={project.description}
                  icon={Briefcase}
                  href={`/member/projects/${project.id}`}
                  status={project.status}
                  statusColor={getStatusColor(project.status)}
                  sideBorderColor={
                    project.status === "ACTIVE"
                      ? "bg-green-500"
                      : project.status === "ON_HOLD"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }
                  footerRight={
                    <div className="w-16 sm:w-24 bg-gray-100 rounded-full h-1 sm:h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Number(project.progress) || 0}%` }}
                        // webint:ignore inline styles necessary for dynamic progress rendering
                      />
                    </div>
                  }
                />
              ))}
              {projects.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  No projects joined yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
