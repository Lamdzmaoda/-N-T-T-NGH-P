package org.example.backend.entity.Trips;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "trip_transport")
public class TripTransport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    Trip trip;
    // Liên kết chặng đi giữa 2 điểm dừng trong lịch trình
    String fromItineraryId;
    String toItineraryId;
    // Sử dụng cho chặng bay dài đến địa điểm du lịch
    Boolean isLongDistance;
    String departurePlace;
    String destinationPlace;
    String providerName;   // Ví dụ: "XanhSM", "Grab", "Be", "Vietnam Airlines", "Vietjet"
    String vehicleType;    // Ví dụ: "Bike", "Car", "Luxury Car", "Economy Class"
    BigDecimal price;      // Giá tiền người dùng chọn
    Double distanceKm;
    Double durationMinutes;
}