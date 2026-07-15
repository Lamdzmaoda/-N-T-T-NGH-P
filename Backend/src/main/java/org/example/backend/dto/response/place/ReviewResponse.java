package org.example.backend.dto.response.place;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.response.auth.UserResponse;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    String id;
    UserResponse user;
    PlaceResponse place;
    int rating;
    String comment;
    String photos;
}
