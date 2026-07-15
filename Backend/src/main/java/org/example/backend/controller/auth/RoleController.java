package org.example.backend.controller.auth;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.auth.RoleRequest;
import org.example.backend.dto.response.auth.RoleResponse;
import org.example.backend.service.auth.RoleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/role") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class RoleController {
    RoleService roleService;

    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .build();
    }
    @GetMapping
    ApiResponse<List<RoleResponse>> getRole() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getRoles())
                .build();
    }
    @DeleteMapping("/{roleName}")
    ApiResponse<Void> deletePermission(@PathVariable String roleName) {
        roleService.deleteRole(roleName);
        return ApiResponse.<Void>builder()
                .build();
    }


}
