// Central API Service - Spring Boot REST Backend
// Replaces all Firebase calls

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Handle 401 globally - auto logout
api.interceptors.response.use(
  res => {
    console.log('API Response:', res.config.url, res.status);
    return res;
  },
  err => {
    console.error('API Error:', err.config?.url, err.response?.status, err.response?.data);
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// Helper to extract data from response
const getData = res => res.data.data;

// ===== AUTH APIs =====
export const authApi = {
  register: (email, password, fullName, userType) =>
    api.post('/api/auth/register', { email, password, fullName, userType }).then(getData),

  login: async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password }).then(getData);
    // Save token and user info
    localStorage.setItem('jwt_token', data.token);
    localStorage.setItem('userType', data.userType);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userFullName', data.fullName);
    return data;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userProfile');
  },

  isLoggedIn: () => !!localStorage.getItem('jwt_token'),
  getUserType: () => localStorage.getItem('userType'),
  getToken: () => localStorage.getItem('jwt_token'),
};

// ===== NEEDY APIs =====
export const needyApi = {
  // POST /api/needy/profile - Create profile after registration
  createProfile: (city, age, gender, relationToPatient, phone, address, state, pincode) =>
    api.post('/api/needy/profile', { city, age, gender, relationToPatient, phone, address, state, pincode }).then(getData),

  // GET /api/needy/profile - Get my profile
  getProfile: () =>
    api.get('/api/needy/profile').then(getData),

  // PUT /api/needy/profile - Update profile
  updateProfile: (data) =>
    api.put('/api/needy/profile', data).then(getData),
};

// ===== BLOOD REQUEST APIs =====
export const requestApi = {
  // POST /api/requests - Create blood request
  create: (data) =>
    api.post('/api/requests', data).then(getData),

  // GET /api/requests/{id} - Get request by ID
  getById: (id) =>
    api.get(`/api/requests/${id}`).then(getData),

  // GET /api/requests/my - Get my requests
  getMy: (page = 0, size = 20, status = 'ALL') =>
    api.get(`/api/requests/my?page=${page}&size=${size}&status=${status}`).then(getData),

  // PUT /api/requests/{id}/cancel
  cancel: (id) =>
    api.put(`/api/requests/${id}/cancel`).then(getData),

  // PUT /api/requests/{id}/fulfill
  fulfill: (id) =>
    api.put(`/api/requests/${id}/fulfill`).then(getData),

  // POST /api/requests/{id}/notify - Manual trigger
  triggerNotification: (id) =>
    api.post(`/api/requests/${id}/notify`).then(getData),
};

// ===== DONOR APIs =====
export const donorApi = {
  // POST /api/donor/profile - Create profile
  createProfile: (data) =>
    api.post('/api/donor/profile', data).then(getData),

  // GET /api/donor/me - Get my profile
  getMe: () =>
    api.get('/api/donor/me').then(getData),

  // PUT /api/donor/profile - Update profile
  updateProfile: (data) =>
    api.put('/api/donor/profile', data).then(getData),

  // PUT /api/donor/availability - Toggle availability
  toggleAvailability: () =>
    api.put('/api/donor/availability').then(getData),

  // GET /api/donor/requests - Available requests by city
  getAvailableRequests: () =>
    api.get('/api/donor/requests').then(getData),

  // GET /api/donor/notifications - Notified requests
  getNotifications: () =>
    api.get('/api/donor/notifications').then(getData),

  // PUT /api/donor/requests/{id}/accept
  acceptRequest: (requestId) =>
    api.put(`/api/donor/requests/${requestId}/accept`).then(getData),

  // PUT /api/donor/requests/{id}/reject
  rejectRequest: (requestId) =>
    api.put(`/api/donor/requests/${requestId}/reject`).then(getData),

  // POST /api/donor/donations - Record donation
  recordDonation: (data) =>
    api.post('/api/donor/donations', data).then(getData),

  // GET /api/donor/history - Donation history
  getHistory: () =>
    api.get('/api/donor/history').then(getData),

  // GET /api/donor/certificate/{id}
  getCertificate: (certificateId) =>
    api.get(`/api/donor/certificate/${certificateId}`).then(getData),

  // GET /api/donor/eligible
  checkEligible: () =>
    api.get('/api/donor/eligible').then(getData),
};

// ===== ADMIN APIs =====
export const adminApi = {
  // GET /api/admin/dashboard
  getDashboard: () =>
    api.get('/api/admin/dashboard').then(getData),

  // GET /api/admin/requests
  getRequests: (page = 0, size = 20, status = 'ALL') =>
    api.get(`/api/admin/requests?page=${page}&size=${size}&status=${status}`).then(getData),

  // PUT /api/admin/requests/{id}/status
  updateRequestStatus: (id, status) =>
    api.put(`/api/admin/requests/${id}/status?status=${status}`).then(getData),

  // GET /api/admin/donors
  getDonors: (page = 0, size = 20) =>
    api.get(`/api/admin/donors?page=${page}&size=${size}`).then(getData),

  // PUT /api/admin/donors/{id}/availability
  toggleDonorAvailability: (id) =>
    api.put(`/api/admin/donors/${id}/availability`).then(getData),

  // GET /api/admin/feedback
  getFeedback: (page = 0, size = 20) =>
    api.get(`/api/admin/feedback?page=${page}&size=${size}`).then(getData),

  // GET /api/admin/donations/pending
  getPendingDonations: () =>
    api.get('/api/admin/donations/pending').then(getData),

  // PUT /api/admin/donations/{id}/approve
  approveDonation: (id) =>
    api.put(`/api/admin/donations/${id}/approve`).then(getData),

  // PUT /api/admin/donations/{id}/reject
  rejectDonation: (id) =>
    api.put(`/api/admin/donations/${id}/reject`).then(getData),

  // GET /api/admin/users
  getUsers: (page = 0, size = 20) =>
    api.get(`/api/admin/users?page=${page}&size=${size}`).then(getData),

  // PUT /api/admin/users/{id}/toggle-status
  toggleUserStatus: (id) =>
    api.put(`/api/admin/users/${id}/toggle-status`).then(getData),
};

// ===== FEEDBACK API =====
export const feedbackApi = {
  submit: (requestId, rating, comment) =>
    api.post('/api/feedback', { requestId, rating, comment }).then(getData),

  // Donor gets feedback received about them
  getMyFeedback: () =>
    api.get('/api/feedback/my').then(getData),

  // Get average rating
  getMyAverage: () =>
    api.get('/api/feedback/my/average').then(getData),
};

export default api;
