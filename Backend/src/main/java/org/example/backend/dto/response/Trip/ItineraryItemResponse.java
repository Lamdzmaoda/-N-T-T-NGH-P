package org.example.backend.dto.response.Trip;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.response.place.PlaceResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ItineraryItemResponse {
    String id;
    Integer day_number;
    Integer order_index;
    String start_time;
    String note;
    PlaceResponse place;
}
