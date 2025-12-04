"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import api, { API_ROUTES } from "@/utils/api";
import { Users, CheckCircle, Clock, Plus, UserPlus } from "lucide-react";
import InviteModal from "@/components/modals/InviteModal";

export default function ManagerDashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({
    members: 0,
    activeProjects: 0, // Placeholder
    pendingInvites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchStats = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        api.get(API_ROUTES.MANAGER.MEMBERS),
        api.get(API_ROUTES.MANAGER.INVITATIONS),
      ]);
      setStats({
        members: membersRes.data?.data?.length || 0,
        activeProjects: 12, // Mock data for now
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

  const statCards = [
    {
      label: "Team Members",
      value: stats.members,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending Invites",
      value: stats.pendingInvites,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your organization</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center transition-all hover:shadow-md">
              <div className={`p-4 rounded-lg ${stat.bgColor} mr-4`}>
                {/* <Icon className={`w-8 h-8 ${stat.textColor}`} /> */}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for Recent Activity or Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          No recent activity to show
        </div>
      </div>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={fetchStats}
      />
    </div>
  );
}
