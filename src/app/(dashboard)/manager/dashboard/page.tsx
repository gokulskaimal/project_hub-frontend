"use client";

import React, { useEffect } from "react";
import {
  Users,
  Briefcase,
  Mail,
  Plus,
  ArrowRight,
  Layout,
  Calendar,
  ListTodo,
  Rocket,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetManagerMembersQuery,
  useGetManagerProjectsQuery,
  useGetManagerInvitationsQuery,
  useGetManagerOrganizationQuery,
  useGetManagerDashboardStatsQuery,
  useGetManagerAnalyticsQuery,
} from "@/store/api/managerApiSlice";
import { useSocket } from "@/context/SocketContext";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import Link from "next/link";
import { EntityCard } from "@/components/ui/EntityCard";
import { getStatusColor } from "@/utils/projectUtils";
import { RoleBanner } from "@/components/ui/RoleBanner";
import { useManagerModals } from "@/context/ManagerModalContext";
import {
  AnalyticsFilter,
  TimeFrame,
} from "@/components/analytics/AnalyticsFilter";
import {
  AnalyticsBarChart,
  StatusDistribution,
} from "@/components/analytics/AnalyticsCharts";
import {
  mapPerformanceData,
  mapStatusDistribution,
  mapRevenueData,
} from "@/utils/analyticsUtils";

export default function ManagerDashboardPage() {
  const { openInviteModal, openCreateProjectModal } = useManagerModals();
  const [timeframe, setTimeframe] = React.useState<TimeFrame>("YEAR");
  const { data: organization } = useGetManagerOrganizationQuery();

  // Real-time Dashboard Stats
  const { data: stats, refetch: refetchStats } =
    useGetManagerDashboardStatsQuery();

  // Analytics Data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useGetManagerAnalyticsQuery(timeframe);

  const performanceData = mapPerformanceData(analyticsData?.performance);
  const taskDistributionData = mapStatusDistribution(analyticsData?.tasks);
  const velocityData = mapRevenueData(analyticsData?.velocity);

  const { data: projectsData, refetch: refetchProjects } =
    useGetManagerProjectsQuery({ page: 1, limit: 10 });
  const projects = projectsData?.items || [];

  const { refetch: refetchMembers } = useGetManagerMembersQuery({
    page: 1,
    limit: 10,
  });

  const { refetch: refetchInvites } = useGetManagerInvitationsQuery({
    page: 1,
    limit: 10,
  });

  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("project:created", () => {
        refetchProjects();
        refetchStats();
      });
      socket.on("project:updated", () => {
        refetchProjects();
        refetchStats();
      });
      socket.on("member:joined", () => {
        refetchMembers();
        refetchInvites();
        refetchStats();
      });
      return () => {
        socket.off("project:created");
        socket.off("project:updated");
        socket.off("member:joined");
      };
    }
  }, [socket, refetchProjects, refetchMembers, refetchInvites, refetchStats]);

  return (
    <DashboardLayout title="Manager Hub">
      <div className="space-y-10 pb-12">
        {/* Welcome Banner */}
        <RoleBanner
          roleName="Manager"
          badgeText="Executive Control"
          welcomeMessage={
            <>
              Welcome back to{" "}
              <span className="text-blue-400">
                {organization?.name || "the Hub"}
              </span>
            </>
          }
          description={
            <>
              Your organization is currently managing{" "}
              <span className="text-white font-bold">
                {stats?.projects?.total || 0} projects
              </span>{" "}
              with{" "}
              <span className="text-white font-bold">
                {stats?.members?.total || 0} team members
              </span>
              .
            </>
          }
        />

        <div>
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Layout className="w-6 h-6 text-blue-600" />
              Organization Analytics
            </h2>
          </div>
          <PremiumStatGrid
            items={[
              {
                label: "Total Force",
                value:
                  (stats?.members?.total || 0) + (stats?.invites?.pending || 0),
                icon: Users,
                color: "blue",
              },
              {
                label: "Active Projects",
                value: stats?.projects?.active || 0,
                icon: Rocket,
                color: "indigo",
              },
              {
                label: "On Hold",
                value: stats?.projects?.onHold || 0,
                icon: Briefcase,
                color: "amber",
              },
              {
                label: "Efficiency",
                value: `${stats?.projects?.total && stats.projects.total > 0 ? Math.round((stats.projects.active / stats.projects.total) * 100) : 0}%`,
                icon: ListTodo,
                color: "purple",
              },
            ]}
          />
        </div>

        {/* Performance Analytics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Performance Analytics
            </h2>
            <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Top Performers
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    Team member productivity
                  </p>
                </div>
              </div>
              <div className="h-[250px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl border border-dashed border-gray-100">
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
                ) : analyticsError ? (
                  <div className="h-full flex items-center justify-center p-12 text-center border-2 border-dashed border-red-50 rounded-xl">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
                      Analytics Unavailable
                    </p>
                  </div>
                ) : (
                  <AnalyticsBarChart
                    data={performanceData}
                    color="#8b5cf6"
                    label="Points"
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Global Velocity
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  Points delivered across the org
                </p>
              </div>
              <div className="h-[250px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl border border-dashed border-gray-100">
                    <TrendingUp className="w-8 h-8 text-blue-200" />
                  </div>
                ) : (
                  <AnalyticsBarChart
                    data={velocityData}
                    color="#3b82f6"
                    label="Total Points"
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  Task Distribution
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  By status
                </p>
              </div>
              <div className="h-[250px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded-xl border border-dashed border-gray-100">
                    <ListTodo className="w-8 h-8 text-blue-200" />
                  </div>
                ) : (
                  <StatusDistribution data={taskDistributionData} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <Rocket className="w-6 h-6 text-indigo-600" />
                Recent Projects
              </h2>
              <Link
                href="/manager/projects"
                className="text-sm font-black text-blue-600 hover:text-blue-700 transition-all flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 4).map((project: any) => (
                <EntityCard
                  key={project.id}
                  id={project.id}
                  title={project.name}
                  description={
                    project.description || "No description provided."
                  }
                  icon={Briefcase}
                  href={`/manager/projects/${project.id}`}
                  status={project.status}
                  statusColor={getStatusColor(project.status)}
                  sideBorderColor={
                    project.status === "ACTIVE"
                      ? "bg-green-500"
                      : project.status === "ON_HOLD"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }
                  footerLeft={project.members?.slice(0, 3).map(
                    (
                      m: {
                        firstName?: string;
                        lastName?: string;
                        email?: string;
                      },
                      i: number,
                    ) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold ring-2 ring-gray-50"
                      >
                        {m.firstName?.[0] || "U"}
                      </div>
                    ),
                  )}
                  footerRight={`${project.members?.length || project.teamMemberIds?.length || 0} Members`}
                />
              ))}
              {projects.length === 0 && (
                <div className="md:col-span-2 py-12 bg-white border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Rocket className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    No Projects Yet
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Start by creating your first flagship project.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2 px-4 text-center justify-center">
              Command Center
            </h2>
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-4">
              <button
                onClick={openInviteModal}
                className="w-full flex items-center justify-between p-5 bg-blue-50 hover:bg-blue-600 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-500 text-blue-600 group-hover:text-white transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-black text-blue-900 group-hover:text-white transition-colors">
                    Invite Team Member
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                onClick={openCreateProjectModal}
                className="w-full flex items-center justify-between p-5 bg-indigo-50 hover:bg-indigo-600 rounded-xl group transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-indigo-500 text-indigo-600 group-hover:text-white transition-all">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-black text-indigo-900 group-hover:text-white transition-colors">
                    Start New Project
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Upcoming Deadlines
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50/50 rounded-xl flex items-center justify-center py-8 text-center">
                    <p className="text-sm font-medium text-gray-400">
                      No immediate deadlines.
                      <br />
                      Relax, you&apos;re on schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
