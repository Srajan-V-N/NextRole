import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nextrole_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nextrole_token')
      localStorage.removeItem('nextrole_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Profile
export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
  completeness: () => api.get('/profile/completeness'),
}

// Jobs
export const jobsAPI = {
  search: (q = '', location = '') => api.get(`/jobs/search?q=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}`),
  getSaved: () => api.get('/jobs/saved'),
  save: (job) => api.post('/jobs/save', { job }),
  unsave: (jobId) => api.delete(`/jobs/save/${jobId}`),
  setActive: (job) => api.post('/jobs/active', { job }),
  getActive: () => api.get('/jobs/active'),
  clearActive: () => api.delete('/jobs/active'),
}

// Resume
export const resumeAPI = {
  get: () => api.get('/resume/'),
  save: (resume, preserveTailored = false) => api.put('/resume/', { resume, preserve_tailored: preserveTailored }),
  generate: () => api.post('/resume/generate'),
  atsScore: () => api.get('/resume/ats-score'),
  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/resume/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Readiness
export const readinessAPI = {
  get: () => api.get('/readiness/'),
  generate: () => api.post('/readiness/generate'),
  updateTask: (taskId, completed) => api.put(`/readiness/task/${taskId}`, { completed }),
  score: () => api.get('/readiness/score'),
}

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard/'),
}

// Application Tracker
export const trackerAPI = {
  get: () => api.get('/tracker/'),
  add: (entry) => api.post('/tracker/', { entry }),
  update: (id, data) => api.put(`/tracker/${id}`, data),
  remove: (id) => api.delete(`/tracker/${id}`),
}

// Courses
export const coursesAPI = {
  get: (role = '') => api.get(`/courses/?role=${encodeURIComponent(role)}`),
}

// Interview
export const interviewAPI = {
  generate: () => api.post('/interview/generate'),
}

// LinkedIn Optimizer
export const linkedinAPI = {
  optimize: (targetRole) => api.post('/linkedin/optimize', { target_role: targetRole }),
}

// Career Gap
export const careerAPI = {
  roadmap: () => api.get('/career/roadmap'),
}

export default api
