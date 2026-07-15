package org.example.backend.service.booking;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.booking.BookingRequest;
import org.example.backend.dto.response.booking.BookingResponse;
import org.example.backend.entity.BookingPayment.Booking;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.User.User;
import org.example.backend.enums.BookingStatus;
import org.example.backend.enums.NotificationType;
import org.example.backend.enums.PlaceType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.booking.BookingMapper;
import org.example.backend.repository.booking.BookingRepository;
import org.example.backend.repository.place.PlaceRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.example.backend.service.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class BookingService {
    BookingRepository bookingRepository;
    PlaceRepository placeRepository;
    BookingMapper bookingMapper;
    AuthenticationService authenticationService;
    NotificationService notificationService;

    public BookingResponse createBooking(BookingRequest request) {
        User user = authenticationService.getUserByContext();
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new AppException(ErrorCode.PLACE_NOT_FOUND));
        // 1. Ngày nhận không được ở quá khứ
        if (request.getCheckIn().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày nhận phòng không được ở trong quá khứ!");
        }
        // 2. Ngày trả phòng phải sau ngày nhận phòng
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày trả phòng phải sau ngày nhận phòng!");
        }
        long activeBookings = bookingRepository.countOverlappingBookings(
                request.getPlaceId(),
                request.getCheckIn(),
                request.getCheckOut(),
                BookingStatus.CONFIRMED
        );
        if(place.getType() == PlaceType.ATTRACTION){
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Địa điểm này là khu du lịch/danh lam thắng cảnh, không hỗ trợ dịch vụ đặt chỗ trước!"
            );
        }
        if(place.getMax_slots() != null && activeBookings >= place.getMax_slots()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa điểm đã hết chỗ trống vào khoảng thời gian này!");
        }
        Booking booking = Booking.builder()
                .user(user)
                .place(place)
                .check_in(request.getCheckIn())
                .check_out(request.getCheckOut())
                .status(BookingStatus.PENDING)
                .total_price(request.getTotalPrice())
                .note(request.getNote())
                .build();
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Đặt chỗ thành công! ID: {}", savedBooking.getId());
        notificationService.createNotification(
                user,
                "Đơn đặt chỗ mới đang chờ thanh toán",
                "Đơn đặt chỗ của bạn tại " + place.getName() + " từ ngày " + request.getCheckIn() + " đến ngày " + request.getCheckOut() + " đã được tạo thành công và đang chờ thanh toán.",
                NotificationType.BOOKING,
                savedBooking.getId()
        );
        return bookingMapper.toBookingResponse(savedBooking);
    }
    public List<BookingResponse> getBookings() {
        User user = authenticationService.getUserByContext();
        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        return bookings.stream().map(bookingMapper :: toBookingResponse).toList();
    }
    public BookingResponse cancelBooking(String bookingId) {
        User user = authenticationService.getUserByContext();

        var booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        if (booking.getCheck_in().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy giao dịch đặt chỗ đã hoặc đang diễn ra!");
        }
        if(!booking.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Đã hủy đặt chỗ ID: {}", bookingId);
        return bookingMapper.toBookingResponse(updatedBooking);
    }

}
