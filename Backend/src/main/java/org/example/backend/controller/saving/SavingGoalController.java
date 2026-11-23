package org.example.backend.controller.saving;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.saving.*;
import org.example.backend.dto.response.saving.SavingGoalResponse;
import org.example.backend.service.saving.SavingGoalService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/savings-goals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Saving Goals", description = "Các API quản lý mục tiêu tiết kiệm và heo đất tài chính")
public class SavingGoalController {
    SavingGoalService savingGoalService;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo mục tiêu tiết kiệm mới", description = "Tự động sinh ví loại SAVING liên kết 1-1 và hỗ trợ nạp tiền khởi điểm")
    public ApiResponse<SavingGoalResponse> createGoal(@RequestBody @Valid SavingGoalRequest request) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.CREATED.value())
                .result(savingGoalService.createGoal(request))
                .build();
    }
    @GetMapping
    @Operation(summary = "Lấy danh sách mục tiêu tiết kiệm", description = "Lấy toàn bộ mục tiêu còn hoạt động kèm tỷ lệ % hoàn thành và số ngày còn lại")
    public ApiResponse<List<SavingGoalResponse>> getMyGoals() {
        return ApiResponse.<List<SavingGoalResponse>>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.getMyGoals())
                .build();
    }
    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết mục tiêu tiết kiệm", description = "Xem chi tiết số dư, hạn định và trạng thái hoàn thành")
    public ApiResponse<SavingGoalResponse> getGoalById(@PathVariable String id) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.getGoalById(id))
                .build();
    }
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật mục tiêu tiết kiệm", description = "Chỉnh sửa tên, số tiền đích, ngày hạn định hoặc màu sắc/icon (tự động đồng bộ tên ví)")
    public ApiResponse<SavingGoalResponse> updateGoal(
            @PathVariable String id,
            @RequestBody @Valid SavingGoalUpdateRequest request) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.updateGoal(id, request))
                .build();
    }
    @PostMapping("/{id}/deposit")
    @Operation(summary = "Nạp tiền vào heo đất", description = "Trừ tiền từ ví nguồn, cộng tiền vào ví tiết kiệm và tự động sinh giao dịch TRANSFER")
    public ApiResponse<SavingGoalResponse> depositMoney(
            @PathVariable String id,
            @RequestBody @Valid SavingDepositRequest request) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.depositMoney(id, request))
                .build();
    }
    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Rút tiền từ heo đất về ví chi tiêu", description = "Trừ tiền ví tiết kiệm, cộng tiền ví đích và tự động sinh giao dịch TRANSFER")
    public ApiResponse<SavingGoalResponse> withdrawMoney(
            @PathVariable String id,
            @RequestBody @Valid SavingWithdrawRequest request) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.withdrawMoney(id, request))
                .build();
    }
    @PostMapping("/{id}/fulfill")
    @Operation(summary = "Hiện thực hóa mục tiêu / Mua sắm", description = "Trừ sạch số dư ví tiết kiệm và ghi nhận 1 giao dịch EXPENSE thật vào báo cáo tài chính")
    public ApiResponse<SavingGoalResponse> fulfillGoal(
            @PathVariable String id,
            @RequestBody @Valid SavingFulfillRequest request) {
        return ApiResponse.<SavingGoalResponse>builder()
                .code(HttpStatus.OK.value())
                .result(savingGoalService.fulfillGoal(id, request))
                .build();
    }
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mục tiêu tiết kiệm", description = "Bắt buộc truyền destinationWalletId nếu mục tiêu vẫn còn số dư để hoàn trả tiền")
    public ApiResponse<Void> deleteGoal(
            @PathVariable String id,
            @RequestParam(required = false) String destinationWalletId) {
        savingGoalService.deleteGoal(id, destinationWalletId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .build();
    }
}
