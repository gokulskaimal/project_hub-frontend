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
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetManagerMembersQuery,
  useGetManagerProjectsQuery,
  useGetManagerInvitationsQuery,
  useGetManagerOrganizationQuery,
} from "@/store/api/managerApiSlice";
import { useSocket } from "@/context/SocketContext";
import PremiumStatGrid from "@/components/ui/PremiumStatGrid";
import Link from "next/link";
import { EntityCard } from "@/components/ui/EntityCard";
import { getStatusColor } from "@/utils/projectUtils";

export default function ManagerDashboardPage() {
  const { data: organization } = useGetManagerOrganizationQuery();
  const { data: projects = [], refetch: refetchProjects } =
    useGetManagerProjectsQuery();
  const { data: members = [], refetch: refetchMembers } =
    useGetManagerMembersQuery();
  const { data: invites = [], refetch: refetchInvites } =
    useGetManagerInvitationsQuery();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("project:created", refetchProjects);
      socket.on("project:updated", refetchProjects);
      socket.on("member:joined", () => {
        refetchMembers();
        refetchInvites();
      });
      return () => {
        socket.off("project:created");
        socket.off("project:updated");
        socket.off("member:joined");
      };
    }
  }, [socket, refetchProjects, refetchMembers, refetchInvites]);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const onHoldProjects = projects.filter((p) => p.status === "ON_HOLD").length;
  const pendingInvites = invites.filter((i) => i.status === "PENDING").length;

  const dashboardStats = {
    total: members.length + pendingInvites,
    active: activeProjects,
    suspended: onHoldProjects,
    engagement:
      projects.length > 0 ? (activeProjects / projects.length) * 100 : 0,
  };

  return (
    <DashboardLayout title="Manager Hub">
      <div className="space-y-10 pb-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gray-900 px-10 py-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest">
                Executive Control
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Welcome back to{" "}
              <span className="text-blue-400">
                {organization?.name || "the Hub"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg font-medium max-w-2xl leading-relaxed">
              Your organization is currently managing{" "}
              <span className="text-white font-bold">
                {projects.length} projects
              </span>{" "}
              with{" "}
              <span className="text-white font-bold">
                {members.length} team members
              </span>
              .
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Layout className="w-6 h-6 text-blue-600" />
              Real-time Analytics
            </h2>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-2" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Live Sync
              </span>
            </div>
          </div>
          <PremiumStatGrid stats={dashboardStats} />
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
              {projects.slice(0, 4).map((project) => (
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
                  footerLeft={project.members
                    ?.slice(0, 3)
                    .map((m: any, i: number) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold ring-2 ring-gray-50"
                      >
                        {m.firstName?.[0] || "U"}
                      </div>
                    ))}
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
                onClick={() => (window as any).openInviteModal?.()}
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
                onClick={() => (window as any).openCreateProjectModal?.()}
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
