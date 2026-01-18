import axios from 'axios';

const PYTHON_API_URL = 'http://localhost:8000';

const pythonApi = axios.create({
    baseURL: PYTHON_API_URL,
});

export const agentCreatorAPI = {
    chat: async (message: string, agentConfig: any) => {
        const response = await pythonApi.post('/chat', {
            agent_id: "preview_session",
            message,
            config: agentConfig
        });
        return response.data;
    },
    getHealth: async () => {
        const response = await pythonApi.get('/health');
        return response.data;
    }
};
