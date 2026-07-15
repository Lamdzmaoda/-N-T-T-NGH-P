package org.example.backend.dto.response.place;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.PlaceType;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlaceResponse {
    String id;
    String name;
    PlaceType type;
    String google_place_id;
    String photos;
    boolean isLiked;
    String opening_hours;
    String price_range;
    Integer max_slots;
    Boolean is_visible;
    String address;
    Double lat;
    Double lng;
    String description;
    Double avg_rating;
    PlaceCategoryResponse placeCategory;
}
