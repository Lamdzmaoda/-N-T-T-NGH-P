package org.example.backend.controller.booking;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.booking.BookingRequest;
import org.example.backend.dto.response.booking.BookingResponse;
import org.example.backend.service.booking.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;
    // 1. API Đặt chỗ mới: POST /bookings (Yêu cầu đăng nhập)
    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }
    // 2. API Lấy danh sách lịch sử đặt chỗ của tôi: GET /bookings
    @GetMapping
    public ApiResponse<List<BookingResponse>> getMyBookings() {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookings())
                .build();
    }
    // 3. API Hủy đặt chỗ: POST /bookings/{bookingId}/cancel
    @PostMapping("/{bookingId}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(@PathVariable String bookingId) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.cancelBooking(bookingId))
                .build();
    }
}