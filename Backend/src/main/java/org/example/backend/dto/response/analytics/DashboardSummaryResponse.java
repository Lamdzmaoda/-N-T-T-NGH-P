package org.example.backend.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardSummaryResponse {
    BigDecimal totalIncome;          // Tổng thu nhập tháng này
    BigDecimal totalExpense;         // Tổng chi tiêu tháng này
    BigDecimal totalSavings;         // Tiền tiết kiệm (Thu - Chi)
    Double incomeGrowthRate;         // % biến động thu nhập so với tháng trước
    Double expenseGrowthRate;        // % biến động chi tiêu so với tháng trước
    Double netWorthGrowthRate;
}