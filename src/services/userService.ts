import api, { API_ROUTES } from "@/utils/api";

export interface User{
    id :string;
    firstName : string;
    lastName : string;
    email : string;
    role : string;
}

export const userService = {
    getOrganizationUsers: async() : Promise<User[]> => {
        const response = await api.get(API_ROUTES.ORGANIZATION.USERS);
        if(response.data.data && Array.isArray(response.data.data)){
            return response.data.data
        }else if(response.data.data && response.data.data.users){
            return response.data.data.users
        }
        return []
    }
}