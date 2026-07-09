import api from './api'

const placeService = {
      // ==================== DANH MỤC (CATEGORIES) ====================
        // 1. Lấy tất cả danh mục (Public)
        getCategories: () => api.get('/categories'),
        // 2. Thêm danh mục mới (Yêu cầu ADMIN)
        createCategory: (data) => api.post('/categories', data),
        // 3. Cập nhật danh mục (Yêu cầu ADMIN)
        updateCategory: (id, data) => api.put(`/categories/${id}`, data),
        // 4. Xóa danh mục (Yêu cầu ADMIN)
        deleteCategory: (id) => api.delete(`/categories/${id}`),
        // ==================== ĐỊA ĐIỂM (PLACES) ====================
        // 5. Lấy danh sách địa điểm (Public - hỗ trợ tìm kiếm, lọc theo loại, danh mục và phân trang)
        getPlaces: (params) => {
            // params là object chứa: page, size, search, type, categoryId
            return api.get('/places', { params })
        },
        // 6. Lấy thông tin chi tiết một địa điểm theo ID (Public)
        getPlaceById: (id) => api.get(`/places/${id}`),
        // 7. Thêm địa điểm mới (Yêu cầu ADMIN)
        createPlace: (data) => api.post('/places', data),
        // 8. Cập nhật địa điểm (Yêu cầu ADMIN)
        updatePlace: (id, data) => api.put(`/places/${id}`, data),
        // 9. Xóa địa điểm (Yêu cầu ADMIN)
        deletePlace: (id) => api.delete(`/places/${id}`),
        // 10. Thích địa điểm (Yêu cầu đăng nhập)
        likePlace: (id) => api.post(`/places/${id}/like`),
        // 11. Bỏ thích địa điểm (Yêu cầu đăng nhập)
        unlikePlace: (id) => api.delete(`/places/${id}/unlike`),
        // ==================== ĐÁNH GIÁ (REVIEWS) ====================
        // 12. Lấy danh sách đánh giá của địa điểm
        getReviews: (placeId) => api.get(`/reviews/${placeId}`),
        // 13. Viết đánh giá mới (Yêu cầu đăng nhập)
        createReview: (data) => api.post('/reviews', data),
        // 14. Cập nhật đánh giá (Yêu cầu đăng nhập)
        updateReview: (id, data) => api.put(`/reviews/${id}`, data),
        // 15. Xóa đánh giá (Yêu cầu đăng nhập)
        deleteReview: (id) => api.delete(`/reviews/${id}`),
        }
export default placeService