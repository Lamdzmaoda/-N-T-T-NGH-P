package org.example.backend.controller.categories;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.categories.CategoryRequest;
import org.example.backend.dto.request.wallet.WalletUpdateRequest;
import org.example.backend.dto.response.categories.CategoryResponse;
import org.example.backend.dto.response.wallet.WalletResponse;
import org.example.backend.service.categories.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Category Management", description = "Các API quản lý danh mục ")
public class CategoryController {
    CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo danh mục mới", description = "Người dùng tạo thêm danh mục cá nhân")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryRequest request){
        return ApiResponse.<CategoryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo danh mục thành công")
                .result(categoryService.createCategory(request))
                .build();
    }
    @GetMapping
    @Operation(summary = "Lấy tất cả danh mục", description = "Người dùng lấy tất cả danh mục cá nhân lẫn mặc định của hệ thống")
    public ApiResponse<List<CategoryResponse>> getCategories(){
        return ApiResponse.<List<CategoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh mục thành công")
                .result(categoryService.getAllCategories())
                .build();
    }
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục", description = "Chỉnh sửa tên ví, loại ví hoặc trạng thái tính vào tổng tài sản")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable String id,
            @RequestBody @Valid CategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .code(HttpStatus.OK.value())
                .result(categoryService.updateCategory(request, id))
                .build();
    }
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ví (Xóa mềm)", description = "Đánh dấu ngừng hoạt động ví, bảo toàn lịch sử các giao dịch cũ")
    public ApiResponse<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ApiResponse.<Void>builder().build();
    }
    @PutMapping("/trash/{id}")
    @Operation(summary = "Khôi phục", description = "Khôi phục danh mục")
    public ApiResponse<Void> restoreCategory(@PathVariable String id) {
        categoryService.restoreCategory(id);
        return ApiResponse.<Void>builder()
                .build();

    }

    @GetMapping("/admin")
    @Operation(summary = "Admin lấy danh sách tất cả danh mục")
    public ApiResponse<List<CategoryResponse>> getCategoriesForAdmin() {
        return ApiResponse.<List<CategoryResponse>>builder()

                .result(categoryService.getAllCategoriesForAdmin())
                .build();
    }
    @PostMapping("/admin")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Admin tạo danh mục mặc định của hệ thống")
    public ApiResponse<CategoryResponse> createSystemCategory(@RequestBody @Valid CategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.createSystemCategory(request))
                .build();
    }
    @PutMapping("/admin/{id}")
    @Operation(summary = "Admin cập nhật danh mục hệ thống")
    public ApiResponse<CategoryResponse> updateSystemCategory(
            @PathVariable String id,
            @RequestBody @Valid CategoryRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.updateSystemCategory(request, id))
                .build();
    }
    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Admin ẩn hoặc hiện danh mục hệ thống")
    public ApiResponse<Void> toggleSystemCategoryStatus(@PathVariable String id) {
        categoryService.toggleSystemCategoryStatus(id);
        return ApiResponse.<Void>builder()
                .build();
    }

    @DeleteMapping("/admin/trash/{id}")
    @Operation(summary = "Admin xóa hoàn toàn danh mục hệ thống")
    public ApiResponse<Void> permanentDeleteSystemCategory(@PathVariable String id){
        categoryService.permanentDeleteSystemCategory(id);
        return  ApiResponse.<Void>builder()
                .build();
    }
}
