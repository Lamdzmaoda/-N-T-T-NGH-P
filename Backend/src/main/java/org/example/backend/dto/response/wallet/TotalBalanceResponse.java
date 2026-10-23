package org.example.backend.dto.response.wallet;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TotalBalanceResponse {
    BigDecimal totalBalance; // Tổng tiền các ví có includeInTotal = true
    String currency;         // "VND"
    int totalWallets;        // Số lượng ví đang hoạt động
}
