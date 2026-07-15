package org.example.backend.mapper.booking;

import org.example.backend.dto.response.booking.PaymentResponse;
import org.example.backend.entity.BookingPayment.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(source = "booking.id", target = "bookingId")
    @Mapping(source = "transaction_id", target = "transactionId")
    @Mapping(source = "create_at", target = "createAt")
    PaymentResponse toPaymentResponse(Payment payment);
}
