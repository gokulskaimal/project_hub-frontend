"use client";

import React, { useEffect, useState } from "react";
import { projectService, Project } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, ArrowRight, MoreHorizontal, Edit2 } from "lucide-react";
import Link from "next/link";

export default function MemberProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controls State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const data = await projectService.getMyProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
        case 'ACTIVE': return 'bg-green-50 text-green-700 border-green-200';
        case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'ARCHIVED': return 'bg-gray-50 text-gray-600 border-gray-200';
        case 'ON_HOLD': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'PLANNING': return 'bg-purple-50 text-purple-700 border-purple-200';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
      switch ((priority || '').toUpperCase()) {
          case 'CRITICAL': return 'text-red-700 bg-red-50 border-red-200';
          case 'HIGH': return 'text-orange-700 bg-orange-50 border-orange-200';
          case 'MEDIUM': return 'text-blue-700 bg-blue-50 border-blue-200';
          case 'LOW': return 'text-gray-700 bg-gray-50 border-gray-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  const formatDate = (dateString: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || p.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
        if (sortOrder === "newest") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        if (sortOrder === "oldest") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (sortOrder === "name") return a.name.localeCompare(b.name);
        return 0;
    });

  // Stats Logic
  const stats = {
      total: projects.length,
      active: projects.filter(p => p.status === 'ACTIVE').length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      planning: projects.filter(p => p.status === 'PLANNING').length
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your assigned projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Projects</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                  <Users className="w-5 h-5" />
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active</p>
                  <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.active}</h3>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <Calendar className="w-5 h-5" />
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Planning</p>
                  <h3 className="text-2xl font-bold text-purple-600 mt-1">{stats.planning}</h3>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <Edit2 className="w-5 h-5" />
              </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Completed</p>
                  <h3 className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <ArrowRight className="w-5 h-5" />
              </div>
          </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
         {/* Search */}
         <div className="relative w-full md:max-w-md">
            <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
         </div>

         {/* Filters & Sort */}
         <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLANNING">Planning</option>
            </select>

            <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <option value="ALL">All Priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
            </select>

             <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
            </select>
         </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl text-center border border-gray-200">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl text-gray-400">🔍</span>
           </div>
          <p className="text-gray-900 font-medium">No projects found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
           {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
               <button 
                  onClick={() => {setSearchQuery(""); setStatusFilter("ALL"); setPriorityFilter("ALL")}}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
               >
                   Clear all filters
               </button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                        
                        <div className="relative">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{project.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{project.description || "No description provided."}</p>

                    {/* Meta */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{project.teamMemberIds?.length || 0} members</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                                {project.priority}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Mock for now) */}
                <div className="px-6 pb-6 pt-2">
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700">Progress</span>
                        <span className="text-gray-500">{project.progress || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="border-t border-gray-50 p-4 bg-gray-50/30 flex justify-end">
                    <Link href={`/member/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
