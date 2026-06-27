import axios from 'axios';

// Determine API base URL: env var > dynamic hostname > fallback to localhost
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL?.trim();

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    return '/api';
  }

  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('[api] baseURL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const orderAPI = {
  // Backwards-compatible method names used across the app
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  // Aliases expected by components
  get: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.delete(`/orders/${id}`),
};

export const adminAPI = {
  listOrders: (params) => api.get('/admin/orders', { params }),
  approveOrder: (id) => api.put(`/admin/orders/${id}/approve`),
  declineOrder: (id) => api.put(`/admin/orders/${id}/decline`),
  assignDriver: (id, data) => api.put(`/admin/orders/${id}/assign-driver`, data),
  markDelivered: (id) => api.put(`/admin/orders/${id}/delivered`),
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  listUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const menuAPI = {
  getAll: () => api.get('/menus'),
  getById: (id) => api.get(`/menus/${id}`),
};

export default api;