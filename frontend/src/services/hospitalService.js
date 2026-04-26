import api from './api';

export const hospitalService = {
  search: (payload) => api.post('/search', payload),
  list: () => api.get('/hospitals'),
  detail: (id) => api.get(`/hospital/${id}`),
  emergency: (payload) => api.post('/emergency', payload),
};
