package org.example.backend.controller.debt;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.debt.DebtLoanRequest;
import org.example.backend.dto.request.debt.DebtLoanUpdateRequest;
import org.example.backend.dto.request.debt.DebtRepaymentRequest;
import org.example.backend.dto.response.debt.DebtLoanDetailResponse;
import org.example.backend.dto.response.debt.DebtLoanResponse;
import org.example.backend.dto.response.debt.DebtLoanSummaryResponse;
import org.example.backend.dto.response.debt.DebtRepaymentResponse;
import org.example.backend.enums.DebtLoanStatus;
import org.example.backend.enums.DebtLoanType;
import org.example.backend.service.debt.DebtLoanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/debtLoan")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Debt & Loan Management", description = "Các API quản lý sổ nợ, cho vay, xác nhận 2 chiều P2P, trả nợ từng phần và VietQR")
public class DebtLoanController {

    DebtLoanService debtLoanService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo khoản nợ / cho vay mới",
            description = "Tạo bản ghi công nợ mới (LOAN: Cho vay, DEBT: Đi vay). Nếu đối tác có tài khoản trên app thì chuyển sang trạng thái chờ xác nhận.")
    public ApiResponse<DebtLoanResponse> createDebtLoan(@RequestBody @Valid DebtLoanRequest request) {
        return ApiResponse.<DebtLoanResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo khoản công nợ thành công")
                .result(debtLoanService.createDebtLoan(request))
                .build();
    }

    @GetMapping("/summary")
    @Operation(summary = "Lấy 4 chỉ số vàng tổng quan công nợ",
            description = "Tính toán tổng tiền đã cho vay, tiền còn phải thu, tiền đã đi vay, tiền còn phải trả, công nợ ròng và số khoản nợ quá hạn.")
    public ApiResponse<DebtLoanSummaryResponse> getDebtLoanSummary() {
        return ApiResponse.<DebtLoanSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .result(debtLoanService.getDebtLoanSummary())
                .build();
    }

    @GetMapping("/pending-requests")
    @Operation(summary = "Danh sách yêu cầu công nợ chờ duyệt",
            description = "Lấy danh sách các khoản nợ do người khác tạo và gán cho tài khoản hiện tại để duyệt.")
    public ApiResponse<List<DebtLoanResponse>> getPendingRequests() {
        return ApiResponse.<List<DebtLoanResponse>>builder()
                .code(HttpStatus.OK.value())
                .result(debtLoanService.getPendingRequests())
                .build();
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách sổ nợ của tôi",
            description = "Lấy danh sách công nợ có hỗ trợ bộ lọc theo loại (LOAN/DEBT), trạng thái (ACTIVE/PAID/OVERDUE) và tìm kiếm theo tên.")
    public ApiResponse<List<DebtLoanResponse>> getMyDebtLoans(
            @RequestParam(required = false) DebtLoanType type,
            @RequestParam(required = false) DebtLoanStatus status,
            @RequestParam(required = false) String search) {
        return ApiResponse.<List<DebtLoanResponse>>builder()
                .code(HttpStatus.OK.value())
                .result(debtLoanService.getMyDebtLoans(type, status, search))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết khoản nợ",
            description = "Xem thông tin chi tiết khoản nợ, toàn bộ lịch sử các đợt trả nợ từng phần và đường dẫn mã VietQR Napas 247.")
    public ApiResponse<DebtLoanDetailResponse> getDebtLoanById(@PathVariable String id) {
        return ApiResponse.<DebtLoanDetailResponse>builder()
                .code(HttpStatus.OK.value())
                .result(debtLoanService.getDebtLoanDetail(id))
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin khoản nợ",
            description = "Cập nhật ngày hẹn trả nợ, ghi chú, số điện thoại hoặc bổ sung số tài khoản ngân hàng để sinh mã VietQR.")
    public ApiResponse<DebtLoanResponse> updateDebtLoan(
            @PathVariable String id,
            @RequestBody @Valid DebtLoanUpdateRequest request) {
        return ApiResponse.<DebtLoanResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật khoản nợ thành công")
                .result(debtLoanService.updateDebtLoan(id, request))
                .build();
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Xác nhận yêu cầu công nợ",
            description = "Đối tác bấm xác nhận khoản nợ. Hệ thống kích hoạt trạng thái ACTIVE và tự động sinh bản ghi nợ đối ứng.")
    public ApiResponse<DebtLoanResponse> confirmDebtLoan(@PathVariable String id) {
        return ApiResponse.<DebtLoanResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Xác nhận khoản nợ thành công")
                .result(debtLoanService.confirmDebtLoan(id))
                .build();
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Từ chối yêu cầu công nợ",
            description = "Đối tác từ chối khoản nợ được gán. Trạng thái chuyển thành REJECTED và thông báo tới người tạo.")
    public ApiResponse<String> rejectDebtLoan(@PathVariable String id) {
        debtLoanService.rejectDebtLoan(id);
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .result("Đã từ chối yêu cầu công nợ thành công")
                .build();
    }

    @PostMapping("/{id}/repayments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ghi nhận trả nợ từng phần / tất toán",
            description = "Ghi nhận một đợt trả nợ, giảm trừ số nợ còn lại, lưu phương thức thanh toán và tự động đồng bộ sang sổ nợ của đối tác.")
    public ApiResponse<DebtRepaymentResponse> recordRepayment(
            @PathVariable String id,
            @RequestBody @Valid DebtRepaymentRequest request) {
        return ApiResponse.<DebtRepaymentResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Ghi nhận trả nợ thành công")
                .result(debtLoanService.recordRepayment(id, request))
                .build();
    }

    @PostMapping("/{id}/remind")
    @Operation(summary = "Nhắc nợ đối tác qua WebSocket",
            description = "Gửi thông báo realtime nhắc nợ tới tài khoản đối tác (có Cooldown 24h chống spam).")
    public ApiResponse<String> remindDebt(@PathVariable String id) {
        debtLoanService.remindDebt(id);
        return ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .result("Đã gửi lời nhắc nợ thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm khoản nợ",
            description = "Ẩn khoản nợ khỏi danh sách (isActive = false) nhưng vẫn bảo toàn lịch sử thanh toán đối soát.")
    public ApiResponse<Void> deleteDebt(@PathVariable String id) {
        debtLoanService.deleteDebtLoan(id);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa khoản nợ thành công")
                .build();
    }
}