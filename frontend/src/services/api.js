import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired / invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/register page
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/') {
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  API.post('/auth/login', { email, password });

export const register = (name, email, password) =>
  API.post('/auth/register', { name, email, password });

export const getMe = () => API.get('/auth/me');

export const updateProfile = (data) => API.put('/auth/me', data);

// Architectures
export const getArchitectures = () => API.get('/architectures/');

export const createArchitecture = (data) => API.post('/architectures/', data);

export const getArchitecture = (id) => API.get(`/architectures/${id}`);

export const updateArchitecture = (id, data) =>
  API.put(`/architectures/${id}`, data);

export const deleteArchitecture = (id) => API.delete(`/architectures/${id}`);

// Nodes & Edges
export const addNode = (archId, data) =>
  API.post(`/architectures/${archId}/nodes`, data);

export const addEdge = (archId, data) =>
  API.post(`/architectures/${archId}/edges`, data);

// Simulation
export const simulate = (data) => API.post('/simulate', data);

// Analysis
export const analyze = (data) => API.post('/analyze', data);

// AI Analysis (Azure OpenAI)
export const aiAnalyze = (data) => API.post('/ai-analyze', data);

// Cost Estimation
export const estimateCost = (data) => API.post('/estimate-cost', data);

// Simulation history
export const getSimulations = (archId) =>
  API.get(`/simulations/${archId}`);

export default API;
