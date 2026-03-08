import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// ─── Auth ────────────────────────────────────
export const authService = {
    login: (data) => api.post('/auth/verify-otp', data),
    sendOtp: (data) => api.post('/auth/send-otp', data),
    getProfile: (id) => api.get(`/auth/profile/${id}`),
    updateProfile: (id, data) => api.put(`/auth/profile/${id}`, data)
};

// ─── Resources ───────────────────────────────
export const resourceService = {
    getAll: () => api.get('/resources'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    updateStatus: (id, status) => api.patch(`/resources/${id}/status`, { status })
};

// ─── Requests ────────────────────────────────
export const requestService = {
    getAll: () => api.get('/requests'),
    create: (data) => api.post('/requests', data),
    updateStatus: (id, status) => api.patch(`/requests/${id}/status`, { status })
};

// ─── Alerts ──────────────────────────────────
export const alertService = {
    getAll: () => api.get('/alerts'),
    create: (data) => api.post('/alerts', data),
    deactivate: (id) => api.patch(`/alerts/${id}/deactivate`)
};

// ─── Listings (Map) ──────────────────────────
export const listingService = {
    getNearby: (lat, lng, radiusKm = 5) => api.get(`/listings/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`)
};

export default api;
