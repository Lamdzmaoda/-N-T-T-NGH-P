import api from './api'

const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/token', data),
  logout: (data) => api.post('/auth/logout', data),
  getMe: () => api.get('/users/myInfo'),
  refreshToken: (data) => api.post('/auth/refresh', data),
  // Lấy toàn bộ danh sách thành viên (ADMIN)
  getUsers: () => api.get('/users'),
  // Cập nhật thông tin thành viên (ADMIN)
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  // Xóa thành viên (ADMIN)
  deleteUser: (id) => api.delete(`/users/${id}`),
}

export default authService