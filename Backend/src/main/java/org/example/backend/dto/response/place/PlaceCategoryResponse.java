package org.example.backend.dto.response.place;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.Places.PlaceCategory;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PlaceCategoryResponse {
    String id;
    String name;
    PlaceCategoryResponse parent;
    LocalDateTime create_at;
    LocalDateTime update_at;
}
