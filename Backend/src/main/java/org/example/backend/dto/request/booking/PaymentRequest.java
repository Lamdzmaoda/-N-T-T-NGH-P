package org.example.backend.dto.request.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.PaymentMethod;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    @NotBlank(message = "BOOKING_ID_REQUIRED")
    String bookingId;

    @NotNull(message = "PAYMENT_METHOD_REQUIRED")
    PaymentMethod method;
}
