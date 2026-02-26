"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import api, { API_ROUTES } from "@/utils/api";
import {
  KanbanSquare,
  ArrowRight,
  LayoutGrid,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  teamMemberIds?: string[];
}

export default function GlobalBoardsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(API_ROUTES.PROJECTS.ROOT);
      setProjects(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200";
      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ARCHIVED":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "ON_HOLD":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "PLANNING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toUpperCase()) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "LOW":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <DashboardLayout title="Your Boards">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-blue-600" />
              Active Project Boards
            </h2>
            <p className="text-sm text-gray-500">
              Select a project to jump directly into its active sprint execution
              board.
            </p>
          </div>
          <div className="w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a board..."
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-48 animate-pulse"
              >
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <KanbanSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              No boards found
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              You don&apos;t have any boards matching that search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                href={`/manager/projects/${project.id}/board`}
                key={project.id}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden"
              >
                <div className="p-5 flex-1 flex flex-col border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}
                    >
                      {project.status || "PLANNING"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority || "MEDIUM"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                    {project.description || "No description."}
                  </p>
                </div>
                <div className="bg-gray-50/50 p-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600 font-medium">
                    <Users className="w-4 h-4 text-gray-400" />
                    {project.teamMemberIds?.length || 0} Members
                  </div>
                  <span className="text-blue-600 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Go to board <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
