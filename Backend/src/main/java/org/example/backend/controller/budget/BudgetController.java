package org.example.backend.controller.budget;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.budget.BudgetRequest;
import org.example.backend.dto.response.budget.BudgetProgressResponse;
import org.example.backend.service.budget.BudgetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/budgets") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class BudgetController {
    BudgetService budgetService;

    @PostMapping
    public ApiResponse<BudgetProgressResponse> createBudget(@RequestBody @Valid BudgetRequest request) {
        return ApiResponse.<BudgetProgressResponse>builder()
                .result(budgetService.createBudget(request))
                .build();
    }
    @GetMapping("/progress")
    public ApiResponse<List<BudgetProgressResponse>> getBudgetProgress(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year
    ) {
        return ApiResponse.<List<BudgetProgressResponse>>builder()
                .result(budgetService.getBudgetProgress(month, year))
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<BudgetProgressResponse> updateBudget(
            @PathVariable String id,
            @RequestBody @Valid BudgetRequest request
    ) {
        return ApiResponse.<BudgetProgressResponse>builder()
                .result(budgetService.updateBudget(id, request))
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteBudget(@PathVariable String id) {
        budgetService.deleteBudget(id);
        return ApiResponse.<String>builder()
                .build();
    }
    @PutMapping("/trash/{id}/restore")
    @Operation(summary = "Khôi phục ngân sách từ thùng rác")
    public ApiResponse<Void> restoreBudget(@PathVariable String id) {
        budgetService.restoreBudget(id);
        return ApiResponse.<Void>builder()
                .build();
    }

    @DeleteMapping("/trash/{id}")
    @Operation(summary = "Xóa vĩnh viễn ngân sách khỏi thùng rác")
    public ApiResponse<Void> permanentDeleteBudget(@PathVariable String id) {
        budgetService.permanentDeleteBudget(id);
        return ApiResponse.<Void>builder()
                .build();
    }
}
