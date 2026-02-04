"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import { projectService, Project } from "@/services/projectService";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import CreateTaskModal from "@/components/modals/CreateTaskModal";

export default function ProjectBoardPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [orgUsers, setOrgUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const { socket, isConnected } = useSocket();

    useEffect(() => {
        loadData();
    }, [projectId]);

    // Socket Listeners for Real-time Updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleTaskCreated = (newTask: Task) => {
            if (String(newTask.projectId) === String(projectId)) {
                setTasks((prev) => [newTask, ...prev]);
                toast.success(`New task: ${newTask.title}`);
            }
        };

        const handleTaskUpdated = (updatedTask: Task) => {
            if (String(updatedTask.projectId) === String(projectId)) {
                setTasks((prev) => {
                    const exists = prev.find(t => t.id === updatedTask.id);
                    if (!exists) {
                        return [updatedTask, ...prev];
                    }
                    return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
                });
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
            const [fetchedProject, fetchedTasks, fetchedUsers] = await Promise.all([
                projectService.getProject(projectId),
                taskService.getProjetTasks(projectId),
                userService.getOrganizationUsers()
            ]);
            setProject(fetchedProject);
            setTasks(fetchedTasks);
            setOrgUsers(fetchedUsers);
        } catch (error: any) {
            toast.error("Failed to load board data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
            await taskService.updateTask(taskId, { status: newStatus as any });
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
            taskService.getProjetTasks(projectId).then(setTasks);
        }
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        taskService.getProjetTasks(projectId).then(setTasks);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">


            {/* Kanban Board Area */}
            <div className="flex-1 overflow-hidden px-4">
                 <KanbanBoard 
                    tasks={tasks} 
                    users={orgUsers} 
                    onStatusChange={handleStatusChange} 
                    onEditTask={openEditModal}
                    showProjectBadges={false}
                 />
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
