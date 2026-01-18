import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getApiKey = () => localStorage.getItem('gemini_api_key');
const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`
});

export const aiAPI = {
    chat: async (message: string, context?: string, language?: string) => {
        const response = await axios.post(`${API_URL}/ai/chat`, {
            message,
            context,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    refactor: async (code: string, language: string) => {
        const response = await axios.post(`${API_URL}/ai/refactor`, {
            code,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    explain: async (code: string, language: string) => {
        const response = await axios.post(`${API_URL}/ai/explain`, {
            code,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    huntBugs: async (code: string, language: string) => {
        const response = await axios.post(`${API_URL}/ai/hunt-bugs`, {
            code,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    optimize: async (code: string, language: string) => {
        const response = await axios.post(`${API_URL}/ai/optimize`, {
            code,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    checkAccessibility: async (code: string) => {
        const response = await axios.post(`${API_URL}/ai/accessibility`, {
            code,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    },
    writeTests: async (code: string, language: string) => {
        const response = await axios.post(`${API_URL}/ai/write-tests`, {
            code,
            language,
            apiKey: getApiKey()
        }, { headers: getHeaders() });
        return response.data;
    }
};
