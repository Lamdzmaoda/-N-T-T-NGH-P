package org.example.backend.controller.auth;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.auth.PermissionRequest;
import org.example.backend.dto.response.auth.PermissionResponse;
import org.example.backend.service.auth.PermissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/permission") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class PermissionController {
    PermissionService permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> createPermission(@RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.create(request))
                .build();
    }
    @GetMapping
    ApiResponse<List<PermissionResponse>> getPermission() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getPermission())
                .build();
    }
    @DeleteMapping("/{permissionName}")
    ApiResponse<Void> deletePermission(@PathVariable String permissionName) {
        permissionService.delete(permissionName);
        return ApiResponse.<Void>builder()
                .build();
    }


}
