package org.example.backend.dto.request.trip;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItineraryUpdateRequest {
    String startTime;   // Giờ hoạt động mới (ví dụ: "09:00")
    String note;        // Ghi chú hoạt động mới
}
