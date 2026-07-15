import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('vault_token');
      localStorage.removeItem('vault_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ── Documents API ─────────────────────────────────────────────────────────────
export const documentsApi = {
  getAll:    (params) => api.get('/documents', { params }),
  getById:   (id)     => api.get(`/documents/${id}`),
  getStats:  ()       => api.get('/documents/stats'),

  upload: (formData, onUploadProgress) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  update:   (id, data) => api.put(`/documents/${id}`, data),
  delete:   (id)       => api.delete(`/documents/${id}`),

  getDownloadUrl: (id) => `${API_URL}/documents/download/${id}`,

  download: async (id) => {
    const response = await api.get(`/documents/${id}/download-url`);

    window.location.href = response.data.downloadUrl;
  },
};

export default api;
