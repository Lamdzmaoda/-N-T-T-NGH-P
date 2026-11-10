package org.example.backend.dto.request.debt;

import jakarta.validation.constraints.FutureOrPresent;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
/**
 * DTO dùng khi người dùng muốn cập nhật/bổ sung thông tin:
 * - Điền thêm số tài khoản ngân hàng (nếu lúc tạo nợ chưa nhập)
 * - Đổi hạn trả nợ (gia hạn nợ)
 * - Đổi ghi chú hoặc số điện thoại
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtLoanUpdateRequest {
    String personName;
    String phone;
    @FutureOrPresent(message = "Hạn trả nợ phải từ ngày hôm nay trở đi")
    LocalDate dueDate;
    String note;
    // Thông tin ngân hàng bổ sung sau này để sinh VietQR
    String bankName;
    String bankAccount;
    String bankAccountName;
}
