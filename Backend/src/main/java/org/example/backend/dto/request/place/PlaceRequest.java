package org.example.backend.dto.request.place;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.Places.PlaceCategory;
import org.example.backend.enums.PlaceType;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlaceRequest {
    String name;
    PlaceType type;
    String google_place_id;
    String photos;
    String opening_hours;
    String price_range;
    Integer max_slots;
    Boolean is_visible;
    String address;
    Double lat;
    Double lng;
    String description;
    String categoryId;
}
