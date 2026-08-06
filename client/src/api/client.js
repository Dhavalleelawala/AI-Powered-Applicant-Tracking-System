import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rolefit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data?.error?.message || error.message)
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (role, data) => api.post(`/auth/register/${role}`, data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  savedJobs: () => api.get('/auth/saved-jobs'),
  toggleSavedJob: (jobId) => api.post(`/auth/saved-jobs/${jobId}`),
  getResume: () => api.get('/auth/resume'),
  saveResume: (data) => api.put('/auth/resume', data),
  downloadResumePdf: () => api.get('/auth/resume.pdf', { responseType: 'blob' }),
};

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }),
  mine: () => api.get('/recruiter/jobs'),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  archive: (id) => api.post(`/jobs/${id}/archive`),
  duplicate: (id) => api.post(`/jobs/${id}/duplicate`),
};

export const hiringApi = {
  analytics: () => api.get('/recruiter/analytics'),
  attention: () => api.get('/recruiter/attention'),
  candidates: (params) => api.get('/recruiter/candidates', { params }),
};

export const applicationsApi = {
  apply: (jobId, data) =>
    api.post(`/jobs/${jobId}/applications`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  mine: () => api.get('/applicant/applications'),
  get: (id) => api.get(`/applications/${id}`),
  forJob: (jobId, params) => api.get(`/jobs/${jobId}/applications`, { params }),
  move: (id, data) => api.patch(`/applications/${id}/status`, data),
  addNote: (id, text) => api.post(`/applications/${id}/notes`, { text }),
  bulkMove: (jobId, data) => api.post(`/jobs/${jobId}/applications/bulk-status`, data),
  resumeUrl: (id) => api.get(`/applications/${id}/resume-url`),
  reanalyze: (id) => api.post(`/applications/${id}/reanalyze`),
};
