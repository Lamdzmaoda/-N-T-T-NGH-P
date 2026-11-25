package org.example.backend.controller.wallet;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.wallet.WalletCreationRequest;
import org.example.backend.dto.request.wallet.WalletUpdateRequest;
import org.example.backend.dto.response.wallet.TotalBalanceResponse;
import org.example.backend.dto.response.wallet.WalletResponse;
import org.example.backend.enums.WalletType;
import org.example.backend.service.wallet.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Wallet Management", description = "Các API quản lý ví và tài sản cá nhân")
public class WalletController {
    WalletService walletService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tạo ví mới", description = "Người dùng tạo thêm ví chi tiêu (Ví tiền mặt, ngân hàng, ví điện tử...)")
    public ApiResponse<WalletResponse> createWallet(@RequestBody @Valid WalletCreationRequest request) {
        return ApiResponse.<WalletResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo ví thành công")
                .result(walletService.createWallet(request))
                .build();
    }

    @GetMapping()
    @Operation(summary = "Lấy danh sách ví", description = "Lấy toàn bộ các ví đang hoạt động của người dùng hiện tại")
    public ApiResponse<List<WalletResponse>> getMyWallets() {
        return ApiResponse.<List<WalletResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách ví thành công")
                .result(walletService.getMyWallets())
                .build();
    }

    @GetMapping("/{type}/my-wallets")
    @Operation(summary = "Lấy danh sách ví", description = "Lấy ví theo loại ví")
    public ApiResponse<List<WalletResponse>> getMyWalletsByType(WalletType type) {
        return ApiResponse.<List<WalletResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách ví thành công")
                .result(walletService.getMyWalletsOfType(type))
                .build();
    }

    @GetMapping("/total-balance")
    @Operation(summary = "Lấy tổng tài sản", description = "Tính tổng số dư từ tất cả các ví có includeInTotal = true")
    public ApiResponse<TotalBalanceResponse> getTotalBalance() {
        return ApiResponse.<TotalBalanceResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy tổng số dư tài sản thành công")
                .result(walletService.getTotalBalance())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết ví", description = "Xem thông tin chi tiết của 1 ví theo ID")
    public ApiResponse<WalletResponse> getWalletById(@PathVariable String id) {
        return ApiResponse.<WalletResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy thông tin ví thành công")
                .result(walletService.getWalletById(id))
                .build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật ví", description = "Chỉnh sửa tên ví, loại ví hoặc trạng thái tính vào tổng tài sản")
    public ApiResponse<WalletResponse> updateWallet(
            @PathVariable String id,
            @RequestBody @Valid WalletUpdateRequest request) {
        return ApiResponse.<WalletResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Cập nhật thông tin ví thành công")
                .result(walletService.updateWallet(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ví (Xóa mềm)", description = "Đánh dấu ngừng hoạt động ví, bảo toàn lịch sử các giao dịch cũ")
    public ApiResponse<Void> deleteWallet(@PathVariable String id) {
        walletService.deleteWallet(id);
        return ApiResponse.<Void>builder()
                .build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Khôi phục ví", description = "Khôi phục lại ví")
    public ApiResponse<Void> restoreWallet(@PathVariable String id) {
        walletService.restoreWallet(id);
        return ApiResponse.<Void>builder().build();
    }
    @PatchMapping("/{id}/transferState")
    @Operation(summary = "Tính vào tổng tài sản", description = "Tính vào tổng tài sản")
    public ApiResponse<Void> transferState(@PathVariable String id) {
        walletService.transferState(id);
        return  ApiResponse.<Void>builder().build();
    }
    @DeleteMapping("/trash/{id}")
    @Operation(summary = "Xóa vĩnh viễn ví khỏi thùng rác")
    public ApiResponse<Void> permanentDeleteWallet(@PathVariable String id) {
        walletService.permanentDeleteWallet(id);
        return ApiResponse.<Void>builder().build();
    }
}
