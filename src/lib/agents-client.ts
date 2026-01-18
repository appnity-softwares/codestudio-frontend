import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const agentsAPI = {
    getAgents: async () => {
        const response = await api.get('/agents');
        return response.data;
    },
    createAgent: async (data: any) => {
        const response = await api.post('/agents', data);
        return response.data;
    },
    updateAgent: async (id: string, data: any) => {
        const response = await api.put(`/agents/${id}`, data);
        return response.data;
    },
    deleteAgent: async (id: string) => {
        const response = await api.delete(`/agents/${id}`);
        return response.data;
    }
};
