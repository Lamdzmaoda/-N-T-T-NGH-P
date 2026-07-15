package org.example.backend.dto.request.trip;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripGenerateRequest {
    String destination;      // Điểm đến (ví dụ: "Đà Nẵng")
    LocalDate startDate;     // Ngày đi
    LocalDate endDate;       // Ngày về
    String budget;
    List<String> preferences;// Sở thích (ví dụ: ["beach", "seafood"])
    String departurePlace;   // Điểm đi (Ví dụ: "Hà Nội")
    Double userLat;          // Tọa độ GPS vĩ độ hiện tại của khách
    Double userLng;          // Tọa độ GPS kinh độ hiện tại của khách
}
