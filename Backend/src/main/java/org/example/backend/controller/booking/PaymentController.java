package org.example.backend.controller.booking;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.booking.PaymentRequest;
import org.example.backend.dto.response.booking.PaymentResponse;
import org.example.backend.service.booking.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    @PostMapping
    public ApiResponse<PaymentResponse> pay(@RequestBody @Valid PaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.processPayment(request))
                .build();
    }
    @GetMapping("/booking/{bookingId}")
    public ApiResponse<PaymentResponse> getPaymentByBooking(@PathVariable String bookingId) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByBooking(bookingId))
                .build();
    }
}
