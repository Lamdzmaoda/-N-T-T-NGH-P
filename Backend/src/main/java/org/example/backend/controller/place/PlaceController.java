package org.example.backend.controller.place;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.request.place.PlaceRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.dto.response.place.PlaceResponse;
import org.example.backend.enums.PlaceType;
import org.example.backend.service.place.PlaceCategoryService;
import org.example.backend.service.place.PlaceService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/places") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class PlaceController {
    PlaceService placeService;
    // 1. Tạo mới danh mục (Admin mới có quyền, ở đây tạm thời gọi trực tiếp)
    @PostMapping
    public ApiResponse<PlaceResponse> createPlace(@RequestBody PlaceRequest request) {
        return ApiResponse.<PlaceResponse>builder()
                .result(placeService.create(request))
                .build();
    }
    // 2. Lấy toàn bộ danh mục (Public API)
    @GetMapping
    public ApiResponse<Page<PlaceResponse>> getAllPlaces(@RequestParam(value = "page", defaultValue = "0") int page
            , @RequestParam(value = "size", defaultValue = "10") int size,
                                                                     @RequestParam(value = "search", required = false) String search,
                                                                     @RequestParam(value = "type", required = false) PlaceType type,
                                                                     @RequestParam(value = "categoryId", required = false) String categoryId ) {
        return ApiResponse.<Page<PlaceResponse>>builder()
                .result(placeService.findAll(page,size,search,type,categoryId))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<PlaceResponse> getPlace(
            @PathVariable String id) {
        return ApiResponse.<PlaceResponse>builder()
                .result(placeService.findById(id))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<PlaceResponse> updatePlace(
            @PathVariable String id,
            @RequestBody PlaceRequest request) {
        return ApiResponse.<PlaceResponse>builder()
                .result(placeService.update(request,id))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePlace(@PathVariable String id) {
        placeService.delete(id);
        return ApiResponse.<Void>builder()
                .message("Xóa địa điểm thành công")
                .build();
    }
    @PostMapping("/{id}/like")
    public ApiResponse<Void> likePlace(@PathVariable String id) {
        placeService.likePlace(id);
        return ApiResponse.<Void>builder()
                .message("Đã thích địa điểm")
                .build();
    }
    @DeleteMapping("/{id}/unlike")
    public ApiResponse<Void> unLikePlace(@PathVariable String id) {
        placeService.unlikePlace(id);
        return ApiResponse.<Void>builder()
                .message("Đã bỏ thích địa điểm")
                .build();
    }
}
