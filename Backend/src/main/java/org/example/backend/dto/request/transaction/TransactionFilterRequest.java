package org.example.backend.dto.request.transaction;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.TransactionType;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionFilterRequest {
    String walletId;
    String categoryId;
    TransactionType type; // EXPENSE, INCOME, TRANSFER

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate endDate;

    BigDecimal minAmount;
    BigDecimal maxAmount;
    String keyword;
}