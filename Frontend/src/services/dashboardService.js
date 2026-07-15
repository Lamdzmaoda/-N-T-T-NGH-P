import api from './api'

const dashboardService = {
  getUserStats: () => api.get('/dashboard/user'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
}

export default dashboardService
