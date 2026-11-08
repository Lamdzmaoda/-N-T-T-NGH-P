package org.example.backend.entity.debt;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "debt_repayments", indexes = {
        @Index(name = "idx_repayment_debt_id", columnList = "debt_loan_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtRepayment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    // Khoản nợ được thanh toán
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debt_loan_id", nullable = false)
    DebtLoan debtLoan;
    // Số tiền thanh toán đợt này
    @Column(nullable = false, precision = 19, scale = 4)
    BigDecimal amount;
    // Thời điểm thanh toán
    @Column(name = "repayment_date", nullable = false)
    LocalDateTime repaymentDate;
    // Hình thức thanh toán: "CASH" (Tiền mặt), "BANK_TRANSFER" (Chuyển khoản), v.v.
    @Column(name = "payment_method", length = 50)
    String paymentMethod;
    // Ghi chú (ví dụ: "Chuyển khoản đợt 1", "Đưa tiền mặt")
    @Column(columnDefinition = "TEXT")
    String note;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
