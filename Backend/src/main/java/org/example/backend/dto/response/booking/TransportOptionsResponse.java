package org.example.backend.dto.response.booking;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class TransportOptionsResponse {
    String tripId;
    List<LongDistanceRoute> longDistanceRoutes;
    List<LocalRoute> localRoutes;
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class LongDistanceRoute {
        String departurePlace;
        String destinationPlace;
        List<ServiceOption> options;
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class LocalRoute {
        Integer dayNumber;
        String fromItineraryId;
        String toItineraryId;
        String fromPlaceName;
        String toPlaceName;
        Double distanceKm;
        List<ServiceOption> options;
    }
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class ServiceOption {
        String providerName; // "Grab", "XanhSM", "Be", "Vietnam Airlines", "Vietjet"
        String vehicleType;  // "Bike", "Car", "Luxury Car", "Economy Class"
        BigDecimal price;
        Double durationMinutes;
    }
}
