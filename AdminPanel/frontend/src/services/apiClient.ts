import axios from "axios";
import { AUTH_STORAGE_KEY } from "../constants/storage";

interface PersistedAuth {
  token: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
});

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PersistedAuth;
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
  return config;
});

