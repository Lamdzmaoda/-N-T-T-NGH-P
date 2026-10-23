package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.WalletType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: Mặc định mọi trường là 'private'
@Entity
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    @Column(nullable = false, length = 100)
    String name;
    // Chuẩn tiền tệ: 19 chữ số, 4 số thập phân, mặc định 0
    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    BigDecimal balance = BigDecimal.ZERO;
    @Column(nullable = false, length = 10)
    @Builder.Default
    String currency = "VND"; // Chốt phạm vi 1 loại tiền tệ theo phản biện
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    WalletType type;
    @Column(name = "include_in_total", nullable = false)
    @Builder.Default
    Boolean includeInTotal = true;
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true; // Xóa mềm (soft-delete)
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
