package org.example.backend.entity.BookingPayment;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.PaymentMethod;
import org.example.backend.enums.PaymentStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    Booking booking;
    BigDecimal amount;
    @Enumerated(EnumType.STRING)
    PaymentMethod method;
    @Enumerated(EnumType.STRING)
    PaymentStatus status;
    String transaction_id;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
