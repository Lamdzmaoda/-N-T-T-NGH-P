package org.example.backend.dto.request.transaction;

import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransferUpdateRequest {
    String sourceWalletId;       // Đổi ví chuyển (nếu có)
    String destinationWalletId;  // Đổi ví nhận (nếu có)
    @DecimalMin(value = "0.0001", message = "AMOUNT_MUST_BE_GREATER_THAN_ZERO")
    BigDecimal amount;
    LocalDateTime transactionDate;
    String note;
}
