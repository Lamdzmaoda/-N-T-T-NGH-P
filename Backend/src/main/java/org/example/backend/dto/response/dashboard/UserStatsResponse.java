package org.example.backend.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatsResponse {
    Long totalTrips;
    Long totalBookings;
    BigDecimal totalSpent;
    Double totalDistanceTraveledKm;
}
