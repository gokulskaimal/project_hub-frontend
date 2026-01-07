"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { Pencil, Trash2, ArrowLeft, Calendar, User as UserIcon, CheckCircle2, Search } from "lucide-react";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { PRIORITY_LEVELS, PROJECT_STATUS } from "@/utils/constants";
import { projectService, Project } from "@/services/projectService"; // Ensure this service exists

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(task => {
    // Ensure task and properties exist
    if (!task) return false;
    const title = task.title || "";
    const desc = task.description || "";
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Debugging
  useEffect(() => {
    console.log("Tasks:", tasks.length);
    console.log("Filtered Tasks:", filteredTasks.length);
    console.log("Search:", searchQuery);
    console.log("Filter:", statusFilter);
  }, [tasks, filteredTasks, searchQuery, statusFilter]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Project Details, Tasks, and Users
      const [fetchedProject, fetchedTasks, fetchedUsers] = await Promise.all([
          projectService.getProject(projectId), // Assuming this exists or create it
          taskService.getProjetTasks(projectId),
          userService.getOrganizationUsers()
      ]);
      setProject(fetchedProject);
      setTasks(fetchedTasks);
      setOrgUsers(fetchedUsers);
    } catch (error: any) {
      toast.error("Failed to load project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
      setEditingTask(null);
      setIsModalOpen(true);
  }

  const openEditModal = (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
  }

  const handleModalSuccess = () => {
      // Refresh tasks
      taskService.getProjetTasks(projectId).then(setTasks);
  }

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await taskService.deleteTask(taskId);
        toast.success("Task deleted");
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (error: any) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
      try {
          // Optimistic UI update
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
          await taskService.updateTask(taskId, { status: newStatus as any });
          toast.success("Status updated");
      } catch (error) {
          toast.error("Failed to update status");
           // Refresh to revert
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

  if (loading) return (
      <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
           <button 
             onClick={() => router.back()} 
             className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
           >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
           </button>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
             {project?.name || 'Project Details'}
           </h1>
           <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 
                  {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  project?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                  project?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                  {project?.status}
              </span>
           </div>
        </div>
        <Button onClick={openCreateModal} className="shadow-lg shadow-blue-200">+ New Task</Button>
      </div>

      {/* Stats/Overview (Optional - keeping generic "Card" list as requested but styled better) */}
      
      {/* Tasks List */}
      {/* Task Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-gray-300">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">To Do</p>
              <h3 className="text-2xl font-bold text-gray-700 mt-1">{tasks.filter(t => t.status === 'TODO').length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-purple-500">
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Review</p>
              <h3 className="text-2xl font-bold text-purple-700 mt-1">{tasks.filter(t => t.status === 'REVIEW').length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Done</p>
              <h3 className="text-2xl font-bold text-green-700 mt-1">{tasks.filter(t => t.status === 'DONE').length}</h3>
          </div>
      </div>

      {/* Tasks Controls & List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Tasks ({filteredTasks.length})
            </h2>
            <div className="flex w-full sm:w-auto gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                </select>
            </div>
        </div>
        
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center gap-3 shadow-sm">
             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-gray-300" />
             </div>
             <p className="font-medium text-gray-900">No tasks found</p>
             <p className="text-sm text-gray-500">
                {searchQuery || statusFilter !== 'ALL' ? "Try adjusting your filters" : "Create your first task to get started"}
             </p>
             {!searchQuery && statusFilter === 'ALL' && (
                <Button variant="outline" size="sm" onClick={openCreateModal} className="mt-2">Create Task</Button>
             )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-all gap-4 group border-gray-100 rounded-xl">
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-start justify-between md:justify-start md:gap-4">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider uppercase border ${
                          task.priority === 'HIGH' || task.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' : 
                          task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'
                      }`}>
                          {task.priority}
                      </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 max-w-2xl leading-relaxed">{task.description || "No description provided."}</p>
                  
                  <div className="flex gap-3 mt-3 text-xs items-center flex-wrap">
                    <div className="relative">
                        <select 
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold cursor-pointer outline-none border transition-all focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/20 ${
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

                    {task.dueDate && (
                       <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                           new Date(task.dueDate) < new Date() && task.status !== 'DONE' 
                           ? 'bg-red-50 text-red-700 border-red-100' 
                           : 'bg-gray-50 text-gray-600 border-gray-100'
                       }`}>
                          <Calendar className="w-3.5 h-3.5" /> 
                          {formatDate(task.dueDate)}
                       </span>
                    )}
                    
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                        task.assignedTo ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                        <UserIcon className="w-3.5 h-3.5" />
                        {getUserName(task.assignedTo)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                   <Button variant="secondary" size="sm" onClick={() => openEditModal(task)} className="h-9 w-9 p-0 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600">
                      <Pencil size={15} />
                   </Button>
                   <Button variant="danger" size="sm" onClick={() => handleDeleteTask(task.id)} className="h-9 w-9 p-0 rounded-lg hover:bg-red-600">
                      <Trash2 size={15} />
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        projectId={projectId}
        task={editingTask}
        projectMembers={orgUsers.filter(u => project?.teamMemberIds?.includes(u.id))}
      />
    </div>
  );
}