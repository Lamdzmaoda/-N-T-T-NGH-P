import api from './api'

const tripService = {
  // 1. Gửi thông số để AI lập lịch trình mới
  generateTrip: (data) => api.post('/trips/generate', data),

  // 2. Lấy toàn bộ danh sách lịch trình của người dùng đã đăng nhập (hỗ trợ phân trang, bộ lọc)
  getTrips: (params) => api.get('/trips', { params }),

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

  // 9. Thả tim/bỏ thả tim chuyến đi
  toggleFavorite: (id) => api.put(`/trips/${id}/favorite`),

  // 10. Lấy danh sách chuyến đi yêu thích
  getFavoriteTrips: () => api.get('/trips/favorites'),

  // 11. Gửi email lịch trình chi tiết
  sendItineraryEmail: (id) => api.post(`/trips/${id}/send-email`),

  // 12. Gợi ý ghi chú hoạt động bằng AI dựa trên địa danh
  getAiSuggestionForPlace: (placeName, placeType) => api.get('/ai/chat', { 
    params: { 
      prompt: `Gợi ý 1 câu tiếng Việt ngắn gọn, tự nhiên (khoảng 12-15 từ) mô tả hoạt động thực tế thích hợp khi ghé thăm địa điểm '${placeName}' (loại ${placeType}) trong lịch trình du lịch. Ví dụ: 'Thưởng thức cà phê trứng thơm ngon và ngắm cảnh phố cổ Hà Nội cổ kính.' Không thêm bất kỳ lời dẫn nào.` 
    } 
  }),
}

export default tripService

