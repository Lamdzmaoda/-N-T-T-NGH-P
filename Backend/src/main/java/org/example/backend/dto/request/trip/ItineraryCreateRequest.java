package org.example.backend.dto.request.trip;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItineraryCreateRequest {
    String tripId;      // ID chuyến đi muốn thêm vào
    String placeId;     // ID địa điểm muốn thêm
    Integer dayNumber;  // Ngày thứ mấy (ví dụ: ngày 1, ngày 2)
    String startTime;   // Giờ hoạt động (ví dụ: "10:00")
    String note;        // Ghi chú hoạt động (ví dụ: "Ăn trưa")
}
