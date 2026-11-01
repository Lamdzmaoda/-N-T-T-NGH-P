package org.example.backend.dto.request.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransferRequest {
    @NotBlank(message = "SOURCE_WALLET_REQUIRED")
    String sourceWalletId;
    @NotBlank(message = "DESTINATION_WALLET_REQUIRED")
    String destinationWalletId;
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "0.0001", message = "AMOUNT_MUST_BE_GREATER_THAN_ZERO")
    BigDecimal amount;
    LocalDateTime transactionDate;
    String note;
}
