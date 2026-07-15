package org.example.backend.controller.dashboard;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.dashboard.DashboardResponse;
import org.example.backend.dto.response.dashboard.UserStatsResponse;
import org.example.backend.service.dashboard.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardController {
    DashboardService dashboardService;

    /**
     * Lấy dữ liệu thống kê tổng hợp dành cho Admin
     */
    @GetMapping("/admin")
    public ApiResponse<DashboardResponse> getAdminDashboard() {
        return ApiResponse.<DashboardResponse>builder()
                .result(dashboardService.getAdminDashboard())
                .build();
    }

    /**
     * Lấy dữ liệu thống kê cá nhân của người dùng đang đăng nhập
     */
    @GetMapping("/user")
    public ApiResponse<UserStatsResponse> getUserStats() {
        return ApiResponse.<UserStatsResponse>builder()
                .result(dashboardService.getUserStats())
                .build();
    }
}
