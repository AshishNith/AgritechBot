import axios from 'axios';

// In development Vite proxies /api to localhost:3000.
// In production (Vercel) VITE_API_URL is set to the Render backend URL.
const BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export async function sendChatMessage(question: string, language = 'Hindi', model = 'gemini', sessionId = '') {
    const { data } = await api.post('/ask', { question, language, model, sessionId });
    return data as {
        question: string;
        language: string;
        answer: string;
        audio?: string;
    };
}

export async function sendVoiceMessage(audioBlob: Blob, model = 'gemini', sessionId = '') {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    formData.append('model', model);
    if (sessionId) formData.append('sessionId', sessionId);
    const { data } = await api.post('/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as {
        question: string;
        detectedLanguage: string;
        answer: string;
        audio?: string;
    };
}

export async function diagnoseCrop(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const { data } = await api.post('/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data as {
        disease: string;
        confidence: number;
        treatment: string;
        products: { name: string; price: number; image: string }[];
    };
}

export async function getProducts(crop = 'wheat') {
    const { data } = await api.get('/products', { params: { crop } });
    return data;
}

export default api;
