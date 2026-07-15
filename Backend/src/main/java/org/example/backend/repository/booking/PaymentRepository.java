package org.example.backend.repository.booking;

import org.example.backend.entity.BookingPayment.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.backend.enums.PaymentStatus;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment,String> {
    Optional<Payment> findByBookingId(String bookingId);
    List<Payment> findByBookingUserId(String userId);
    List<Payment> findByStatus(PaymentStatus status);
}
