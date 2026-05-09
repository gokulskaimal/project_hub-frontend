"use client";

import React, { useEffect } from "react";
import {
  Users,
  Briefcase,
  Plus,
  ArrowRight,
  Layout,
  Calendar,
  ListTodo,
  Rocket,
  TrendingUp,
  AlertCircle,
  Clock,
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
import { PortfolioHealthWidget } from "@/components/analytics/PortfolioHealthWidget";
import { WorkloadHeatmap } from "@/components/analytics/WorkloadHeatmap";
import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { ProgressArc } from "@/components/ui/ProgressArc";

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
    useGetManagerProjectsQuery({ page: 1, limit: 12 });
  const projects = projectsData?.items || [];

  const { refetch: refetchMembers } = useGetManagerMembersQuery({
    page: 1,
    limit: 12,
  });

  const { refetch: refetchInvites } = useGetManagerInvitationsQuery({
    page: 1,
    limit: 12,
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
    <DashboardLayout title="Manager Console">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6 sm:space-y-8 pb-12"
      >
        {/* Welcome Banner */}
        <motion.div variants={item}>
          <RoleBanner
            roleName="Manager"
            badgeText="Executive Authority"
            welcomeMessage={
              <>
                Operational Hub:{" "}
                <span className="text-white">
                  {organization?.name || "System"}
                </span>
              </>
            }
            description={
              <>
                Managing{" "}
                <span className="text-white border-b border-white/30 pb-0.5">
                  {stats?.projects?.total || 0} active nodes
                </span>{" "}
                with{" "}
                <span className="text-white/90">
                  {stats?.members?.total || 0} authorized operators
                </span>{" "}
                within the current organization fabric.
              </>
            }
          />
        </motion.div>

        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layout className="w-5 h-5 text-primary" />
              </div>
              Organization Overview
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
                color: "violet",
              },
              {
                label: "On Hold",
                value: stats?.projects?.onHold || 0,
                icon: Briefcase,
                color: "orange",
              },
              {
                label: "Efficiency",
                value: `${stats?.projects?.total && stats.projects.total > 0 ? Math.round((stats.projects.active / stats.projects.total) * 100) : 0}%`,
                icon: ListTodo,
                color: "emerald",
              },
            ]}
          />
        </motion.div>

        {/* Performance Analytics Section */}
        <motion.div variants={item} className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              Strategic Analytics
            </h2>
            <AnalyticsFilter value={timeframe} onChange={setTimeframe} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                    Top Performers
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                    Productivity trajectory
                  </p>
                </div>
              </div>
              <div className="h-[280px]">
                {analyticsError ? (
                  <div className="h-full flex items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
                    <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                ) : (
                  <AnalyticsBarChart
                    data={performanceData}
                    dataKey="value"
                    xKey="name"
                    color="var(--primary)"
                  />
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Global Velocity
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  System-wide point delivery
                </p>
              </div>
              <div className="h-[280px]">
                <AnalyticsBarChart
                  data={velocityData}
                  dataKey="value"
                  xKey="name"
                  color="var(--primary)"
                />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Task Distribution
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  Operational pipeline status
                </p>
              </div>
              <div className="h-[280px]">
                <StatusDistribution data={taskDistributionData} />
              </div>
            </div>
          </div>

          {/* New Executive Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Team Load Balance
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  Workload heatmap across active team nodes
                </p>
              </div>
              <WorkloadHeatmap
                data={analyticsData?.workload || []}
                loading={analyticsLoading}
              />
            </div>
            <div className="glass-card rounded-3xl p-8 border border-border/50">
              <div className="mb-8">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Portfolio Integrity
                </h3>
                <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-widest">
                  Real-time system health audit
                </p>
              </div>
              <PortfolioHealthWidget
                projects={analyticsData?.health || []}
                loading={analyticsLoading}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects Section */}
          <motion.div variants={item} className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                Active Projects
              </h2>
              <Link
                href="/manager/projects"
                className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
              >
                View Repository
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 4).map((project: Project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -5 }}
                  className="glass-card p-6 rounded-3xl border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                  onClick={() =>
                    (window.location.href = `/manager/projects/${project.id}`)
                  }
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors uppercase">
                        {project.name}
                      </h4>
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(project.status)}`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="w-14 h-14 shrink-0 -mt-2">
                      <ProgressArc
                        value={Number(project.progress) || 0}
                        max={100}
                        size={56}
                        color="var(--primary)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-2">
                    <div className="flex -space-x-2">
                      {project.members
                        ?.slice(0, 3)
                        .map((m: { firstName?: string }, i: number) => (
                          <div
                            key={i}
                            className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[9px] font-black text-foreground shadow-sm"
                          >
                            {m.firstName?.[0] || "U"}
                          </div>
                        ))}
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      {project.members?.length || 0} Operators
                    </span>
                  </div>
                </motion.div>
              ))}
              {projects.length === 0 && (
                <div className="md:col-span-2 py-16 glass-card rounded-3xl flex flex-col items-center justify-center text-center opacity-60">
                  <Rocket className="w-10 h-10 text-muted-foreground mb-4" />
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                    No Projects Found
                  </h3>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div variants={item} className="space-y-6">
            <h2 className="text-xl font-black text-foreground tracking-tight px-1 text-center">
              Command Suite
            </h2>
            <div className="glass-card rounded-3xl p-8 border border-border/50 shadow-2xl space-y-4">
              <button
                onClick={openInviteModal}
                className="w-full flex items-center justify-between p-5 bg-primary hover:bg-violet-600 rounded-2xl group transition-all duration-300 shadow-xl shadow-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-white text-xs uppercase tracking-widest">
                    Authorize Member
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>

              <button
                onClick={openCreateProjectModal}
                className="w-full flex items-center justify-between p-5 bg-secondary hover:bg-secondary/80 rounded-2xl group transition-all duration-300 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-black text-foreground text-xs uppercase tracking-widest">
                    Host New Node
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
              </button>

              <div className="pt-8 mt-4 border-t border-border/30">
                <div className="flex items-center gap-2 mb-6 px-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Scheduled Events
                  </span>
                </div>
                <div className="p-8 glass-card rounded-2xl border border-dashed border-border/50 text-center flex flex-col items-center">
                  <Clock className="w-6 h-6 text-muted-foreground/20 mb-2" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                    System nominal. <br /> No active alerts.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
