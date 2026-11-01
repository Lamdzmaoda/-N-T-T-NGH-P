package org.example.backend.dto.request.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionRequest {
    @NotBlank(message = "WALLET_REQUIRED")
    String walletId;
    @NotBlank(message = "CATEGORY_REQUIRED")
    String categoryId;
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "0.0001", message = "AMOUNT_MUST_BE_GREATER_THAN_ZERO")
    BigDecimal amount;
    @NotNull(message = "TRANSACTION_TYPE_REQUIRED")
    TransactionType type; // Chỉ nhận EXPENSE hoặc INCOME
    LocalDateTime transactionDate;
    String note;
    String imageUrl;
}