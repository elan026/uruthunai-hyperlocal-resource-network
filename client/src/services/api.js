import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // Send HttpOnly JWT cookie with every request
});

// ─── Auth ────────────────────────────────────
export const authService = {
    googleLogin: (idToken) => api.post('/auth/google-login', { idToken }),
    login: (data) => api.post('/auth/verify-otp', data),
    sendOtp: (data) => api.post('/auth/send-otp', data),
    getProfile: (id) => api.get(`/auth/profile/${id}`),
    updateProfile: (id, data) => api.put(`/auth/profile/${id}`, data),
    deleteProfile: (id) => api.delete(`/auth/profile/${id}`),
    requestRoleChange: (id, requested_role) => api.post(`/auth/profile/${id}/role-request`, { requested_role }),
    getVolunteers: () => api.get('/auth/volunteers')
};

// ─── Resources ───────────────────────────────
export const resourceService = {
    getAll: () => api.get('/resources'),
    getById: (id) => api.get(`/resources/${id}`),
    create: (data) => api.post('/resources', data),
    updateStatus: (id, status) => api.patch(`/resources/${id}/status`, { status }),
    decrement: (id, amount) => api.patch(`/resources/${id}/decrement`, { amount })
};

// ─── Requests ────────────────────────────────
export const requestService = {
    getAll: () => api.get('/requests'),
    create: (data) => api.post('/requests', data),
    parseNlp: (text) => api.post('/requests/parse-nlp', { text }),
    // Fixed: path was /status, should be /state; body uses newState not status
    updateState: (id, newState, token) => api.patch(`/requests/${id}/state`, 
        { newState }, 
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    )
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

// ─── System ──────────────────────────────────
export const systemService = {
    getEmergencyState: () => api.get('/system/emergency'),
    getStats: () => api.get('/system/stats')
};

// ─── Admin ───────────────────────────────────
export const adminService = {
    setEmergencyState: (active, token) => api.post('/admin/emergency', { active }, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    setHillStationDangerMode: (areaCode, isDanger) => api.post('/admin/emergency/hill-station', { areaCode, isDanger })
};

export default api;
