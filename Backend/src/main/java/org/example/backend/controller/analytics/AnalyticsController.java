package org.example.backend.controller.analytics;

import com.cloudinary.Api;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.analytics.CashFlowResponse;
import org.example.backend.dto.response.analytics.CategoryExpenseResponse;
import org.example.backend.dto.response.analytics.DashboardSummaryResponse;
import org.example.backend.service.analytics.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/analytics") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class AnalyticsController {

    AnalyticsService analyticsService;

    /**
     * API: Lấy tổng quan Dashboard (Tổng thu, Tổng chi, Tiết kiệm, % tăng trưởng)
     * URL: GET /api/analytics/dashboard-summary?month=11&year=2026
     * (Nếu client không truyền month/year thì mặc định lấy tháng và năm hiện tại)
     */
    @GetMapping("/dashboard-summary")
    public ApiResponse<DashboardSummaryResponse> getDashboardSummary(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ){
        LocalDate now = LocalDate.now();
        int queryMonth = (month != null) ? month : now.getMonthValue();
        int queryYear = (year != null) ? year : now.getYear();

        return ApiResponse.<DashboardSummaryResponse>builder()
                .result(analyticsService.getDashboardSummary(queryMonth,queryYear))
                .build();
    }

    @GetMapping("/cash-flow")
    public ApiResponse<List<CashFlowResponse>> getCashFlow(
            @RequestParam(required = false) Integer year
    ) {
        int queryYear = (year != null) ? year : LocalDate.now().getYear();
        return ApiResponse.<List<CashFlowResponse>>builder()
                .result(analyticsService.getCashFlow(queryYear))
                .build();
    }
    @GetMapping("/category-expenses")
    public  ApiResponse<List<CategoryExpenseResponse>> getCategoryExpenses(
            @RequestParam(required = false) Integer day,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ){
        LocalDate now = LocalDate.now();

        Integer queryMonth = month;
        if(day == null && month == null && year == null){
            queryMonth = now.getMonthValue();
        }
        int queryYear = (year != null) ? year : now.getYear();

        return ApiResponse.<List<CategoryExpenseResponse>>builder()
                .result(analyticsService.getCategoryExpenses(day, queryMonth, queryYear))
                .build();
    }
}
