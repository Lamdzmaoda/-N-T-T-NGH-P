package org.example.backend.entity.debt;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.DebtLoanStatus;
import org.example.backend.enums.DebtLoanType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "debt_loans", indexes = {
        @Index(name = "idx_debt_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    // Người dùng sở hữu bản ghi công nợ này
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    // Tên đối tác (ví dụ: "Bác Ba", "Nam")
    @Column(name = "person_name", nullable = false, length = 100)
    String personName;

    @Column(length = 20)
    String phone;

    // Tùy chọn: Liên kết với tài khoản User nếu đối tác cũng dùng ứng dụng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_user_id")
    User partnerUser;

    // Số tiền nợ ban đầu
    @Column(nullable = false, precision = 19, scale = 4)
    BigDecimal amount;

    // Số tiền nợ còn lại (tự động trừ dần mỗi khi trả nợ)
    @Column(name = "remaining_amount", nullable = false, precision = 19, scale = 4)
    BigDecimal remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    DebtLoanType type; // LOAN hoặc DEBT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    DebtLoanStatus status; // ACTIVE, PAID, OVERDUE

    @Column(name = "due_date")
    LocalDate dueDate; // Hạn trả nợ

    @Column(columnDefinition = "TEXT")
    String note; // Ghi chú

    // Thông tin tài khoản nhận tiền để tự sinh mã VietQR
    @Column(name = "bank_name", length = 50)
    String bankName;

    @Column(name = "bank_account", length = 50)
    String bankAccount;

    @Column(name = "bank_account_name", length = 100)
    String bankAccountName;
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "last_reminded_at")
    LocalDateTime lastRemindedAt;
    @Column(name = "linked_debt_loan_id")
    String linkedDebtLoanId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}