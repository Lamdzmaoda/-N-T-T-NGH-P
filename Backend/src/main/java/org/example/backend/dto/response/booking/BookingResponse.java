package org.example.backend.dto.response.booking;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String id;            // ID của giao dịch đặt chỗ vừa tạo
    String placeId;       // ID địa điểm đã đặt
    LocalDate checkIn;    // Ngày nhận
    LocalDate checkOut;   // Ngày trả
    BookingStatus status; // Trạng thái (PENDING, CONFIRMED, CANCELLED...)
    BigDecimal totalPrice;// Tổng tiền thực tế
    String note;          // Ghi chú
}
