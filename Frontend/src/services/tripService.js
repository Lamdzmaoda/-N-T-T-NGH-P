import api from './api'

const tripService = {
  // 1. Gửi thông số để AI lập lịch trình mới
  generateTrip: (data) => api.post('/trips/generate', data),

  // 2. Lấy toàn bộ danh sách lịch trình của người dùng đã đăng nhập
  getTrips: () => api.get('/trips'),

  // 3. Lấy thông tin chi tiết một lịch trình bằng ID
  getTripById: (id) => api.get(`/trips/${id}`),

  // 4. Thêm một hoạt động mới vào ngày cụ thể trong lịch trình
  addItineraryItem: (data) => api.post('/trips/itinerary', data),

  // 5. Cập nhật thông tin hoạt động trong lịch trình
  updateItineraryItem: (id, data) => api.put(`/trips/itinerary/${id}`, data),

  // 6. Xóa hoạt động khỏi lịch trình
  deleteItineraryItem: (id) => api.delete(`/trips/itinerary/${id}`),
}

export default tripService
