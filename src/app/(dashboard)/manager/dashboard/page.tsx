"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import api, { API_ROUTES } from "@/utils/api";
import { Users, CheckCircle, Clock, Plus, UserPlus, Activity, ArrowUpRight } from "lucide-react";
import InviteModal from "@/components/modals/InviteModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { useSocket } from "@/context/SocketContext";

export default function ManagerDashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({
    members: 0,
    activeProjects: 0,
    pendingInvites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const fetchStats = async () => {
    try {
      const [membersRes, invitesRes, projectsRes] = await Promise.all([
        api.get(API_ROUTES.MANAGER.MEMBERS),
        api.get(API_ROUTES.MANAGER.INVITATIONS),
        api.get(API_ROUTES.PROJECTS.ROOT)
      ]);
      
      const projects = projectsRes.data?.data || [];
      const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;

      setStats({
        members: membersRes.data?.data?.length || 0,
        activeProjects: activeProjects, 
        pendingInvites: invitesRes.data?.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // [NEW] Real-time Updates
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleProjectCreated = (newProject: any) => {
        if (newProject.status === 'ACTIVE') {
            setStats(prev => ({ ...prev, activeProjects: prev.activeProjects + 1 }));
            // Optionally fetchStats() to be safe or update local
        }
    };

    const handleProjectUpdated = (updatedProject: any) => {
        // Since we only track 'count' here, re-fetching is safest to handle status changes (e.g. Active -> Completed)
        fetchStats(); 
    };

    socket.on("project:created", handleProjectCreated);
    socket.on("project:updated", handleProjectUpdated);

    return () => {
        socket.off("project:created", handleProjectCreated);
        socket.off("project:updated", handleProjectUpdated);
    };
  }, [socket, isConnected]);

  const statCards = [
    {
      label: "Total Members",
      value: stats.members,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/manager/members"
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      link: "/manager/projects"
    },
    {
      label: "Pending Invites",
      value: stats.pendingInvites,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/manager/invites"
    },
  ];

  return (
    <DashboardLayout title="Overview">
      <div className="space-y-8">
        {/* Header Actions */}
        {/* Header Actions */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
             <div>
                 <h2 className="text-lg font-bold text-gray-900">Dashboard Overview</h2>
                 <p className="text-sm text-gray-500">Manage your team and projects efficiently.</p>
             </div>
             <div className="flex gap-3">
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                </button>
                <button 
                    onClick={() => setShowProjectModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm hover:shadow"
                >
                    <Plus className="w-4 h-4" />
                    New Project
                </button>
            </div>
         </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.link} className="block group">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center transition-all duration-200 hover:shadow-md hover:-translate-y-1">
                    <div className={`p-3 rounded-lg ${stat.bgColor} mr-4 transition-colors group-hover:bg-opacity-80`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                        {loading ? "..." : stat.value}
                        </h3>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>
          </div>
          
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                 <Activity className="w-6 h-6" />
             </div>
             <p className="text-gray-900 font-medium">No recent activity</p>
             <p className="text-gray-500 text-sm mt-1">Your team's actions will appear here</p>
          </div>
        </div>

        <InviteModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            onSuccess={fetchStats}
        />
        <CreateProjectModal 
            isOpen={showProjectModal}
            onClose={() => setShowProjectModal(false)}
            onSuccess={fetchStats}
        />
      </div>
    </DashboardLayout>
  );
}
