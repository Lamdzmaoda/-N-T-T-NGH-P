package org.example.backend.dto.request.transaction;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionUpdateRequest {
    String categoryId;
    LocalDateTime transactionDate;
    String note;
    String imageUrl;
    String walletId;
    BigDecimal amount;
}
