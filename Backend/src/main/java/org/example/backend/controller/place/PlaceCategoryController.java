package org.example.backend.controller.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.entity.Places.PlaceCategory;
import org.example.backend.service.place.PlaceCategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/categories") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class PlaceCategoryController {
    PlaceCategoryService categoryService;
    // 1. Tạo mới danh mục (Admin mới có quyền, ở đây tạm thời gọi trực tiếp)
    @PostMapping
    public ApiResponse<PlaceCategoryResponse> createCategory(@RequestBody PlaceCategoryRequest request) {
        return ApiResponse.<PlaceCategoryResponse>builder()
                .result(categoryService.create(request))
                .build();
    }
    // 2. Lấy toàn bộ danh mục (Public API)
    @GetMapping
    public ApiResponse<List<PlaceCategoryResponse>> getAllCategories() {
        return ApiResponse.<List<PlaceCategoryResponse>>builder()
                .result(categoryService.findAll())
                .build();
    }
    // 3. Cập nhật danh mục
    @PutMapping("/{id}")
    public ApiResponse<PlaceCategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody PlaceCategoryRequest request) {
        return ApiResponse.<PlaceCategoryResponse>builder()
                .result(categoryService.update(request,id))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.delete(id);
        return ApiResponse.<Void>builder()
                .message("Xóa danh mục thành công")
                .build();
    }
}
