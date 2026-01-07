"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";
import api, { API_ROUTES } from "@/utils/api";
import { Plus, Search, Filter, Calendar, Users, MoreHorizontal, ArrowRight, Trash2, Edit2, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    priority: string;
    tags?: string[];
    teamMemberIds?: string[];
    progress?: number;
    budget?: number;
}

export default function ProjectsPage() {
    const [isModaOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [showFilters, setShowFilters] = useState(false);

    // Actions
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_ROUTES.PROJECTS.ROOT);
            setProjects(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        
        // Click outside to close menu
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        try {
            await api.delete(`${API_ROUTES.PROJECTS.ROOT}/${id}`);
            toast.success("Project deleted successfully");
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete project", error);
            toast.error("Failed to delete project");
        }
        setActiveActionId(null);
    };

    const handleEdit = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(project);
        setIsEditModalOpen(true);
        setActiveActionId(null);
    };

    const toggleActionMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveActionId(activeActionId === id ? null : id);
    };

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

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || p.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Stats Logic
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'ACTIVE').length,
        completed: projects.filter(p => p.status === 'COMPLETED').length,
        planning: projects.filter(p => p.status === 'PLANNING').length
    };

    return (
        <DashboardLayout title="Projects">
            {/* Header Actions - Moved New Project here */}
                <div className="flex justify-end mt-4 mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm hover:shadow"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>
            <div className="space-y-8">
                
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

                

                {/* Controls - Admin Style */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white placeholder-gray-500 transition-all text-sm"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="Filter projects by status"
                                title="Filter projects by status"
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PLANNING">Planning</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                            <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        
                        <div className="relative">
                            <select 
                                value={priorityFilter} 
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                aria-label="Filter projects by priority"
                                title="Filter projects by priority"
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                <option value="ALL">All Priority</option>
                                <option value="CRITICAL">Critical</option>
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                            <Filter className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                         {(statusFilter !== "ALL" || priorityFilter !== "ALL" || searchQuery) && (
                             <button 
                                onClick={() => { setStatusFilter("ALL"); setPriorityFilter("ALL"); setSearchQuery(""); }}
                                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                title="Clear Filters"
                             >
                                <X className="w-4 h-4" /> Clear
                             </button>
                         )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 animate-pulse">
                                <div className="h-6 bg-gray-100 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-8"></div>
                                <div className="h-20 bg-gray-50 rounded mb-4"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects found</h3>
                        <p className="text-gray-500 text-sm mb-6">Try adjusting your filters or create a new project</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Create Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map(project => (
                            <div key={project.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                                            {project.status || 'PLANNING'}
                                        </span>
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => toggleActionMenu(project.id, e)}
                                                aria-label="Project actions menu"
                                                title="Project actions menu"
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                            
                                            {/* Dropdown Menu */}
                                            {activeActionId === project.id && (
                                                <div 
                                                    ref={actionMenuRef}
                                                    className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-100"
                                                >
                                                    <button 
                                                        onClick={(e) => handleEdit(project, e)}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleDelete(project.id, e)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            )}
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
                                                {project.priority || 'Medium'}
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
                                    <Link href={`/manager/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateProjectModal
                isOpen={isModaOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
            />

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedProject(null); }}
                onSuccess={fetchProjects}
                project={selectedProject}
            />
        </DashboardLayout>
    );
}
