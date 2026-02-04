"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import { projectService, Project } from "@/services/projectService";
import { ArrowLeft, Search, Filter, Calendar, Users, Briefcase, Eye, EyeOff, LayoutGrid } from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { Plus } from "lucide-react";

export default function MemberProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [orgUsers, setOrgUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Controls
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [viewAll, setViewAll] = useState(false); // Default to "My Tasks"
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    // Get Current User
    const { user } = useSelector((state: RootState) => state.auth);


    const { socket, isConnected } = useSocket();

    useEffect(() => {
        loadData();
    }, [projectId]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleTaskUpdated = (updatedTask: Task) => {
            if (String(updatedTask.projectId) === String(projectId)) {
                setTasks((prev) => {
                    const exists = prev.find(t => t.id === updatedTask.id);
                    if (!exists) {
                        return [updatedTask, ...prev];
                    }
                    return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
                });
                toast.success("Task updated");
            }
        };

        const handleTaskCreated = (newTask: Task) => {
            if (String(newTask.projectId) === String(projectId)) {
                setTasks((prev) => [newTask, ...prev]);
                toast.success(`New task: ${newTask.title}`);
            }
        };

        socket.on("task:created", handleTaskCreated);
        socket.on("task:updated", handleTaskUpdated);

        return () => {
            socket.off("task:created", handleTaskCreated);
            socket.off("task:updated", handleTaskUpdated);
        };
    }, [socket, isConnected, projectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [fetchedTasks, fetchedUsers, fetchedProject] = await Promise.all([
                taskService.getProjetTasks(projectId).catch(err => {
                   console.error("Failed to fetch tasks", err);
                   return [];
                }),
                userService.getOrganizationUsers().catch(err => {
                    console.error("Failed to fetch users", err);
                    return [];
                }),
                projectService.getProject(projectId).catch(err => {
                    // Check if error is 404
                    if (err?.response?.status === 404 || err?.message?.includes("not found")) {
                        return null; // Handle specifically
                    }
                    throw err;
                })
            ]);

            if (!fetchedProject) {
                toast.error("Project not found or has been deleted.");
                router.push('/member/dashboard');
                return;
            }

            setTasks(fetchedTasks);
            setOrgUsers(fetchedUsers);
            setProject(fetchedProject);
        } catch (error: any) {
            toast.error("Failed to load project data");
            console.error(error);
            router.push('/member/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
            await taskService.updateTask(taskId, { status: newStatus as any });
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
            taskService.getProjetTasks(projectId).then(setTasks);
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getUserName = (userId?: string) => {
        if (!userId) return "Unassigned";
        const user = orgUsers.find(u => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
    }

    // Get Team Members first to use in Filter logic if needed, 
    // but typically we use orgUsers filtered by project member IDs
    const teamMembers = orgUsers.filter(user => project?.teamMemberIds?.includes(user.id));

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading project contents...</p>
                </div>
            </div>
        );
    }

    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Filter Tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
        
        // Visibility Logic
        const isAssignedToMe = task.assignedTo === user?.id;
        const matchesVisibility = viewAll || isAssignedToMe;

        return matchesSearch && matchesStatus && matchesPriority && matchesVisibility;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content: Tasks */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Controls Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black transition-all"
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>


                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                            {/* Create Task Button */}
                            <button
                                onClick={() => setIsCreateTaskModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Task</span>
                            </button>

                            {/* View Toggle Button */}
                            <button
                                onClick={() => setViewAll(!viewAll)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    viewAll 
                                        ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100' 
                                        : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                }`}
                            >
                                {viewAll ? (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        <span>Show My Tasks Only</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>View All Tasks</span>
                                    </>
                                )}
                            </button>

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

                    {/* Tasks Grid */}
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">📋</div>
                            <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
                            <p className="text-gray-500 mt-1 text-sm">No tasks match your current filters.</p>
                            {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
                                <button
                                    onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); }}
                                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium underline underline-offset-2"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredTasks.map((task) => (
                                <div key={task.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
                                    {/* Task Card Content - Identical to previous version */}
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wider uppercase ${task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                    task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-600 border border-green-100'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{task.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{task.description || "No description provided."}</p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 mb-4">
                                            <div className="flex items-center gap-2">
                                                {task.assignedTo ? (
                                                    <>
                                                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] border border-indigo-100" title={getUserName(task.assignedTo)}>
                                                            {getUserName(task.assignedTo).charAt(0)}
                                                        </div>
                                                        <span className="text-xs text-gray-600 truncate max-w-[80px]">{getUserName(task.assignedTo).split(' ')[0]}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                )}
                                            </div>
                                            {task.dueDate && (
                                                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(task.dueDate)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className={`absolute inset-y-0 left-0 w-1 rounded-l-md ${task.status === 'DONE' ? 'bg-green-500' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                    task.status === 'REVIEW' ? 'bg-purple-500' : 'bg-gray-400'
                                                }`}></div>
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                className={`w-full appearance-none pl-4 pr-8 py-2.5 rounded-lg text-sm font-semibold cursor-pointer outline-none border transition-all hover:bg-opacity-80 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
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

                {/* Side Panel: Team & Details - Unchanged */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-gray-500" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Team Members</h3>
                        </div>

                        <div className="space-y-3">
                            {teamMembers.length > 0 ? (
                                teamMembers.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-100">
                                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{member.firstName} {member.lastName}</p>
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500 text-sm italic">
                                    No team members assigned yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Project Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {project?.startDate ? formatDate(project.startDate) : 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    {project?.endDate ? formatDate(project.endDate) : 'Not set'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Priority</p>
                                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${project?.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                    project?.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                        project?.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {project?.priority}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                onSuccess={() => {
                    // Task creation handled by Socket, but we can refresh to be safe or rely on socket
                    // socket listener will add it.
                    // If socket fails, we might want to re-fetch? 
                    // Let's rely on socket or just re-fetch tasks quietly.
                    taskService.getProjetTasks(projectId).then(setTasks);
                }}
                projectId={projectId}
                projectMembers={teamMembers}
            />
        </div>
    );
}
