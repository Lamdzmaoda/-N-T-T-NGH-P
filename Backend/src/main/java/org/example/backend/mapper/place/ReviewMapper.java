package org.example.backend.mapper.place;

import org.example.backend.dto.request.place.PlaceRequest;
import org.example.backend.dto.request.place.ReviewRequest;
import org.example.backend.dto.response.place.PlaceResponse;
import org.example.backend.dto.response.place.ReviewResponse;
import org.example.backend.entity.Engagement.Review;
import org.example.backend.entity.Places.Place;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    Review toReview(ReviewRequest request);
    ReviewResponse toReviewResponse(Review review);
    @Mapping(target = "place", ignore = true)
    void updateReview (ReviewRequest request, @MappingTarget Review review);
}
