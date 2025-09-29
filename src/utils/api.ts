import axios from 'axios'

export const api = axios.create({
    baseURL : process.env.FRONTEND_URL,
    withCredentials : true,
    headers : {
        'Content-Type' : 'application/json'
    }
})

export default api