package org.example.backend.dto.response.Trip;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.TripStatus;

import java.time.LocalDate;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TripResponse {
    String id;
    String title;
    LocalDate start_date;
    LocalDate end_date;
    Boolean is_favorite;
    TripStatus status;
    List<ItineraryItemResponse> itineraries;
}
