package org.example.backend.controller.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.request.place.ReviewRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.dto.response.place.ReviewResponse;
import org.example.backend.service.place.PlaceCategoryService;
import org.example.backend.service.place.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/reviews") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class ReviewController {
    ReviewService reviewService;
    // 1. Tạo mới danh mục (Admin mới có quyền, ở đây tạm thời gọi trực tiếp)
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createReview(request))
                .build();
    }
    // 2. Lấy toàn bộ danh mục (Public API)
    @GetMapping("/{placeId}")
    public ApiResponse<List<ReviewResponse>> getReviews(@PathVariable String placeId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviews(placeId))
                .build();
    }
    // 3. Cập nhật danh mục
    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable String id,
            @RequestBody ReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.updateReview(request,id))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ApiResponse.<Void>builder()
                .message("Xóa danh mục thành công")
                .build();
    }
}
