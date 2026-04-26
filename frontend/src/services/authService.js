import api from './api';

export const authService = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  google: (payload) => api.post('/auth/google', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  requestOtp: (payload) => api.post('/auth/mobile/request', payload),
  verifyOtp: (payload) => api.post('/auth/mobile/verify', payload),
};
