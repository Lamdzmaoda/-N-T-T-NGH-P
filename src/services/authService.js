import api from './api'

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (data) => api.post('/auth/logout', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: (data) => api.post('/auth/refresh', data),
}

export default authService