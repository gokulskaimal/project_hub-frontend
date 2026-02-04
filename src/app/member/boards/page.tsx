"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { taskService, Task } from "@/services/taskService";
import { userService, User } from "@/services/userService";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";

export default function MemberBoardsPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const { socket, isConnected } = useSocket();

    useEffect(() => {
        loadData();
    }, []);

    // Listen for global task events
    useEffect(() => {
        if (!socket || !isConnected) return;
        
        const handleRefresh = () => loadData();
        socket.on("task:assigned", handleRefresh);
        socket.on("task:updated", handleRefresh);

        return () => {
            socket.off("task:assigned", handleRefresh);
            socket.off("task:updated", handleRefresh);
        };
    }, [socket, isConnected]);

    const loadData = async () => {
        try {
            // Member might not have access to getOrganizationUsers in the same way, 
            // but usually they can see basic info of colleagues. 
            // If this fails, we might need a specific endpoint or just fetch minimal data.
            // For now, assuming similar access for avatar display.
            const [myTasks, orgUsers] = await Promise.all([
                taskService.getMyTasks(),
                userService.getOrganizationUsers().catch(() => []) // Fallback if regular user can't list all
            ]);
            setTasks(myTasks);
            setUsers(orgUsers);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your board");
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
            loadData();
        }
    };

    const handleEditTask = (task: Task) => {
        // No-op or navigate
         if (task.projectId) {
             toast("Navigate to project to edit details", { icon: "ℹ️" });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pt-6">
             <div className="flex flex-col gap-1 px-1">
                <h1 className="text-2xl font-bold text-gray-800">My Board</h1>
                <p className="text-gray-500 text-sm">Review and manage all your assigned tasks.</p>
            </div>

            <div className="w-full">
                <KanbanBoard 
                    tasks={tasks}
                    users={users}
                    onStatusChange={handleStatusChange}
                    onEditTask={handleEditTask}
                    showProjectBadges={true}
                />
            </div>
        </div>
    );
}
