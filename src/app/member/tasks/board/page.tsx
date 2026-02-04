"use client";

import { useState, useEffect } from "react";
import { taskService, Task } from "@/services/taskService";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function MemberTasksBoardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);

    const { socket, isConnected } = useSocket();

    useEffect(() => {
        loadData();
    }, [user]);

    // Socket Listeners for Real-time Updates (My Tasks)
    useEffect(() => {
        if (!socket || !isConnected || !user) return;

        const handleTaskCreated = (newTask: Task) => {
            if (newTask.assignedTo === user.id) {
                setTasks((prev) => [newTask, ...prev]);
                toast.success(`New task assigned: ${newTask.title}`);
            }
        };

        const handleTaskUpdated = (updatedTask: Task) => {
             // Update if it's already in our list (assigned to me) OR if it was just assigned to me
            setTasks((prev) => {
                const exists = prev.find(t => t.id === updatedTask.id);
                
                // If we have it, update it
                if (exists) {
                     // If it was unassigned from me (rare case in real-time without refresh), maybe remove?
                     // For now, let's just update content.
                     if (updatedTask.assignedTo !== user.id) {
                         return prev.filter(t => t.id !== updatedTask.id);
                     }
                     return prev.map((t) => (t.id === updatedTask.id ? updatedTask : t));
                } 
                
                // If we don't have it, but it's now assigned to me
                if (updatedTask.assignedTo === user.id) {
                     return [updatedTask, ...prev];
                }
                
                return prev;
            });
        };

        socket.on("task:created", handleTaskCreated);
        socket.on("task:updated", handleTaskUpdated);

        return () => {
            socket.off("task:created", handleTaskCreated);
            socket.off("task:updated", handleTaskUpdated);
        };
    }, [socket, isConnected, user]);

    const loadData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const fetchedTasks = await taskService.getMyTasks();
            setTasks(fetchedTasks);
        } catch (error: any) {
            toast.error("Failed to load tasks");
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
            loadData();
        }
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
                    users={user ? [user as any] : []} 
                    onStatusChange={handleStatusChange}
                    onEditTask={() => {}} // Read-only edit trigger for now
                    showProjectBadges={true}
                 />
            </div>
        </div>
    );
}
