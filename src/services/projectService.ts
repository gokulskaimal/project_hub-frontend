import api from "@/utils/api";

export interface Project{
    id : string;
    orgId : string;
    name : string;
    description : string;
    status : 'ACTIVE' | 'ARCHIVED' | 'COMPLETED' | 'PLANNING' | 'ON_HOLD';
    startDate : string;
    endDate : string;
    priority : 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tags? : string[];
    teamMemberIds : string[];
    progress? : number;
    budget? : number;
    createdAt : string;
    updatedAt : string;
}

export const projectService = {
    getProjects : async() : Promise<Project[]> =>{
        const response = await api.get('/projects');
        return response.data.data;
    },

    getMyProjects : async() : Promise<Project[]> =>{
        const response = await api.get('projects/my-projects');
        return response.data.data;
    },

    getProject : async(id :string) : Promise<Project> =>{
        const response = await api.get(`/projects/${id}`);
        return response.data.data;
    
    },
    
    createProject : async(data : Partial<Project>) =>{
        const response = await api.post('/projects', data);
        return response.data.data;
    },
    updateProject : async(id: string , data : Partial<Project>) =>{
        const response = await api.put(`/projects/${id}`, data);
        return response.data.data
    },
    deleteProject : async(id : string) =>{
        const response = await api.delete(`/projects/${id}`);
        return response.data
    
    }
}