import axios from 'axios';

const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const fallbackApiUrl = isLocalHost
  ? 'http://127.0.0.1:8000'
  : 'https://medi-ai-backend-j7rz.onrender.com';

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  fallbackApiUrl;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('imai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
