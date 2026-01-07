import api from "@/utils/api";

export interface Task{
    id : string
    projectId : string
    project? : { name : string }
    orgId : string
    title : string
    description : string
    status : 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'REVIEW' | 'DONE';
    priority : 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dueDate? : string
    assignedTo? : string
    assignedToUser? : {firstName : string ; lastName : string; email : string}
    createdAt? : string
    updatedAt? : string
}

export interface CreateTaskData{
    projectId: string;
    title : string;
    description : string;
    priority? : string;
    dueDate?:string;
    assignedTo? :string;
}

export const taskService = {
    getProjetTasks : async(projectId : string) : Promise<Task[]> => {
        const response = await api.get(`/projects/${projectId}/tasks`);
        return response.data.data;
    },
    getMyTasks : async() : Promise<Task[]> =>{
        const response = await api.get('projects/tasks/my-tasks');
        return response.data.data;
    },
    createTask : async(projectId : string , data : CreateTaskData) =>{
        const response = await api.post(`/projects/${projectId}/tasks`, { ...data, projectId });
        return response.data
    },
    updateTask : async(taskId : string , data : Partial<Task>) => {
        const response = await api.put(`projects/tasks/${taskId}`, data);
        return response.data.data
    
    },
    deleteTask : async(taskId : string) =>{
        const response = await api.delete(`projects/tasks/${taskId}`);
        return response.data
    
    }
}