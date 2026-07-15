package org.example.backend.dto.response.booking;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.PaymentMethod;
import org.example.backend.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String id;
    String bookingId;
    BigDecimal amount;
    PaymentMethod method;
    PaymentStatus status;
    String transactionId;
    LocalDateTime createAt;
}
