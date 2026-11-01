package org.example.backend.controller.transaction;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.transaction.TransactionRequest;
import org.example.backend.dto.request.transaction.TransactionUpdateRequest;
import org.example.backend.dto.request.transaction.TransferRequest;
import org.example.backend.dto.request.transaction.TransferUpdateRequest;
import org.example.backend.dto.response.transcation.TransactionResponse;

import org.example.backend.service.transaction.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TransactionController {
    TransactionService transactionService;
    // 1. Tạo giao dịch Thu / Chi
    @PostMapping
    public ApiResponse<TransactionResponse> createTransaction(@RequestBody @Valid TransactionRequest request) {
        return ApiResponse.<TransactionResponse>builder()
                .result(transactionService.createTransaction(request))
                .build();
    }
    // 2. Chuyển tiền giữa các ví
    @PostMapping("/transfer")
    public ApiResponse<TransactionResponse> transferMoney(@RequestBody @Valid TransferRequest request) {
        return ApiResponse.<TransactionResponse>builder()
                .result(transactionService.transferMoney(request))
                .build();
    }
    @PutMapping("/{transactionId}")
    public ApiResponse<TransactionResponse> updateTransaction(@RequestBody @Valid TransactionUpdateRequest request, @PathVariable String transactionId) {
        return ApiResponse.<TransactionResponse>builder()
                .result(transactionService.updateTransaction(transactionId,request))
                .build();
    }
    @PutMapping("/transfer/{transactionId}")
    public ApiResponse<TransactionResponse> updateTransfer(@RequestBody @Valid TransferUpdateRequest request, @PathVariable String transactionId) {
        return ApiResponse.<TransactionResponse>builder()
                .result(transactionService.updateTransfer(transactionId,request))
                .build();
    }

    // 3. Lấy 5 giao dịch gần đây cho Dashboard
    @GetMapping("/recent")
    public ApiResponse<List<TransactionResponse>> getRecentTransactions() {
        return ApiResponse.<List<TransactionResponse>>builder()
                .result(transactionService.getRecentTransaction())
                .build();
    }
    // 4. Lấy danh sách giao dịch có phân trang
    @GetMapping
    public ApiResponse<Page<TransactionResponse>> getTransactions(
            @PageableDefault(size = 10, sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.<Page<TransactionResponse>>builder()
                .result(transactionService.getTransaction(pageable))
                .build();
    }
    // 5. Xóa giao dịch (hoàn lại số dư)
    @DeleteMapping("/{transactionId}")
    public ApiResponse<Void> deleteTransaction(@PathVariable String transactionId) {
        transactionService.deleteTransaction(transactionId);
        return ApiResponse.<Void>builder()
                .message("Xóa giao dịch và hoàn trả số dư thành công")
                .build();
    }
}