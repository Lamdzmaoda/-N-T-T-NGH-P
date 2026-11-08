package org.example.backend.dto.request.debt;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtRepaymentRequest {

    @NotNull(message = "Số tiền trả không được để trống")
    @Positive(message = "Số tiền trả phải lớn hơn 0")
    BigDecimal amount;
    // Hình thức trả tiền: ví dụ "CASH", "BANK_TRANSFER", "Tiền mặt", "Chuyển khoản MB"...
    String paymentMethod;
    LocalDateTime repaymentDate; // Nếu null thì lấy giờ hiện tại
    String note;
}