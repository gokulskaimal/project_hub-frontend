"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAdminData } from "@/hooks/useAdminData"; 
import api, { API_ROUTES } from "@/utils/api";
import { Users, Building2, CreditCard } from "lucide-react";

export default function AdminDashboardPage() {
  const { accessToken } = useSelector((s: RootState) => s.auth);
  const { data: adminData, actions } = useAdminData(accessToken);
  const [plansCount, setPlansCount] = useState(0);

  useEffect(() => {
    actions.fetchData();
    fetchPlansCount();
  }, [actions.fetchData]);

  const fetchPlansCount = async () => {
    try {
      const response = await api.get(API_ROUTES.ADMIN.PLANS);
      if (response.data && Array.isArray(response.data.data)) {
        setPlansCount(response.data.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch plans count", error);
    }
  };

  const stats = [
    {
      label: "Total Organizations",
      value: adminData.orgs.length,
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      label: "Total Users",
      value: adminData.users.length,
      icon: Users,
      color: "bg-green-500",
    },
    {
      label: "Total Plans",
      value: plansCount,
      icon: CreditCard,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`p-4 rounded-lg ${stat.color} bg-opacity-10 mr-4`}>
              <stat.icon className={`w-8 h-8 ${stat.color.replace("bg-", "text-")}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {adminData.loading ? "..." : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
