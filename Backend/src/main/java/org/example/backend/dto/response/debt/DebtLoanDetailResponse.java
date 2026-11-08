package org.example.backend.dto.response.debt;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtLoanDetailResponse {
    DebtLoanResponse debtLoanResponse;
    List<DebtRepaymentResponse> repayments;
    String vietQrUrl;
}
