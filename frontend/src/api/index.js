import API from './axiosInstance';

// ── Auth APIs ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ── Citizen APIs ──────────────────────────────────────────────────────
export const citizenAPI = {
  submitRTI: (formData) => API.post('/citizen/rti', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyRequests: (params) => API.get('/citizen/rti', { params }),
  trackRequest: (id) => API.get(`/citizen/rti/${id}/track`),
  fileAppeal: (formData) => API.post('/citizen/appeal', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyAppeals: () => API.get('/citizen/appeals'),
  getNotifications: () => API.get('/citizen/notifications'),
  markRead: (id) => API.put(`/citizen/notifications/${id}/read`),
  createPaymentOrder: () => API.post('/payments/create-order'),
};

// ── PIO APIs ──────────────────────────────────────────────────────────
export const pioAPI = {
  getStats: () => API.get('/pio/stats'),
  getRequests: (params) => API.get('/pio/requests', { params }),
  getRequest: (id) => API.get(`/pio/requests/${id}`),
  respond: (id, formData) => API.put(`/pio/requests/${id}/respond`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  reject: (id, data) => API.put(`/pio/requests/${id}/reject`, data),
  transfer: (id, data) => API.put(`/pio/requests/${id}/transfer`, data),
  requestFee: (id, data) => API.put(`/pio/requests/${id}/request-fee`, data),
};

// ── CIO APIs ──────────────────────────────────────────────────────────
export const cioAPI = {
  getDashboard: () => API.get('/cio/dashboard'),
  getRequests: (params) => API.get('/cio/requests', { params }),
  assignToPIO: (requestId, data) => API.put(`/cio/assign/${requestId}`, data),
  getPIOs: () => API.get('/cio/pio'),
  createPIO: (data) => API.post('/cio/pio', data),
  togglePIO: (id) => API.put(`/cio/pio/${id}/toggle`),
  getReports: (params) => API.get('/cio/reports', { params }),
};

// ── Appellate APIs ────────────────────────────────────────────────────
export const appellateAPI = {
  getStats: () => API.get('/appellate/stats'),
  getAppeals: (params) => API.get('/appellate/appeals', { params }),
  getAppeal: (id) => API.get(`/appellate/appeals/${id}`),
  assignAppeal: (id, data) => API.put(`/appellate/appeals/${id}/assign`, data),
  scheduleHearing: (data) => API.post('/appellate/hearing', data),
  issueDecision: (id, data) => API.put(`/appellate/appeals/${id}/decision`, data),
};
