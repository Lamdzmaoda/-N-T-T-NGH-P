package org.example.backend.controller.auth;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.auth.ChangePasswordRequest;
import org.example.backend.dto.request.auth.UserRequest;
import org.example.backend.dto.request.auth.UserUpdateRequest;
import org.example.backend.dto.response.auth.UserResponse;
import org.example.backend.service.auth.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/users") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class UserController {
    UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserRequest userRequest) {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.createUser(userRequest));
        return apiResponse;
    }

    @PutMapping("/{UserId}")
    public ApiResponse<UserResponse> updateUser(@RequestBody @Valid UserUpdateRequest userUpdateRequest, @PathVariable("UserId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userUpdateRequest, userId))
                .build();
    }

    @PutMapping("/changePassword")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.updatePassword(request);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping
    public List<UserResponse> getUsers() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        log.info("Username : {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info("GrantedAuthority : {}", grantedAuthority.getAuthority()));
        return userService.getAllUsers();
    }

    @GetMapping("/{UserId}")
    public UserResponse getUser(@PathVariable("UserId") String userId) {
        log.info("UserController:getUser");
        return userService.getUser(userId);
    }

    @GetMapping("/myInfo")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @DeleteMapping("/{UserId}")
    public void deleteUser(@PathVariable("UserId") String userId) {
        userService.deleteUser(userId);
    }


    @PutMapping("/{userId}/toggle-status")
    public ApiResponse<UserResponse> toggleUserStatus(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.toggleUserStatus(userId))
                .build();
    }
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserResponse> uploadAvatar(@RequestParam("file") MultipartFile file){
       return ApiResponse.<UserResponse>builder()
               .result(userService.uploadAvatar(file))
               .build();
    }
    @GetMapping("/admin/list")
    public ApiResponse<Page<UserResponse>> getUsersForAdmin(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 5, sort = "create_at", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getUsersWithFilters(keyword, role, startDate, endDate, pageable))
                .build();
    }
}
