package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.TransactionType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name = "transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    // Giao dịch thuộc về User nào (Multi-tenancy)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    // Ví chính: Ví bị trừ tiền (Chi), hoặc ví nhận tiền (Thu), hoặc ví nguồn (Chuyển khoản)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    Wallet wallet;
    // Ví nhận tiền: Chỉ dùng khi type = TRANSFER
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_wallet_id", nullable = true)
    Wallet destinationWallet;
    // Danh mục thu/chi: Nullable khi là chuyển khoản
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true)
    Category category;
    // Số tiền giao dịch (chuẩn 19 số, 4 số lẻ thập phân)
    @Column(nullable = false, precision = 19, scale = 4)
    BigDecimal amount;
    // Loại giao dịch: EXPENSE, INCOME, TRANSFER
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    TransactionType type;
    // Ngày giờ giao dịch thực tế
    @Column(name = "transaction_date", nullable = false)
    LocalDateTime transactionDate;
    // Ghi chú chi tiết giao dịch
    @Column(columnDefinition = "TEXT")
    String note;
    // Số dư ví ngay sau giao dịch (Audit trail & vẽ biểu đồ)
    @Column(name = "balance_after", precision = 19, scale = 4)
    BigDecimal balanceAfter;
    // Đường dẫn ảnh hóa đơn (hoặc ảnh quét từ AI)
    @Column(name = "image_url", length = 500)
    String imageUrl;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
