package org.example.backend.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CashFlowResponse {
    String month;
    int monthValue;
    BigDecimal income;
    BigDecimal expense;
}
