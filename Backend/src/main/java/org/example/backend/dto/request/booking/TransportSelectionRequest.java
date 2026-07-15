package org.example.backend.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransportSelectionRequest {
    @NotNull(message = "SELECTIONS_REQUIRED")
    List<SelectionItem> selections;
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SelectionItem {
        String fromItineraryId;
        String toItineraryId;
        Boolean isLongDistance;
        String departurePlace;
        String destinationPlace;
        String providerName;
        String vehicleType;
        BigDecimal price;
        Double distanceKm;
        Double durationMinutes;
    }
}
