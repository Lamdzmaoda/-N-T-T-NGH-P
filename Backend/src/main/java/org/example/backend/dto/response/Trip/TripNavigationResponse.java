package org.example.backend.dto.response.Trip;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripNavigationResponse {
    String tripId;
    String tripTitle;
    String status;
    List<NavigationDay> days;
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class NavigationDay {
        Integer dayNumber;
        List<NavigationStep> steps;
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class NavigationStep {
        String fromPlaceName;
        String toPlaceName;
        Double distanceKm;
        Double durationMinutes;
        String providerName;
        String vehicleType;
        BigDecimal price;
        String googleMapsUrl; // Link chỉ đường Google Maps Deep Link
        String navigationInstruction; // Hướng dẫn chi tiết bằng chữ
        Boolean isLongDistance;
        String fromItineraryId;
    }
}