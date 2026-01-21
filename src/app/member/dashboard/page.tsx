"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Briefcase, CheckCircle2, Clock, AlertCircle, CheckSquare, ArrowRight } from "lucide-react";
import { projectService, Project } from "@/services/projectService";
import { taskService, Task } from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, tasksData] = await Promise.all([
            projectService.getMyProjects(), 
            taskService.getMyTasks()
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const pendingTasks = tasks.filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS").length;
  const criticalTasks = tasks.filter((t) => t.priority === "CRITICAL" && t.status !== "DONE").length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.firstName}</h1>
           <p className="text-gray-500 mt-2">Here's what's happening today.</p>
        </div>
        <div className="text-sm text-gray-900 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active Projects</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{projects.length}</h3>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-5 h-5" />
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pending Tasks</p>
                  <h3 className="text-2xl font-bold text-orange-600 mt-1">{pendingTasks}</h3>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <Clock className="w-5 h-5" />
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Critical Issues</p>
                  <h3 className="text-2xl font-bold text-red-600 mt-1">{criticalTasks}</h3>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                  <AlertCircle className="w-5 h-5" />
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Completed</p>
                  <h3 className="text-2xl font-bold text-green-600 mt-1">{completedTasks}</h3>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
                  <Link href="/member/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                  </Link>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                 {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <CheckSquare className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-medium">No tasks assigned</p>
                        <p className="text-gray-500 text-sm mt-1">You're all clear for now!</p>
                    </div>
                 ) : (
                    <div className="divide-y divide-gray-100">
                        {tasks.slice(0, 5).map(task => (
                            <Link key={task.id} href={`/member/projects/${task.projectId}`} className="block p-4 hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                            task.priority === 'CRITICAL' ? 'bg-red-500 shadow-sm shadow-red-200' : 
                                            task.priority === 'HIGH' ? 'bg-orange-500 shadow-sm shadow-orange-200' : 
                                            task.priority === 'MEDIUM' ? 'bg-blue-500 shadow-sm shadow-blue-200' : 'bg-green-500 shadow-sm shadow-green-200'
                                        }`} />
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                    {task.project?.name || "Project"}
                                                </span>
                                                {task.dueDate && (
                                                    <>
                                                        <span className="text-gray-300">•</span>
                                                        <span className={`text-xs ${
                                                            new Date(task.dueDate) < new Date() ? 'text-red-500 font-medium' : 'text-gray-500'
                                                        }`}>
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                        task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-100' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-gray-50 text-gray-700 border-gray-100'
                                    }`}>
                                        {task.status === 'IN_PROGRESS' ? 'In Progress' : task.status.charAt(0) + task.status.slice(1).toLowerCase().replace('_', ' ')}
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
                  <Link href="/member/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</Link>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                  {projects.slice(0, 3).map(project => (
                      <Link key={project.id} href={`/member/projects/${project.id}`} className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 truncate">{project.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>{project.status}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                          </div>
                      </Link>
                  ))}
                  {projects.length === 0 && (
                      <p className="text-center text-sm text-gray-500 py-4">No projects joined yet.</p>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}