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

  // 7. Bắt đầu chuyến đi (Kích hoạt trạng thái ONGOING)
  startTrip: (id) => api.put(`/trips/${id}/start`),

  // 8. Lấy thông tin chỉ đường, bản đồ GPS chi tiết cho chuyến đi đang diễn ra
  getTripNavigation: (id) => api.get(`/trips/${id}/navigation`),
}

export default tripService

