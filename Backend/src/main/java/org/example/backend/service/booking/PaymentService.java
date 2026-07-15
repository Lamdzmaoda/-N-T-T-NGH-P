package org.example.backend.service.booking;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.booking.PaymentRequest;
import org.example.backend.dto.response.booking.PaymentResponse;
import org.example.backend.entity.BookingPayment.Booking;
import org.example.backend.entity.BookingPayment.Payment;
import org.example.backend.entity.User.User;
import org.example.backend.enums.BookingStatus;
import org.example.backend.enums.NotificationType;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.booking.PaymentMapper;
import org.example.backend.repository.booking.BookingRepository;
import org.example.backend.repository.booking.PaymentRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.example.backend.service.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.access.prepost.PreAuthorize;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class PaymentService {
    PaymentRepository paymentRepository;
    BookingRepository bookingRepository;
    PaymentMapper paymentMapper;
    AuthenticationService authenticationService;
    NotificationService notificationService;

    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        User user = authenticationService.getUserByContext();

        Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if(!booking.getUser().getId().equals(user.getId())){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if(paymentRepository.findByBookingId(booking.getId()).isPresent()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn đặt chỗ này đã được thanh toán rồi!");
        }
        String transactionId = paymentRequest.getMethod().name() + "_" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotal_price())
                .method(paymentRequest.getMethod())
                .status(PaymentStatus.PAID)
                .transaction_id(transactionId)
                .build();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Thanh toán thành công cho đơn đặt chỗ: {}, Mã giao dịch: {}", booking.getId(), transactionId);
        notificationService.createNotification(
                user,
                "Thanh toán đặt chỗ thành công",
                "Đơn đặt chỗ của bạn tại " + booking.getPlace().getName() + " đã được thanh toán thành công. Mã giao dịch: " + transactionId + ".",
                NotificationType.PAYMENT,
                booking.getId()
        );
        return paymentMapper.toPaymentResponse(savedPayment);

    }
    public PaymentResponse getPaymentByBooking(String bookingId) {
        User user = authenticationService.getUserByContext();
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        boolean isAdmin = user.getRoles().stream().anyMatch(role ->
            role.getName().equals("ROLE_ADMIN")
        );
        if(!booking.getUser().getId().equals(user.getId()) && !isAdmin){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return paymentMapper.toPaymentResponse(payment);
    }
}
