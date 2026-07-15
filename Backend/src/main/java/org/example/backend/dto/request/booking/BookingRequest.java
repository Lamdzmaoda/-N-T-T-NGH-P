package org.example.backend.dto.request.booking;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    String placeId;       // ID địa điểm muốn đặt (Khách sạn/nhà hàng...)
    LocalDate checkIn;    // Ngày nhận phòng/sử dụng
    LocalDate checkOut;   // Ngày trả phòng/kết thúc
    BigDecimal totalPrice;// Tổng số tiền dự kiến
    String note;          // Yêu cầu đặc biệt (ví dụ: phòng không hút thuốc)
}
