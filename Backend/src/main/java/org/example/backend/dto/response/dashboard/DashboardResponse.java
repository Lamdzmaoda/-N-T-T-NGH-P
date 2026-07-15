package org.example.backend.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardResponse {
    Long totalUsers;
    Long totalTrips;
    Long totalBookings;
    BigDecimal totalRevenue;
    Map<String, Long> tripStatusRatio;
    Map<String, Long> popularDestinations;
}
