"use client";

import React, { useEffect, useState } from "react";
import { taskService, Task } from "@/services/taskService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Search, Filter, Calendar, CheckCircle2, AlertCircle, Clock, CheckSquare } from "lucide-react";
import Link from "next/link";

export default function MemberTasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Controls State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    // Sort logic can be added later if needed, kept simple for now

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const data = await taskService.getMyTasks();
            setTasks(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
            await taskService.updateTask(taskId, { status: newStatus as any });
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update task");
            fetchTasks(); // Revert
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Stats Logic
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS').length,
        completed: tasks.filter(t => t.status === 'DONE').length,
        critical: tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length
    };

    // Filter Logic
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (loading) {
        return (
          <div className="flex h-full w-full items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Loading your tasks...</p>
            </div>
          </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Tasks</h1>
                     <p className="text-gray-500 text-sm mt-1">Track and update your assigned work across all projects</p>
                </div>
             </div>

             {/* Stats Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Assigned</p>
                          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                          <CheckSquare className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Pending</p>
                          <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</h3>
                      </div>
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                          <Clock className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Critical</p>
                          <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</h3>
                      </div>
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                          <AlertCircle className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div>
                          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Completed</p>
                          <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</h3>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                          <CheckCircle2 className="w-5 h-5" />
                      </div>
                  </div>
             </div>

             {/* Controls Bar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-md">
                   <input 
                       type="text" 
                       placeholder="Search your tasks..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black transition-all"
                   />
                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
       
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                   <div className="relative">
                       <select 
                           value={statusFilter}
                           onChange={(e) => setStatusFilter(e.target.value)}
                           className="appearance-none pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                       >
                           <option value="ALL">All Status</option>
                           <option value="TODO">To Do</option>
                           <option value="IN_PROGRESS">In Progress</option>
                           <option value="REVIEW">Review</option>
                           <option value="DONE">Done</option>
                       </select>
                       <Filter className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                   </div>
       
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
                </div>
             </div>

             {/* Task Grid */}
             {filteredTasks.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">📋</div>
                   <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
                   <p className="text-gray-500 mt-1 text-sm">You're all caught up! Or try adjusting filters.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map(task => (
                        <div key={task.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
                            <div className="p-5 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase ${
                                            task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' : 
                                            task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'
                                        }`}>
                                            {task.priority}
                                        </span>
                                     </div>
                                     {task.dueDate && (
                                         <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(task.dueDate)}
                                         </span>
                                     )}
                                </div>
            
                                {/* Content */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{task.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{task.description || "No description."}</p>
                                
                                {/* Project Info */}
                                <div className="mb-4 pt-4 border-t border-gray-50">
                                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Project</div>
                                    <Link href={`/member/projects/${task.projectId}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                        {task.project?.name || "View Project"}
                                    </Link>
                                </div>
            
                                {/* Footer: Status Action */}
                                <div className="relative mt-auto">
                                    <div className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${
                                        task.status === 'DONE' ? 'bg-green-500' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                        task.status === 'REVIEW' ? 'bg-purple-500' : 'bg-gray-400'
                                    }`}></div>
                                    <select 
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                        className={`w-full appearance-none pl-4 pr-8 py-2.5 rounded-lg text-sm font-semibold cursor-pointer outline-none border transition-all hover:bg-opacity-80 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                                            task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                                            task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            task.status === 'REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}
                                    >
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="REVIEW">Review</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
}
