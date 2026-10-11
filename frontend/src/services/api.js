import axios from 'axios';

// Centralized Axios client configured for future Node.js/Express backend (Phase 3)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token if configured
apiClient.interceptors.request.use(
  (config) => {
    // In demo mode this is simulated; prepared for Phase 3 real auth tokens
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('demo_auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
